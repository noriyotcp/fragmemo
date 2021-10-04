import { IpcRenderer } from "electron";

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    myAPI: Sandbox;
  }
}

export interface SandBox {
  openByMenu: (
    listener: (_e: Event, filepath: string) => void
  ) => Electron.IpcRenderer;
  storageFound: () => Promise;
}
