import Realm from "realm";

class Snippet extends Realm.Object {
  public _id = 0;
  public title = "";
  public fragments!: Realm.List<Fragment>;
  public createdAt = new Date();
  public updatedAt = new Date();

  public static schema: Realm.ObjectSchema = {
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
}

class Fragment extends Realm.Object {
  public _id = 0;
  public title = "";
  public content = "";
  public snippet!: Snippet;
  public createdAt = new Date();
  public updatedAt = new Date();

  public static schema: Realm.ObjectSchema = {
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
}

const realmSchema = [Snippet, Fragment];

export { Realm, realmSchema, Snippet, Fragment };
