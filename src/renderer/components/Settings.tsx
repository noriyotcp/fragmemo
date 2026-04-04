import type { ISettings } from '../types'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: ISettings
  onUpdate: (data: Partial<ISettings>) => void
}

export function Settings({ isOpen, onClose, settings, onUpdate }: SettingsProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-w-full transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            ×
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => {
                const theme = e.target.value
                if (['system', 'light', 'dark'].includes(theme)) {
                  onUpdate({ theme: theme as ISettings['theme'] })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Controls both UI and Editor theme.
            </p>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Editor Font Size ({settings.editorFontSize}px)
            </label>
            <input
              type="range"
              min="10"
              max="24"
              step="1"
              value={settings.editorFontSize}
              onChange={(e) => onUpdate({ editorFontSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Editor Font Family</label>
            <select
              value={settings.editorFontFamily}
              onChange={(e) => onUpdate({ editorFontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="monospace">Monospace (Default)</option>
              <option value="sans-serif">Sans-serif</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
