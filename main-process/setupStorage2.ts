// @ts-nocheck

import { Results } from "realm";

export const setupStorage2 = (
  db: typeof import("./db/realmHandler")
): { status: boolean; msg: string; snippets: Results<Realm.Object> } => {
  const snippets = db
    .reverseSortById("Snippet")
    .map((snippet: Realm.Object) => ({
      snippetTitle: snippet.title,
      snippetId: snippet._id,
    }));
  return { status: true, msg: "Snippets loaded", snippets };
};
