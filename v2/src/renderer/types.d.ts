export interface ISnippet {
  id: string
  title: string | null
  tags: string[]
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

export interface IAPI {
  getSnippets: () => Promise<ISnippet[]>
  createSnippet: (title: string) => Promise<ISnippet>
  updateSnippet: (id: string, data: Partial<ISnippet>) => Promise<ISnippet>
  deleteSnippet: (id: string) => Promise<string>
  getFragments: (snippetId: string) => Promise<IFragment[]>
  saveFragment: (fragment: IFragment) => Promise<IFragment>
  deleteFragment: (id: string) => Promise<string>
}

declare global {
  interface Window {
    api: IAPI
  }
}
