import type { ISnippet } from '../types'

export function Sidebar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
  onCreateSnippet,
  onDeleteSnippet,
  searchQuery,
  onSearchChange
}: {
  snippets: ISnippet[]
  activeSnippetId: string | null
  onSelectSnippet: (id: string) => void
  onCreateSnippet: () => void
  onDeleteSnippet: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}) {
  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search snippets..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={onCreateSnippet}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          New Snippet
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {snippets.map((snippet) => (
          <div
            key={snippet.id}
            className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex justify-between items-center group ${
              snippet.id === activeSnippetId ? 'bg-white border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => onSelectSnippet(snippet.id)}
          >
            <div className="truncate flex-1">
              <div className={`font-medium text-sm truncate ${!snippet.title ? 'text-gray-400 italic' : ''}`}>
                {snippet.title || 'Untitled'}
              </div>
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date(snippet.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteSnippet(snippet.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
              title="Delete Snippet"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
