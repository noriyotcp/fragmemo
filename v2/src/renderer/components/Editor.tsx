import { useEffect, useState, useCallback } from 'react'
import type { IFragment, ISnippet } from '../types'

export function Editor({ snippetId, onUpdate }: { snippetId: string; onUpdate: () => void }) {
  const [snippet, setSnippet] = useState<ISnippet | null>(null)
  const [fragments, setFragments] = useState<IFragment[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [snippetsData, fragmentsData] = await Promise.all([
        window.api.getSnippets(), // Inefficient: fetches all, but fine for now. Ideally getSnippet(id)
        window.api.getFragments(snippetId)
      ])

      const currentSnippet = snippetsData.find(s => s.id === snippetId) || null
      setSnippet(currentSnippet)

      if (fragmentsData.length === 0) {
        const newFragment = {
          id: crypto.randomUUID(),
          snippetId,
          title: '',
          content: '',
          language: 'plaintext',
          order: 0
        }
        await window.api.saveFragment(newFragment)
        setFragments([newFragment])
      } else {
        setFragments(fragmentsData)
      }
    } finally {
      setLoading(false)
    }
  }, [snippetId])

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

  const handleUpdateFragment = (index: number, updates: Partial<IFragment>) => {
    const newFragments = [...fragments]
    newFragments[index] = { ...newFragments[index], ...updates }
    setFragments(newFragments)
    window.api.saveFragment(newFragments[index])
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-white p-8">
      <div className="mb-6">
        <input
          type="text"
          value={snippet?.title || ''}
          onChange={(e) => handleUpdateSnippetTitle(e.target.value)}
          placeholder="Snippet Title"
          className="text-2xl font-bold w-full border-none focus:ring-0 placeholder-gray-300"
        />
      </div>

      {fragments.map((fragment, index) => (
        <div key={fragment.id} className="mb-8 border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-50 p-2 border-b border-gray-200 flex gap-2">
            <input
              type="text"
              value={fragment.title || ''}
              onChange={(e) => handleUpdateFragment(index, { title: e.target.value })}
              placeholder="Fragment Title"
              className="bg-transparent border-none focus:ring-0 font-medium text-sm flex-1"
            />
            <select
              value={fragment.language}
              onChange={(e) => handleUpdateFragment(index, { language: e.target.value })}
              className="text-xs border-gray-300 rounded"
            >
              <option value="plaintext">Plain Text</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="markdown">Markdown</option>
            </select>
            <button
              onClick={async () => {
                if (!confirm('Delete this fragment?')) return
                await window.api.deleteFragment(fragment.id)
                const newFragments = fragments.filter(f => f.id !== fragment.id)
                setFragments(newFragments)
              }}
              className="text-gray-400 hover:text-red-500 px-2"
              title="Delete Fragment"
            >
              ×
            </button>
          </div>
          <textarea
            value={fragment.content}
            onChange={(e) => handleUpdateFragment(index, { content: e.target.value })}
            className="w-full h-64 p-4 font-mono text-sm focus:outline-none resize-y"
            placeholder="Type your code here..."
          />
        </div>
      ))}

      <button
        onClick={async () => {
          const newFragment = {
            id: crypto.randomUUID(),
            snippetId,
            title: '',
            content: '',
            language: 'plaintext',
            order: fragments.length
          }
          await window.api.saveFragment(newFragment)
          setFragments([...fragments, newFragment])
        }}
        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        + Add Fragment
      </button>
    </div>
  )
}
