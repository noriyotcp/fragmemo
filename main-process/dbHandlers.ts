import { app } from "electron";
import DB from "./db/db";
import { Fragment, Language } from "./db/realm";
import { Results } from "realm";

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

export const loadLanguages = (): Language[] | undefined => {
  if (!db) return;

  return db.sortBy("Language", "_idx").toJSON();
};

export const loadFragments = (snippetId: number): Fragment[] => {
  const fragments = db
    .objects("Fragment")
    .filtered(`snippet._id == ${snippetId}`) as unknown as Results<Fragment>;
  return fragments.toJSON();
};

export const newActiveSnippetHistory = (snippetId: number): void => {
  db.createActiveSnippetHistory(snippetId);
};

export const getLatestActiveSnippetHistory = (): JSON => {
  return db.reverseSortBy("ActiveSnippetHistory", "_id")[0]?.toJSON();
};

export const resetActiveSnippetHistory = (): void => {
  db.resetActiveSnippetHistory();
};
