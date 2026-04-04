export interface ISnippet {
  id: string
  title: string | null
  tags: string[]
  activeFragmentId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IFragment {
  id: string
  snippetId: string
  title: string | null
  content: string
  language: string
  order: number
  viewState?: unknown // Monaco ICodeEditorViewState
}

export interface ISettings {
  id: string
  theme: 'system' | 'light' | 'dark'
  editorFontSize: number
  editorFontFamily: string
  autosave: boolean
}

export interface IAppState {
  id: string
  activeSnippetId: string | null
  activeFragmentId: string | null
  sidebarWidth: number
  windowBounds: { x: number; y: number; width: number; height: number } | null
}

export interface IAPI {
  getSnippets: () => Promise<ISnippet[]>
  createSnippet: (title: string) => Promise<ISnippet>
  updateSnippet: (id: string, data: Partial<ISnippet>, options?: { silent?: boolean }) => Promise<ISnippet>
  deleteSnippet: (id: string) => Promise<string>
  getFragments: (snippetId: string) => Promise<IFragment[]>
  saveFragment: (fragment: IFragment) => Promise<IFragment>
  deleteFragment: (id: string) => Promise<string>
  updateFragmentState: (fragmentId: string, viewState: unknown) => Promise<void>
  // Settings
  getSettings: () => Promise<ISettings>
  updateSettings: (data: Partial<ISettings>) => Promise<ISettings>
  getAppState: () => Promise<IAppState>
  updateAppState: (data: Partial<IAppState>) => Promise<IAppState>

  // Menu event listeners
  onMenuNewSnippet: (callback: () => void) => () => void
  onMenuCloseTab: (callback: () => void) => () => void
  onMenuOpenSettings: (callback: () => void) => () => void
}

declare global {
  interface Window {
    api: IAPI
  }
}
