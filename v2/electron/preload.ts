import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getSnippets: () => ipcRenderer.invoke('get-snippets'),
  createSnippet: (title: string) => ipcRenderer.invoke('create-snippet', title),
  updateSnippet: (id: string, data: object) => ipcRenderer.invoke('update-snippet', id, data),
  deleteSnippet: (id: string) => ipcRenderer.invoke('delete-snippet', id),
  getFragments: (snippetId: string) => ipcRenderer.invoke('get-fragments', snippetId),
  saveFragment: (fragment: unknown) => ipcRenderer.invoke('save-fragment', fragment),
  deleteFragment: (id: string) => ipcRenderer.invoke('delete-fragment', id)
})
