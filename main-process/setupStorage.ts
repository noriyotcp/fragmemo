import { Results } from "realm";
import DB from "./db/db";
import { Snippet } from "./db/realm";

type setupStorageResultType = {
  status: boolean;
  msg: string;
  snippets: Snippet[];
};

export const setupStorage = (db: DB): setupStorageResultType => {
  if (db.empty) {
    db.createSnippet("");
  }
  return returnSnippets(db);
};

const returnSnippets = (db: DB): setupStorageResultType => {
  const snippets = (
    db.reverseSortBy("Snippet", "updatedAt") as unknown as Results<Snippet>
  ).map((snippet) => {
    return {
      _id: snippet._id,
      title: snippet.title,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    };
  });
  return { status: true, msg: "Snippets loaded", snippets };
};
