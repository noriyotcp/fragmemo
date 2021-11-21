import Realm from "realm";

class Snippet extends Realm.Object {
  public _id = 0;
  public title = "";
  public fragments!: Realm.List<Fragment>;

  public static schema: Realm.ObjectSchema = {
    name: "Snippet",
    properties: {
      _id: "int",
      title: "string?",
      fragments: "Fragment[]",
    },
    primaryKey: "_id",
  };
}

class Fragment extends Realm.Object {
  public _id = 0;
  public title = "";
  public content = "";
  public snippet!: Snippet;

  public static schema: Realm.ObjectSchema = {
    name: "Fragment",
    properties: {
      _id: "int",
      title: "string?",
      content: "string?",
      snippet: {
        type: "linkingObjects",
        objectType: "Snippet",
        property: "fragments",
      },
    },
    primaryKey: "_id",
  };
}

const realmSchema = [Snippet, Fragment];

export { Realm, realmSchema, Snippet };
