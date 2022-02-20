// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  fileSaveAs: (fileData) => ipcRenderer.invoke("file-save-as", fileData),
  openByMenu: (listener) => ipcRenderer.on("open-by-menu", listener),
  openSettings: (listener) => ipcRenderer.on("open-settings", listener),
  saveFragment: (listener) => ipcRenderer.on("save-fragment", listener),
  newSnippet: (listener) => ipcRenderer.on("new-snippet", listener),
  createSnippet: () => ipcRenderer.invoke("create-snippet"),
  setupStorage: () => ipcRenderer.invoke("setup-storage"),
  updateSnippet: (data) => ipcRenderer.invoke("update-snippet", data),
  updateFragment: (data) => ipcRenderer.invoke("update-fragment", data),
  updateActiveFragment: (data) =>
    ipcRenderer.invoke("update-active-fragment", data),
  loadSnippets: () => ipcRenderer.invoke("load-snippets"),
  loadLanguages: () => ipcRenderer.invoke("load-languages"),
  fetchFragments: (snippetId) =>
    ipcRenderer.invoke("fetch-fragments", snippetId),
  getSnippet: (snippetId) => ipcRenderer.invoke("get-snippet", snippetId),
  getFragment: (fragmentId) => ipcRenderer.invoke("get-fragment", fragmentId),
  getActiveFragment: (snippetId) =>
    ipcRenderer.invoke("get-active-fragment", snippetId),
});

console.log("preload!");
