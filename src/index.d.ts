/* eslint-disable no-unused-vars */
import { IpcRenderer } from "electron";
import { Fragment, ActiveFragment, Snippet } from "models";

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
  }>;
  updateSnippet: (data: object) => Promise<{
    status: boolean;
  }>;
  updateFragment: (data: object) => Promise<{
    status: boolean;
  }>;
  updateActiveFragment: (data: object) => Promise<{
    status: boolean;
  }>;
  getSnippet: (snippetId: number) => Promise<JSON>;
  getFragment: (fragmentId: number) => Promise<Fragment>;
  getActiveFragment: (snippetId: number) => Promise<ActiveFragment>;
  loadSnippets: () => Promise<Snippet[]>;
  fetchFragments: (snippetId: number) => Promise<Fragment[]>;
  openByMenu: (
    listener: (_e: Event, fileData: FileData) => void
  ) => Electron.IpcRenderer;
  openSettings: (
    listener: (_e: Event, elementName: string) => void
  ) => Electron.IpcRenderer;
  saveFragment: (listener: (_e: Event) => void) => Electron.IpcRenderer;
}

// Override properties with type intersection
// https://dev.to/vborodulin/ts-how-to-override-properties-with-type-intersection-554l
export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
