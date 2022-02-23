import Realm from "realm";

class Snippet {
  [x: string]: any; // for toJSON()
  _id = 0;
  title = "";
  createdAt = new Date();
  updatedAt = new Date();
  snippetUpdate!: SnippetUpdate;

  public static schema: Realm.ObjectSchema = {
    name: "Snippet",
    properties: {
      _id: "int",
      title: "string?",
      createdAt: "date",
      updatedAt: "date",
      snippetUpdate: "SnippetUpdate",
    },
    primaryKey: "_id",
  };

  constructor(data: Required<Snippet>) {
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

  public static schema: Realm.ObjectSchema = {
    name: "Fragment",
    properties: {
      _id: "int",
      title: "string?",
      content: "string?",
      snippet: "Snippet",
      language: "Language",
      createdAt: "date",
      updatedAt: "date",
    },
    primaryKey: "_id",
  };

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
    properties: {
      _id: "int",
      fragmentId: "int",
      snippetId: "int",
    },
    primaryKey: "_id",
  };

  constructor(data: Partial<ActiveFragment>) {
    Object.assign(this, data);
  }
}

class Language {
  public _idx = 0;
  public name = "";
  public alias = "";

  public static schema: Realm.ObjectSchema = {
    name: "Language",
    properties: {
      _idx: "int",
      name: "string",
      alias: "string",
    },
    primaryKey: "_idx",
  };

  constructor(data: Required<Language>) {
    Object.assign(this, data);
  }
}

class SnippetUpdate {
  public _id = 0;
  public updatedAt = new Date();

  public static schema: Realm.ObjectSchema = {
    name: "SnippetUpdate",
    properties: {
      _id: "int",
      updatedAt: "date",
    },
    primaryKey: "_id",
  };
}

export { Realm, Snippet, Fragment, ActiveFragment, Language, SnippetUpdate };
