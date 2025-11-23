import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Settings } from './components/Settings'
import type { ISnippet, ISettings } from './types'

function App(): JSX.Element {
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null)
  const [snippets, setSnippets] = useState<ISnippet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<ISettings | null>(null)

  const loadSnippets = useCallback(async () => {
    const data = await window.api.getSnippets()
    setSnippets(data)
  }, [])

  const loadSettings = useCallback(async () => {
    const data = await window.api.getSettings()
    setSettings(data)
  }, [])

  useEffect(() => {
    loadSnippets()
    loadSettings()
  }, [loadSnippets, loadSettings])

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

  const handleCreateSnippet = async () => {
    const newSnippet = await window.api.createSnippet('Untitled Snippet')
    await loadSnippets()
    setActiveSnippetId(newSnippet.id)
  }

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return
    await window.api.deleteSnippet(id)
    await loadSnippets()
    if (activeSnippetId === id) {
      setActiveSnippetId(null)
    }
  }

  if (!settings) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        snippets={filteredSnippets}
        activeSnippetId={activeSnippetId}
        onSelectSnippet={setActiveSnippetId}
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
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-white dark:bg-gray-800 transition-colors duration-200">
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
