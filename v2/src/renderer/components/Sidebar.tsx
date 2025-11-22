import type { ISnippet } from '../types'

export function Sidebar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
  onCreateSnippet
}: {
  snippets: ISnippet[]
  activeSnippetId: string | null
  onSelectSnippet: (id: string) => void
  onCreateSnippet: () => void
}) {
  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateSnippet}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          New Snippet
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {snippets.map(snippet => (
          <div
            key={snippet.id}
            onClick={() => onSelectSnippet(snippet.id)}
            className={`p-3 cursor-pointer hover:bg-gray-200 ${activeSnippetId === snippet.id ? 'bg-white border-l-4 border-blue-500' : ''}`}
          >
            <h3 className="font-medium text-gray-800 truncate">{snippet.title || 'Untitled'}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(snippet.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
