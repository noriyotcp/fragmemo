import { Results } from "realm";
import DB from "./db/db";
import { Snippet } from "./db/realm";

type SnippetData = {
  snippetTitle: Snippet["title"];
  snippetId: Snippet["_id"];
}[];

type setupStorageResult2Type = {
  status: boolean;
  msg: string;
  snippets: SnippetData;
};

export const setupStorage2 = (db: DB): setupStorageResult2Type => {
  const snippets = (db.reverseSortById("Snippet") as Results<Snippet>).map(
    (snippet) => ({
      snippetTitle: snippet.title,
      snippetId: snippet._id,
    })
  );
  return { status: true, msg: "Snippets loaded", snippets };
};
