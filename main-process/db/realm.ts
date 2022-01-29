import Realm from "realm";

const SnippetSchema: Realm.ObjectSchema = {
  name: "Snippet",
  properties: {
    _id: "int",
    title: "string?",
    latestActiveFragmentId: "int",
    createdAt: "date",
    updatedAt: "date",
  },
  primaryKey: "_id",
};

class Snippet {
  _id = 0;
  title = "";
  latestActiveFragmentId = 0;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(data: Required<Snippet>) {
    Object.assign(this, data);
  }
}

const FragmentSchema: Realm.ObjectSchema = {
  name: "Fragment",
  properties: {
    _id: "int",
    title: "string?",
    content: "string?",
    snippet: "Snippet",
    createdAt: "date",
    updatedAt: "date",
  },
  primaryKey: "_id",
};

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

  public static schema: Realm.ObjectSchema = {
    name: "ActiveFragment",
    primaryKey: "_id",
    properties: {
      _id: "int",
      fragmentId: "int",
      snippetId: "int",
    },
  };

  constructor(data: Partial<ActiveFragment>) {
    Object.assign(this, data);
  }
}

// TODO: Snippt and Fragment also have own schema in Class.
const realmSchema = [SnippetSchema, FragmentSchema, ActiveFragment.schema];

export { Realm, realmSchema, Snippet, Fragment, ActiveFragment };
