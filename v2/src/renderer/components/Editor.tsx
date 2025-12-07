import { useEffect, useState, useCallback, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import type { IFragment, ISnippet, ISettings } from '../types'

export function Editor({ snippetId, onUpdate, settings }: { snippetId: string; onUpdate: () => void; settings: ISettings }) {
  const [snippet, setSnippet] = useState<ISnippet | null>(null)
  const [fragments, setFragments] = useState<IFragment[]>([])
  const [loading, setLoading] = useState(true)
  const [tagInput, setTagInput] = useState('')

  const [activeFragmentId, setActiveFragmentId] = useState<string | null>(null)
  const activeFragmentIdRef = useRef<string | null>(null)
  const fragmentsRef = useRef<IFragment[]>([])
  const editorRef = useRef<any>(null)
  const saveTimeoutRef = useRef<number | null>(null)
  const restoredIds = useRef<Set<string>>(new Set())
  const viewStatesRef = useRef<Record<string, any>>({}) // Store view states without re-rendering

  // Sync activeFragmentId ref
  useEffect(() => {
    activeFragmentIdRef.current = activeFragmentId
  }, [activeFragmentId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [snippetsData, fragmentsData] = await Promise.all([
        window.api.getSnippets(),
        window.api.getFragments(snippetId)
      ])

      const currentSnippet = snippetsData.find(s => s.id === snippetId) || null
      setSnippet(currentSnippet)

      setFragments(fragmentsData)
      fragmentsRef.current = fragmentsData

      // Restore active fragment from DB or fallback to first fragment
      if (fragmentsData.length > 0) {
        const savedActiveId = currentSnippet?.activeFragmentId
        const validSavedId = savedActiveId && fragmentsData.find(f => f.id === savedActiveId)
        setActiveFragmentId(validSavedId ? savedActiveId : fragmentsData[0].id)
      }
    } finally {
      setLoading(false)
    }
  }, [snippetId]) // Remove activeFragmentId dependency to prevent loop

  // Initialize viewStatesRef from loaded fragments
  useEffect(() => {
    fragments.forEach(f => {
      if (f.viewState) {
        viewStatesRef.current[f.id] = f.viewState
      }
    })
  }, [fragments])

  // Restore view state when active fragment changes (Tab switching)
  useEffect(() => {
    if (!activeFragmentId || !editorRef.current) return

    // Check if we need to restore
    const fragment = fragments.find(f => f.id === activeFragmentId)
    if (fragment?.viewState && !restoredIds.current.has(fragment.id)) {
      try {
        // Delay to allow editor model switch to propagate?
        // Monaco handles model switch synchronously usually, but restoring state might need a tick
        setTimeout(() => {
            if (activeFragmentId === fragment.id) { // Ensure likely still active
             editorRef.current.restoreViewState(fragment.viewState)
             restoredIds.current.add(fragment.id)
            }
        }, 10)
      } catch (e) {
        console.error('Failed to restore view state', e)
      }
    } else {
        if (activeFragmentId) restoredIds.current.add(activeFragmentId)
    }
  }, [activeFragmentId, fragments])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateSnippetTitle = (title: string) => {
    if (!snippet) return
    const updated = { ...snippet, title }
    setSnippet(updated)
    window.api.updateSnippet(snippet.id, { title })
    onUpdate()
  }

  const handleUpdateFragment = (id: string, updates: Partial<IFragment>) => {
    const index = fragments.findIndex(f => f.id === id)
    if (index === -1) return

    const newFragments = [...fragments]
    newFragments[index] = { ...newFragments[index], ...updates }
    setFragments(newFragments)
    window.api.saveFragment(newFragments[index])
  }

  // Update fragmentsRef whenever fragments change
  useEffect(() => {
    fragmentsRef.current = fragments
  }, [fragments])

  const handleCreateFragment = async () => {
    const newFragment = {
      id: crypto.randomUUID(),
      snippetId,
      title: '',
      content: '',
      language: 'plaintext',
      order: fragments.length
    }
    await window.api.saveFragment(newFragment)
    const newFragments = [...fragments, newFragment]
    setFragments(newFragments)
    setActiveFragmentId(newFragment.id)

    // Persist active fragment to DB
    if (snippet) {
      window.api.updateSnippet(snippet.id, { activeFragmentId: newFragment.id })
    }
  }

  const handleDeleteFragment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // If this is the last fragment, delete the entire snippet
    if (fragments.length === 1) {
      if (!confirm('This is the last fragment. Delete the entire snippet?')) return
      if (snippet) {
        await window.api.deleteSnippet(snippet.id)
        onUpdate() // Refresh the snippet list
      }
      return
    }

    if (!confirm('Delete this fragment?')) return

    await window.api.deleteFragment(id)
    const newFragments = fragments.filter(f => f.id !== id)
    setFragments(newFragments)

    if (activeFragmentId === id) {
      setActiveFragmentId(newFragments.length > 0 ? newFragments[0].id : null)
    }
  }

  // Menu and keyboard shortcuts
  useEffect(() => {
    // Menu: Close Tab
    const unsubscribeCloseTab = window.api.onMenuCloseTab(async () => {
      if (!activeFragmentId) return

      // If this is the last fragment, delete the entire snippet
      if (fragments.length === 1) {
        if (confirm('This is the last fragment. Delete the entire snippet?')) {
          if (snippet) {
            await window.api.deleteSnippet(snippet.id)
            onUpdate() // Refresh the snippet list
          }
        }
        return
      }

      // Multiple fragments - just delete the active one
      if (confirm('Delete this fragment?')) {
        await window.api.deleteFragment(activeFragmentId)
        const newFragments = fragments.filter(f => f.id !== activeFragmentId)
        setFragments(newFragments)
        setActiveFragmentId(newFragments.length > 0 ? newFragments[0].id : null)
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+T: New Fragment
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        handleCreateFragment()
      }

      // Cmd+]: Next Fragment
      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        e.preventDefault()
        const currentIndex = fragments.findIndex(f => f.id === activeFragmentId)
        if (currentIndex !== -1 && fragments.length > 1) {
          const nextIndex = (currentIndex + 1) % fragments.length
          setActiveFragmentId(fragments[nextIndex].id)
          if (snippet) {
            window.api.updateSnippet(snippet.id, { activeFragmentId: fragments[nextIndex].id })
          }
        }
      }

      // Cmd+[: Previous Fragment
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault()
        const currentIndex = fragments.findIndex(f => f.id === activeFragmentId)
        if (currentIndex !== -1 && fragments.length > 1) {
          const prevIndex = (currentIndex - 1 + fragments.length) % fragments.length
          setActiveFragmentId(fragments[prevIndex].id)
          if (snippet) {
            window.api.updateSnippet(snippet.id, { activeFragmentId: fragments[prevIndex].id })
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      unsubscribeCloseTab()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeFragmentId, fragments, snippet])

  const activeFragment = fragments.find(f => f.id === activeFragmentId)

  if (loading) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-white dark:bg-[#1e1e1e] text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
      {/* Header Section */}
      <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700">
        <input
          type="text"
          value={snippet?.title || ''}
          onChange={(e) => handleUpdateSnippetTitle(e.target.value)}
          placeholder="Snippet Title"
          className="text-2xl font-bold w-full border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 p-0 bg-transparent text-gray-900 dark:text-gray-100"
        />
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {snippet?.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-sm"
            >
              {tag}
              <button
                onClick={() => {
                  if (!snippet) return
                  const updatedTags = snippet.tags.filter(t => t !== tag)
                  setSnippet({ ...snippet, tags: updatedTags })
                  window.api.updateSnippet(snippet.id, { tags: updatedTags })
                  onUpdate()
                }}
                className="hover:text-blue-900 dark:hover:text-blue-100"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="+ Add tag"
            className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                const newTag = tagInput.trim()
                if (newTag && snippet && !snippet.tags.includes(newTag)) {
                  const updatedTags = [...snippet.tags, newTag]
                  setSnippet({ ...snippet, tags: updatedTags })
                  window.api.updateSnippet(snippet.id, { tags: updatedTags })
                  onUpdate()
                  setTagInput('')
                }
              }
            }}
          />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 pt-2 gap-1 overflow-x-auto">
        {fragments.map((fragment) => (
          <div
            key={fragment.id}
            onClick={() => {
              setActiveFragmentId(fragment.id)
              if (snippet) {
                window.api.updateSnippet(snippet.id, { activeFragmentId: fragment.id })
              }
            }}
              className={`
                group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-t border-l border-r rounded-t-md select-none min-w-[120px] max-w-[200px] transition-colors
                ${activeFragmentId === fragment.id
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800 -mb-px text-gray-800 dark:text-gray-100 font-medium'
                  : 'bg-gray-100 dark:bg-gray-900 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}
              `}
          >
            <span className="truncate flex-1">{fragment.title || 'Untitled'}</span>
            <button
              onClick={(e) => handleDeleteFragment(fragment.id, e)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={handleCreateFragment}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded mb-1"
          title="New Fragment"
        >
          +
        </button>
      </div>

      {/* Editor Toolbar (Language & Title) */}
      {activeFragment && (
        <div className="flex items-center gap-4 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <input
            type="text"
            value={activeFragment.title || ''}
            onChange={(e) => handleUpdateFragment(activeFragment.id, { title: e.target.value })}
            placeholder="Fragment Name"
            className="text-sm border-none focus:ring-0 font-medium text-gray-700 dark:text-gray-200 w-48 bg-transparent"
          />
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <select
            value={activeFragment.language}
            onChange={(e) => handleUpdateFragment(activeFragment.id, { language: e.target.value })}
            className="text-xs border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 bg-transparent"
          >
            <option value="plaintext">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="python">Python</option>
          </select>
        </div>
      )}

      {/* Monaco Editor Area */}
      <div className="flex-1 relative">
        {activeFragment ? (
          <MonacoEditor
            height="100%"
            path={activeFragment.id} // Multi-model support
            defaultLanguage={activeFragment.language}
            language={activeFragment.language}
            defaultValue={activeFragment.content}
            value={activeFragment.content}
            theme={
              settings.theme === 'dark' ||
              (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                ? 'vs-dark'
                : 'vs'
            }
            onMount={(editor) => {
              editorRef.current = editor

              const currentId = activeFragment.id

              // Restore initial state if available from Ref (more reliable than state during rapid switches)
              // If not in ref, try fragment.viewState (initial load)
              const stateToRestore = viewStatesRef.current[currentId] || activeFragment.viewState

              if (stateToRestore && !restoredIds.current.has(currentId)) {
                try {
                  setTimeout(() => {
                      if (activeFragmentId === currentId && editorRef.current) {
                        editorRef.current.restoreViewState(stateToRestore)
                        restoredIds.current.add(currentId)
                      }
                  }, 0) // Immediate tick usually enough
                } catch (e) {
                  console.error('Failed to restore view state', e)
                }
              } else {
                 if (currentId) restoredIds.current.add(currentId)
              }

              // Event listeners for saving state
              const saveState = () => {
                const currentId = activeFragmentIdRef.current
                if (!editorRef.current || !currentId) return

                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
                saveTimeoutRef.current = window.setTimeout(() => {
                   if (!editorRef.current) return

                   // Get latest state
                   const currentViewState = editorRef.current.saveViewState()
                   if (!currentViewState) return

                   // Update ref immediately
                   viewStatesRef.current[currentId] = currentViewState

                   // Find current fragment using ref to ensure freshness
                   const currentFrag = fragmentsRef.current.find(f => f.id === currentId)
                   if (currentFrag) {
                      window.api.saveFragment({ ...currentFrag, viewState: currentViewState })
                   }
                }, 1000)
              }

              // We need fragments ref to access latest fragments inside the stable callback
              // But onMount closure doesn't have access to future refs.
              // BUT refs are stable objects, their .current property is mutable and readable.
              // So we can read fragmentsRef.current inside saveState!

              editor.onDidChangeCursorPosition(saveState)
              editor.onDidScrollChange(saveState)
            }}
            onChange={(value: string | undefined) => handleUpdateFragment(activeFragment.id, { content: value || '' })}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: settings.editorFontSize,
              fontFamily: settings.editorFontFamily,
              wordWrap: 'on',
              automaticLayout: true
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No fragments
          </div>
        )}
      </div>
    </div>
  )
}
