import { app } from "electron";
import DB from "./db/db";

const db = new DB(`${app.getPath("userData")}/fragmemoDB/fragmemo.realm`);

export const setupStorage = (): DB => {
  try {
    if (db.empty) {
      db.initLanguage();
      db.initSnippet("");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

  return db;
};

export const resetActiveSnippetHistory = (): void => {
  db.resetActiveSnippetHistory();
};
