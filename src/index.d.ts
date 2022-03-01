/* eslint-disable no-unused-vars */
import { IpcRenderer } from "electron";
import { Fragment, ActiveFragment, Snippet, Language } from "models.d";

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    myAPI: SandBox;
  }
}

export interface IdsOnDeleteFragment {
  fragmentId: number;
  nextActiveFragmentId?: number;
}

export interface ISnippetProps {
  _id: number;
  properties: {
    title: string;
  };
}

export interface SandBox {
  setupStorage: () => Promise<void>;
  updateSnippet: (props: ISnippetProps) => Promise<{
    status: boolean;
  }>;
  updateFragment: (data: object) => Promise<{
    status: boolean;
  }>;
  deleteFragment: (data: IdsOnDeleteFragment) => Promise<void>;
  updateActiveFragment: (data: object) => Promise<{
    status: boolean;
  }>;
  getSnippet: (snippetId: number) => Promise<JSON>;
  initSnippet: () => Promise<void>;
  initFragment: (snippetId: number) => Promise<void>;
  getFragment: (fragmentId: number) => Promise<Fragment>;
  getActiveFragment: (snippetId: number) => Promise<ActiveFragment>;
  showContextMenu: () => void;
  loadSnippets: () => Promise<Snippet[]>;
  loadLanguages: () => Promise<Language[]>;
  fetchFragments: (snippetId: number) => Promise<Fragment[]>;
  openSettings: (
    listener: (_e: Event, elementName: string) => void
  ) => Electron.IpcRenderer;
  saveFragment: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  newSnippet: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  newFragment: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  nextTab: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  previousTab: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  contextMenuCommand: (
    listener: (_e: Event, command: string) => void
  ) => Electron.IpcRenderer;
}

// Override properties with type intersection
// https://dev.to/vborodulin/ts-how-to-override-properties-with-type-intersection-554l
export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
