class Snippet {
  _id = 0;
  title = "";
  fragments!: Fragment[];
  createdAt = new Date();
  updatedAt = new Date();
  // TODO: should be Required
  constructor(data: Partial<Snippet>) {
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

export { Snippet, Fragment };
