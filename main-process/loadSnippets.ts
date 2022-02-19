import { Results } from "realm";
import DB from "./db/db";
import { Snippet } from "./db/realm";

export const loadSnippets = (db: DB): Snippet[] => {
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
  return snippets;
};
