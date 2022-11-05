import { app } from "electron";
import DB from "./db/db";
import { Fragment, Language, Snippet } from "./db/realm";
import { Results } from "realm";

const dataPath =
  process.env.IS_DEV == "true"
    ? `${app.getPath("userData")}/fragmemoDBdev/fragmemo-dev.realm`
    : `${app.getPath("userData")}/fragmemoDB/fragmemo.realm`;
const db = new DB(dataPath);

export const setupStorage = (): void => {
  try {
    if (db.isEmpty) {
      db.initLanguage();
      db.initSnippet("");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const initSnippet = (): Snippet[] | Record<string, unknown> => {
  db.initSnippet("");
  return db.reverseSortBy("Snippet", "_id")[0].toJSON();
};

export const initFragment = (snippetId: number): void => {
  db.initFragment(snippetId);
};

export const loadSnippets = ():
  | Snippet[]
  | Record<string, unknown>[]
  | undefined => {
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

export const getSnippet = (
  snippetId: number
): Snippet | Record<string, unknown> | void => {
  const snippet = db.objectForPrimaryKey("Snippet", snippetId);
  if (!snippet) return;

  console.log("Main process: get-snippet", snippet.toJSON());
  return snippet.toJSON();
};

export const getFragment = (
  fragmentId: number
): Fragment | Record<string, unknown> | void => {
  const fragment = db.objectForPrimaryKey("Fragment", fragmentId);
  if (!fragment) return;

  return fragment.toJSON();
};

export const getActiveFragment = (
  snippetId: number
): Fragment | Record<string, unknown> => {
  const activeFragment = db
    .objects("ActiveFragment")
    .filtered(`snippetId = ${snippetId}`)[0];
  return activeFragment.toJSON();
};

export const loadLanguages = ():
  | Language[]
  | Record<string, unknown>[]
  | undefined => {
  if (!db) return;

  return db.sortBy("Language", "_idx").toJSON();
};

export const loadFragments = (
  snippetId: number
): Fragment[] | Record<string, unknown>[] => {
  const fragments = db
    .objects("Fragment")
    .filtered(`snippet._id == ${snippetId}`) as unknown as Results<Fragment>;
  return fragments.toJSON();
};

// TODO: Define in main-process/props.d.ts ?
interface ISnippetProps {
  _id: number;
  properties: typeof Snippet;
}

interface IFragmentProps {
  _id: number;
  properties: typeof Fragment;
}

export const updateSnippet = (props: ISnippetProps) => {
  try {
    db.updateSnippet(props);
  } catch (error) {
    console.error(error);
    throw new Error(`update-snippet: ${error}`);
  }
};

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

export const getLatestActiveSnippetHistory = ():
  | JSON
  | Record<string, unknown> => {
  return db.reverseSortBy("ActiveSnippetHistory", "_id")[0]?.toJSON();
};

export const onWillQuit = (): void => {
  db.resetActiveSnippetHistory();
  db.close();
};
