// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  // main process -> renderer process
  toggleSettings: (listener) => ipcRenderer.on("toggle-settings", listener),
  saveFragment: (listener) => ipcRenderer.on("save-fragment", listener),
  nextTab: (listener) => ipcRenderer.on("next-tab", listener),
  previousTab: (listener) => ipcRenderer.on("previous-tab", listener),
  newSnippet: (listener) => ipcRenderer.on("new-snippet", listener),
  newFragment: (listener) => ipcRenderer.on("new-fragment", listener),
  contextMenuCommandSnippetItem: (listener) =>
    ipcRenderer.on("context-menu-command-snippet-item", listener),
  contextMenuCommandFragmentTab: (listener) =>
    ipcRenderer.on("context-menu-command-fragment-tab", listener),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  // renderer process -> main process
  initSnippet: () => ipcRenderer.invoke("init-snippet"),
  initFragment: (snippetId) => ipcRenderer.invoke("init-fragment", snippetId),
  setupStorage: () => ipcRenderer.invoke("setup-storage"),
  newActiveSnippetHistory: (snippetId) =>
    ipcRenderer.invoke("new-active-snippet-history", snippetId),
  updateSnippet: (props) => ipcRenderer.invoke("update-snippet", props),
  updateFragment: (props) => ipcRenderer.invoke("update-fragment", props),
  deleteFragment: (ids) => ipcRenderer.invoke("delete-fragment", ids),
  deleteSnippet: (snippetId) => ipcRenderer.invoke("delete-snippet", snippetId),
  updateActiveFragment: (props) =>
    ipcRenderer.invoke("update-active-fragment", props),
  loadSnippets: () => ipcRenderer.invoke("load-snippets"),
  loadLanguages: () => ipcRenderer.invoke("load-languages"),
  loadFragments: (snippetId) => ipcRenderer.invoke("load-fragments", snippetId),
  getSnippet: (snippetId) => ipcRenderer.invoke("get-snippet", snippetId),
  getFragment: (fragmentId) => ipcRenderer.invoke("get-fragment", fragmentId),
  getActiveFragment: (snippetId) =>
    ipcRenderer.invoke("get-active-fragment", snippetId),
  getLatestActiveSnippetHistory: () =>
    ipcRenderer.invoke("get-latest-active-snippet-history"),
  getEditorSettings: () => ipcRenderer.invoke("get-editor-settings"),
  showContextMenuOnFragmentTab: () =>
    ipcRenderer.invoke("show-context-menu-on-fragment-tab"),
  showContextMenuOnSnippetItem: () =>
    ipcRenderer.invoke("show-context-menu-on-snippet-item"),
});

console.log("preload!");
