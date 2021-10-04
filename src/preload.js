// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  openByMenu: (listener) => ipcRenderer.on("open-by-menu", listener),
  fileSaveAs: (fileData) => ipcRenderer.invoke("file-save-as", fileData),
  storageFound: () => ipcRenderer.invoke("storage-found"),
});

console.log("preload!");
