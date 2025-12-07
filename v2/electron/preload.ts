import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getSnippets: () => ipcRenderer.invoke('get-snippets'),
  createSnippet: (title: string) => ipcRenderer.invoke('create-snippet', title),
  updateSnippet: (id: string, data: object) => ipcRenderer.invoke('update-snippet', id, data),
  deleteSnippet: (id: string) => ipcRenderer.invoke('delete-snippet', id),
  getFragments: (snippetId: string) => ipcRenderer.invoke('get-fragments', snippetId),
  saveFragment: (fragment: unknown) => ipcRenderer.invoke('save-fragment', fragment),
  deleteFragment: (id: string) => ipcRenderer.invoke('delete-fragment', id),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (data: object) => ipcRenderer.invoke('update-settings', data),
  getAppState: () => ipcRenderer.invoke('get-app-state'),
  updateAppState: (data: object) => ipcRenderer.invoke('update-app-state', data),

  // Menu event listeners
  onMenuNewSnippet: (callback: () => void) => {
    ipcRenderer.on('menu:new-snippet', callback)
    return () => ipcRenderer.removeListener('menu:new-snippet', callback)
  },
  onMenuCloseTab: (callback: () => void) => {
    ipcRenderer.on('menu:close-tab', callback)
    return () => ipcRenderer.removeListener('menu:close-tab', callback)
  },
  onMenuOpenSettings: (callback: () => void) => {
    ipcRenderer.on('menu:open-settings', callback)
    return () => ipcRenderer.removeListener('menu:open-settings', callback)
  }
})
