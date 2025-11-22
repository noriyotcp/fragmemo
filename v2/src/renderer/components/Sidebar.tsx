import type { ISnippet } from '../types'

export function Sidebar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
  onCreateSnippet,
  onDeleteSnippet
}: {
  snippets: ISnippet[]
  activeSnippetId: string | null
  onSelectSnippet: (id: string) => void
  onCreateSnippet: () => void
  onDeleteSnippet: (id: string) => void
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
        {snippets.map((snippet) => (
          <div
            key={snippet.id}
            className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex justify-between items-center group ${
              snippet.id === activeSnippetId ? 'bg-white border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => onSelectSnippet(snippet.id)}
          >
            <div className="truncate flex-1">
              <div className="font-medium text-sm truncate">{snippet.title || 'Untitled'}</div>
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
