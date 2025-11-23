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
}

export interface ISettings {
  id: string
  theme: 'system' | 'light' | 'dark'
  editorFontSize: number
  editorFontFamily: string
  autosave: boolean
}

export interface IAPI {
  getSnippets: () => Promise<ISnippet[]>
  createSnippet: (title: string) => Promise<ISnippet>
  updateSnippet: (id: string, data: Partial<ISnippet>) => Promise<ISnippet>
  deleteSnippet: (id: string) => Promise<string>
  getFragments: (snippetId: string) => Promise<IFragment[]>
  saveFragment: (fragment: IFragment) => Promise<IFragment>
  deleteFragment: (id: string) => Promise<string>
  getSettings: () => Promise<ISettings>
  updateSettings: (data: Partial<ISettings>) => Promise<ISettings>
}

declare global {
  interface Window {
    api: IAPI
  }
}
