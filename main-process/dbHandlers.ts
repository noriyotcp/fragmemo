import { app } from "electron";
import DB from "./db/db";
import { Fragment, Language, Snippet } from "./db/realm";
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

export const initSnippet = (): Snippet[] => {
  db.initSnippet("");
  return db.reverseSortBy("Snippet", "_id")[0].toJSON();
};

export const initFragment = (snippetId: number): void => {
  db.initFragment(snippetId);
};

export const loadSnippets = (): Snippet[] | undefined => {
  if (!db) return;

  try {
    const snippets = db.reverseSortBy(
      "Snippet",
      "snippetUpdate.updatedAt"
    ) as unknown as Results<Fragment>;
    return snippets.toJSON();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getSnippet = (snippetId: number): Snippet | void => {
  const snippet = db.objectForPrimaryKey("Snippet", snippetId);
  if (!snippet) return;

  console.log("Main process: get-snippet", snippet.toJSON());
  return snippet.toJSON();
};

export const getFragment = (fragmentId: number): Fragment | void => {
  const fragment = db.objectForPrimaryKey("Fragment", fragmentId);
  if (!fragment) return;

  return fragment.toJSON();
};

export const getActiveFragment = (snippetId: number): Fragment => {
  const activeFragment = db
    .objects("ActiveFragment")
    .filtered(`snippetId = ${snippetId}`)[0];
  return activeFragment.toJSON();
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

// TODO: Duplicated in src/props.d.ts
interface IFragmentProps {
  _id: number;
  properties: typeof Fragment;
}

export const updateFragment = async (props: IFragmentProps) => {
  await db.updateFragment(props);
  return { status: true };
};

export const updateActiveFragment = async (props: {
  properties: { fragmentId: number; snippetId: number };
}): Promise<{ status: boolean }> => {
  await db.updateActiveFragment(props);
  return { status: true };
};

export const deleteFragment = (ids: {
  fragmentId: number;
  nextActiveFragmentId?: number;
}) => {
  db.deleteFragment(ids.fragmentId, ids.nextActiveFragmentId);
};

export const deleteSnippet = (snippetId: number): void => {
  db.deleteSnippet(snippetId);
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
