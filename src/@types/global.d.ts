/* eslint-disable no-unused-vars */
import { IpcRenderer } from "electron";

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    myAPI: SandBox;
  }
}

export type FileData = {
  status: true;
  path: string;
  text: string;
};

export interface SandBox {
  fileSaveAs: (fileData: string) => void;
  openByMenu: (
    listener: (_e: Event, fileData: FileData) => void
  ) => Electron.IpcRenderer;
  setupStorage: () => Promise<string>;
}
