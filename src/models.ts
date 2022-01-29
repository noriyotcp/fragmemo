class Snippet {
  _id = 0;
  title = "";
  createdAt = new Date();
  updatedAt = new Date();

  constructor(data: Required<Snippet>) {
    Object.assign(this, data);
  }
}

class Fragment {
  public _id = 0;
  public title = "";
  public content = "";
  public snippet!: Snippet; // TODO: Change required to optional?
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

export { Snippet, Fragment, ActiveFragment };
