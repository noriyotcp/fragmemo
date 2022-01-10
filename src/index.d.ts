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
  setupStorage: () => Promise<{
    status: boolean;
    msg: string;
    snippets: [];
  }>;
  updateSnippet: (data: object) => Promise<{
    status: boolean;
  }>;
  fetchFragments: (snippetId: number) => Promise<string>;
  openByMenu: (
    listener: (_e: Event, fileData: FileData) => void
  ) => Electron.IpcRenderer;
  openSettings: (
    listener: (_e: Event, elementName: string) => void
  ) => Electron.IpcRenderer;
}

// Override properties with type intersection
// https://dev.to/vborodulin/ts-how-to-override-properties-with-type-intersection-554l
export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
