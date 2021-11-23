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
  public _id = 0;
  public title = "";
  public fragments!: Fragment[];
  public createdAt = new Date();
  public updatedAt = new Date();

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
  public snippet!: Snippet;
  public createdAt = new Date();
  public updatedAt = new Date();

  public static schema: typeof FragmentSchema = FragmentSchema;
}

const realmSchema = [Snippet.schema, Fragment.schema];

export { Realm, realmSchema, Snippet, Fragment };
