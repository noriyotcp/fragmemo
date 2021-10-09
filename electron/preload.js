// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  fileSaveAs: (fileData) => ipcRenderer.invoke("file-save-as", fileData),
  openByMenu: (listener) => ipcRenderer.on("open-by-menu", listener),
  setupStorage: () => ipcRenderer.invoke("setup-storage"),
});

console.log("preload!");
