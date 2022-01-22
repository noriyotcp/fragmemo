// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  fileSaveAs: (fileData) => ipcRenderer.invoke("file-save-as", fileData),
  openByMenu: (listener) => ipcRenderer.on("open-by-menu", listener),
  openSettings: (listener) => ipcRenderer.on("open-settings", listener),
  setupStorage: () => ipcRenderer.invoke("setup-storage"),
  updateSnippet: (data) => ipcRenderer.invoke("update-snippet", data),
  fetchFragments: (snippetId) =>
    ipcRenderer.invoke("fetch-fragments", snippetId),
  getSnippet: (snippetId) => ipcRenderer.invoke("get-snippet", snippetId),
});

console.log("preload!");
