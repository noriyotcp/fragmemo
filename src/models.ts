class Snippet {
  _id = 0;
  title = "";
  snippetUpdate!: SnippetUpdate;
}

class Language {
  public _idx = 0;
  public name = "";
  public alias = "";
}

class Fragment {
  public _id = 0;
  public title = "";
  public content = "";
  public snippet!: Snippet;
  public language!: Language;
}

class ActiveFragment {
  public _id = 0;
  public fragmentId = 0;
  public snippetId = 0;
}

class SnippetUpdate {
  public _id = 0;
  public updatedAt!: Date;
}

export { Snippet, Language, Fragment, ActiveFragment, SnippetUpdate };
