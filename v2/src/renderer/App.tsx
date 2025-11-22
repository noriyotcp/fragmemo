import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import type { ISnippet } from './types'

function App(): JSX.Element {
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null)
  const [snippets, setSnippets] = useState<ISnippet[]>([])

  const loadSnippets = useCallback(async () => {
    const data = await window.api.getSnippets()
    setSnippets(data)
  }, [])

  useEffect(() => {
    loadSnippets()
  }, [loadSnippets])

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

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        snippets={snippets}
        activeSnippetId={activeSnippetId}
        onSelectSnippet={setActiveSnippetId}
        onCreateSnippet={handleCreateSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />
      {activeSnippetId ? (
        <Editor
          snippetId={activeSnippetId}
          onUpdate={loadSnippets}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a snippet to start editing
        </div>
      )}
    </div>
  )
}

export default App
