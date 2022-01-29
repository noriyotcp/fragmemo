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
  const snippets = (
    db.reverseSortBy("Snippet", "updatedAt") as unknown as Results<Snippet>
  ).map((snippet) => {
    return new Snippet({
      _id: snippet._id,
      title: snippet.title,
      latestActiveFragmentId: snippet.latestActiveFragmentId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    });
  });
  return { status: true, msg: "Snippets loaded", snippets };
};
