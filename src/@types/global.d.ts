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
  setupStorage: () => Promise<string>;
  openByMenu: (
    listener: (_e: Event, fileData: FileData) => void
  ) => Electron.IpcRenderer;
  openSettings: (
    listener: (_e: Event, elementName: string) => void
  ) => Electron.IpcRenderer;
}
