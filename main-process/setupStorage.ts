import { Results } from "realm";
import DB from "./db/db";
import { Snippet } from "./db/realm";

type SnippetData = {
  snippetTitle: Snippet["title"];
  snippetId: Snippet["_id"];
}[];

type setupStorageResultType = {
  status: boolean;
  msg: string;
  snippets: SnippetData;
};

export const setupStorage = (db: DB): setupStorageResultType => {
  const snippets = (
    db.reverseSortBy("Snippet", "updatedAt") as Results<Snippet>
  ).map((snippet) => ({
    snippetTitle: snippet.title,
    snippetId: snippet._id,
    snippetUpdatedAt: snippet.updatedAt,
  }));
  return { status: true, msg: "Snippets loaded", snippets };
};
