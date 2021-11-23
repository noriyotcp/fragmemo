import { Results } from "realm";
import DB from "./db/db";
import { Snippet, Fragment } from "./db/realm";

type SnippetData = {
  snippetTitle: Snippet["title"];
  snippetId: Snippet["_id"];
}[];

type setupStorageResultType = {
  status: boolean;
  msg: string;
  snippets: SnippetData;
};

const fragmentsList = (fragments: Realm.List<Fragment>) => {
  return fragments.map((fragment) => {
    return {
      _id: fragment._id,
      title: fragment.title,
      content: fragment.content,
      createdAt: fragment.createdAt,
      updatedAt: fragment.updatedAt,
    };
  });
};

export const setupStorage = (db: DB): setupStorageResultType => {
  const snippets = (
    db.reverseSortBy("Snippet", "updatedAt") as Results<Snippet>
  ).map((snippet) => ({
    snippetTitle: snippet.title,
    snippetId: snippet._id,
    snippetUpdatedAt: snippet.updatedAt,
    fragments: fragmentsList(snippet.fragments),
  }));
  return { status: true, msg: "Snippets loaded", snippets };
};
