import Realm from "realm";

class Snippet extends Realm.Object {
  static schema: {
    name: string;
    properties: { _id: string; title: string; fragments: string };
    primaryKey: string;
  };
}

Snippet.schema = {
  name: "Snippet",
  properties: {
    _id: "int",
    title: "string?",
    fragments: "Fragment[]",
  },
  primaryKey: "_id",
};

class Fragment extends Realm.Object {
  static schema: {
    name: string;
    properties: {
      _id: string;
      title: string;
      content: string;
      snippet: {
        type: "linkingObjects";
        objectType: "Snippet";
        property: "fragments";
      };
    };
    primaryKey: string;
  };
}

Fragment.schema = {
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

const initRealm = (path: string): Realm => {
  const realm = new Realm({ path, schema: [Snippet, Fragment] });
  return realm;
};

export { initRealm, Realm, Snippet, Fragment };
