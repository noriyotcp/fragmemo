interface Snippet {
  _id: number;
  title: string;
  snippetUpdate: SnippetUpdate;
}

interface Language {
  _idx: number;
  name: string;
  alias: string;
}

interface Fragment {
  _id: number;
  title: string;
  content: string;
  snippet: Snippet;
  language: Language;
}

interface ActiveFragment {
  _id: number;
  fragmentId: number;
  snippetId: number;
}

interface SnippetUpdate {
  _id: number;
  updatedAt: Date;
}

export { Snippet, Language, Fragment, ActiveFragment, SnippetUpdate };
