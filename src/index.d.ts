/* eslint-disable no-unused-vars */
import { IpcRenderer } from "electron";
import {
  Fragment,
  ActiveFragment,
  Snippet,
  Language,
  ActiveSnippetHistory,
} from "models.d";
import { ISnippetProps, IFragmentProps } from "props.d";

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

export interface SandBox {
  // main process -> renderer process
  toggleSettings: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  saveFragment: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  selectLanguage: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  nextTab: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  previousTab: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  newSnippet: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  newFragment: (listener: (_e: Event) => void) => Electron.IpcRenderer;
  contextMenuCommand: (
    listener: (_e: Event, command: string) => void
  ) => Electron.IpcRenderer;
  // renderer process -> main process
  initSnippet: () => Promise<Snippet>;
  initFragment: (snippetId: number) => Promise<void>;
  setupStorage: () => Promise<void>;
  newActiveSnippetHistory: (snippetId: number) => Promise<void>;
  updateSnippet: (props: ISnippetProps) => Promise<void>;
  updateFragment: (props: IFragmentProps) => Promise<{
    status: boolean;
  }>;
  deleteFragment: (ids: IdsOnDeleteFragment) => Promise<void>;
  updateActiveFragment: (props: {
    properties: { fragmentId: number; snippetId: number };
  }) => Promise<{
    status: boolean;
  }>;
  loadSnippets: () => Promise<Snippet[]>;
  loadLanguages: () => Promise<Language[]>;
  loadFragments: (snippetId: number) => Promise<Fragment[]>;
  getSnippet: (snippetId: number) => Promise<JSON>;
  getFragment: (fragmentId: number) => Promise<Fragment>;
  getActiveFragment: (snippetId: number) => Promise<ActiveFragment>;
  getLatestActiveSnippetHistory: () => Promise<ActiveSnippetHistory>;
  showContextMenuOnFragmentTab: () => void;
  showContextMenuOnSnippetItem: () => void;
}

// Override properties with type intersection
// https://dev.to/vborodulin/ts-how-to-override-properties-with-type-intersection-554l
export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
