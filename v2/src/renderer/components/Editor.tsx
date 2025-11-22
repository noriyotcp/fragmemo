import { useEffect, useState, useCallback } from 'react'
import MonacoEditor from '@monaco-editor/react'
import type { IFragment, ISnippet } from '../types'

export function Editor({ snippetId, onUpdate }: { snippetId: string; onUpdate: () => void }) {
  const [snippet, setSnippet] = useState<ISnippet | null>(null)
  const [fragments, setFragments] = useState<IFragment[]>([])
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [activeFragmentId, setActiveFragmentId] = useState<string | null>(null)

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

      // Restore active fragment from DB or fallback to first fragment
      if (fragmentsData.length > 0) {
        const savedActiveId = currentSnippet?.activeFragmentId
        const validSavedId = savedActiveId && fragmentsData.find(f => f.id === savedActiveId)
        setActiveFragmentId(validSavedId ? savedActiveId : fragmentsData[0].id)
      }
    } finally {
      setLoading(false)
    }
  }, [snippetId, activeFragmentId])

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
    if (!confirm('Delete this fragment?')) return

    await window.api.deleteFragment(id)
    const newFragments = fragments.filter(f => f.id !== id)
    setFragments(newFragments)

    if (activeFragmentId === id) {
      setActiveFragmentId(newFragments.length > 0 ? newFragments[0].id : null)
    }
  }

  const activeFragment = fragments.find(f => f.id === activeFragmentId)

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="flex-1 h-screen flex flex-col bg-white overflow-hidden">
      {/* Header Section */}
      <div className="p-6 pb-2 border-b border-gray-100">
        <input
          type="text"
          value={snippet?.title || ''}
          onChange={(e) => handleUpdateSnippetTitle(e.target.value)}
          placeholder="Snippet Title"
          className="text-2xl font-bold w-full border-none focus:ring-0 placeholder-gray-300 p-0"
        />
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {snippet?.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
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
                className="hover:text-blue-900"
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
            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
      <div className="flex items-center bg-gray-50 border-b border-gray-200 px-2 pt-2 gap-1 overflow-x-auto">
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
              group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-t border-l border-r rounded-t-md select-none min-w-[120px] max-w-[200px]
              ${activeFragmentId === fragment.id
                ? 'bg-white border-gray-200 border-b-white -mb-px text-gray-800 font-medium'
                : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'}
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
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-200 rounded mb-1"
          title="New Fragment"
        >
          +
        </button>
      </div>

      {/* Editor Toolbar (Language & Title) */}
      {activeFragment && (
        <div className="flex items-center gap-4 p-2 border-b border-gray-200 bg-white">
          <input
            type="text"
            value={activeFragment.title || ''}
            onChange={(e) => handleUpdateFragment(activeFragment.id, { title: e.target.value })}
            placeholder="Fragment Name"
            className="text-sm border-none focus:ring-0 font-medium text-gray-700 w-48"
          />
          <div className="h-4 w-px bg-gray-300"></div>
          <select
            value={activeFragment.language}
            onChange={(e) => handleUpdateFragment(activeFragment.id, { language: e.target.value })}
            className="text-xs border-gray-300 rounded text-gray-600"
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
            onChange={(value: string | undefined) => handleUpdateFragment(activeFragment.id, { content: value || '' })}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
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
