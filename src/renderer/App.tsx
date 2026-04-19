import { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Settings } from './components/Settings'
import type { ISnippet, ISettings } from './types'

function App() {
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null)
  const [snippets, setSnippets] = useState<ISnippet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<ISettings | null>(null)
  const [isRestored, setIsRestored] = useState(false)

  // Use ref to access latest search query in callbacks without dependency issues
  const searchQueryRef = useRef(searchQuery)
  useEffect(() => {
    searchQueryRef.current = searchQuery
  }, [searchQuery])

  const loadSnippets = useCallback(async () => {
    const data = await window.api.getSnippets()
    setSnippets(data)

    // Check if active snippet still exists
    if (activeSnippetId && !data.find(s => s.id === activeSnippetId)) {
      // If not, select the first one from the new data (respecting filter would be better but we don't have filtered list here easily)

      // Let's try to filter here using the current searchQuery state
      const query = searchQueryRef.current.toLowerCase()

      const filtered = data.filter(snippet => {
        if (!query) return true
        if (snippet.title?.toLowerCase().includes(query)) return true
        if (snippet.tags.some(tag => tag.toLowerCase().includes(query))) return true
        return false
      })

      if (filtered.length > 0) {
        setActiveSnippetId(filtered[0].id)
      } else {
        // If filtered list is empty, just clear selection (keep search query)
        setActiveSnippetId(null)
      }
    }
  }, [activeSnippetId])

  const loadSettings = useCallback(async () => {
    const data = await window.api.getSettings()
    setSettings(data)
  }, [])

  const loadAppState = useCallback(async () => {
    try {
      const appState = await window.api.getAppState()
      if (appState.activeSnippetId) {
        setActiveSnippetId(appState.activeSnippetId)
      }
    } catch (err) {
      console.error('Failed to load app state:', err)
    } finally {
      setIsRestored(true)
    }
  }, [])

  useEffect(() => {
    // Initial mount data load — setState runs once after async fetch, no cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAppState()
  }, [loadAppState])

  useEffect(() => {
    // Initial mount data load — setState runs once after async fetch, no cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSnippets()
    loadSettings()
  }, [loadSnippets, loadSettings])

  // Helper function to persist active snippet ID
  // Called from event handlers instead of useEffect (React best practice)
  const persistActiveSnippet = (snippetId: string | null) => {
    if (isRestored) {
      window.api.updateAppState({ activeSnippetId: snippetId })
    }
  }

  // Apply theme
  useEffect(() => {
    if (!settings) return

    const applyTheme = () => {
      const isDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    applyTheme()

    // Listen for system theme changes if in system mode
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [settings?.theme])

  const handleCreateSnippet = useCallback(async () => {
    const newSnippet = await window.api.createSnippet('Untitled Snippet')
    await loadSnippets()
    setActiveSnippetId(newSnippet.id)
    // Persist immediately after state change (user action)
    if (isRestored) {
      window.api.updateAppState({ activeSnippetId: newSnippet.id })
    }
  }, [loadSnippets, isRestored])

  // Menu event handlers
  useEffect(() => {
    const unsubscribeNewSnippet = window.api.onMenuNewSnippet(() => {
      handleCreateSnippet()
    })

    const unsubscribeOpenSettings = window.api.onMenuOpenSettings(() => {
      setIsSettingsOpen(true)
    })

    return () => {
      unsubscribeNewSnippet()
      unsubscribeOpenSettings()
    }
  }, [handleCreateSnippet])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+F: Focus search (always, regardless of context)
      // Use capture phase to intercept before Monaco Editor
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        e.stopPropagation() // Stop propagation to prevent Monaco from handling it if it has a conflict
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }
    }

    // Use capture phase (true) to handle event before it reaches target (e.g. editor)
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  const handleUpdateSettings = async (data: Partial<ISettings>) => {
    const updated = await window.api.updateSettings(data)
    setSettings(updated)
  }

  const filteredSnippets = snippets.filter(snippet => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()

    // Title match
    if (snippet.title?.toLowerCase().includes(query)) return true

    // Tag match
    if (snippet.tags.some(tag => tag.toLowerCase().includes(query))) return true

    return false
  })

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return
    await window.api.deleteSnippet(id)
    await loadSnippets()
    if (activeSnippetId === id) {
      setActiveSnippetId(null)
      // Persist the cleared state (user action)
      persistActiveSnippet(null)
    }
  }

  if (!settings) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        snippets={filteredSnippets}
        activeSnippetId={activeSnippetId}
        onSelectSnippet={(id) => {
          setActiveSnippetId(id)
          // Persist selection (user action)
          persistActiveSnippet(id)
        }}
        onCreateSnippet={handleCreateSnippet}
        onDeleteSnippet={handleDeleteSnippet}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      {activeSnippetId ? (
        <Editor
          snippetId={activeSnippetId}
          onUpdate={loadSnippets}
          settings={settings}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-white dark:bg-gray-800">
          Select a snippet to start editing
        </div>
      )}

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={handleUpdateSettings}
      />
    </div>
  )
}

export default App
