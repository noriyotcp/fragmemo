import Realm from "realm";

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

export { Language };
