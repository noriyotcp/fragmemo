import { IpcRenderer } from "electron";

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    myAPI: SandBox;
  }
}

export interface SandBox {
  fileSaveAs: (fileData: string) => void;
  openByMenu: (
    listener: (_e: Event, fileData: object) => void
  ) => Electron.IpcRenderer;
  setupStorage: () => Promise;
}
