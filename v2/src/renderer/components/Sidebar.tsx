import type { ISnippet } from '../types'

export function Sidebar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
  onCreateSnippet,
  onDeleteSnippet,
  searchQuery,
  onSearchChange,
  onOpenSettings
}: {
  snippets: ISnippet[]
  activeSnippetId: string | null
  onSelectSnippet: (id: string) => void
  onCreateSnippet: () => void
  onDeleteSnippet: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onOpenSettings: () => void
}) {
  return (
    <div className="w-64 h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search snippets..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
            className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center group transition-colors ${
              snippet.id === activeSnippetId ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => onSelectSnippet(snippet.id)}
          >
            <div className="truncate flex-1">
              <div className={`font-medium text-sm truncate ${!snippet.title ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-900 dark:text-gray-100'}`}>
                {snippet.title || 'Untitled'}
              </div>
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <span>⚙️</span> Settings
        </button>
      </div>
    </div>
  )
}
