class Snippet {
  _id = 0;
  title = "";
  createdAt = new Date();
  updatedAt = new Date();
  snippetUpdate!: SnippetUpdate;

  constructor(data: Required<Snippet>) {
    Object.assign(this, data);
  }
}

class Language {
  public _idx = 0;
  public name = "";
  public alias = "";

  constructor(data: Required<Language>) {
    Object.assign(this, data);
  }
}

class Fragment {
  public _id = 0;
  public title = "";
  public content = "";
  public snippet!: Snippet; // TODO: Change required to optional?
  public language!: Language;
  public createdAt = new Date();
  public updatedAt = new Date();

  constructor(data: Partial<Fragment>) {
    Object.assign(this, data);
  }
}

class ActiveFragment {
  public _id = 0;
  public fragmentId = 0;
  public snippetId = 0;

  constructor(data: Partial<ActiveFragment>) {
    Object.assign(this, data);
  }
}

class SnippetUpdate {
  public _id = 0;
  public updatedAt!: Date;
}

export { Snippet, Fragment, ActiveFragment, Language, SnippetUpdate };
