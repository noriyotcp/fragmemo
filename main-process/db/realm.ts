import Realm from "realm";

const SnippetSchema: Realm.ObjectSchema = {
  name: "Snippet",
  properties: {
    _id: "int",
    title: "string?",
    fragments: "Fragment[]",
    createdAt: "date",
    updatedAt: "date",
  },
  primaryKey: "_id",
};

class Snippet {
  _id = 0;
  title = "";
  fragments!: Fragment[];
  createdAt = new Date();
  updatedAt = new Date();

  constructor(data: Required<Snippet>) {
    Object.assign(this, data);
  }

  public static schema: typeof SnippetSchema = SnippetSchema;
}

const FragmentSchema: Realm.ObjectSchema = {
  name: "Fragment",
  properties: {
    _id: "int",
    title: "string?",
    content: "string?",
    createdAt: "date",
    updatedAt: "date",
    snippet: {
      type: "linkingObjects",
      objectType: "Snippet",
      property: "fragments",
    },
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

  public static schema: typeof FragmentSchema = FragmentSchema;
}

const realmSchema = [SnippetSchema, FragmentSchema];

export { Realm, realmSchema, Snippet, Fragment };
