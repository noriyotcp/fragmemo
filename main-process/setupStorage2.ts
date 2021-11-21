// @ts-nocheck

import { Results } from "realm";
import DB from "./db/db";

export const setupStorage2 = (
  db: DB
): { status: boolean; msg: string; snippets: Results<Realm.Object> } => {
  const snippets = db
    .reverseSortById("Snippet")
    .map((snippet: Realm.Object) => ({
      snippetTitle: snippet.title,
      snippetId: snippet._id,
    }));
  return { status: true, msg: "Snippets loaded", snippets };
};
