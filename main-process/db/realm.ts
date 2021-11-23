import Realm from "realm";

class Snippet {
  public _id = 0;
  public title = "";
  public fragments!: Fragment[];
  public createdAt = new Date();
  public updatedAt = new Date();

  public static schema: typeof SnippetSchema;
}

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

class Fragment {
  public _id = 0;
  public title = "";
  public content = "";
  public snippet!: Snippet;
  public createdAt = new Date();
  public updatedAt = new Date();

  public static schema: typeof FragmentSchema;
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

const realmSchema = [SnippetSchema, FragmentSchema];

export { Realm, realmSchema, Snippet, Fragment };
