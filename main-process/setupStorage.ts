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
  snippets: Snippet[];
};

const fragmentsList = (fragments: Fragment[]) => {
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
    db.reverseSortBy("Snippet", "updatedAt") as unknown as Results<Snippet>
  ).map((snippet) => {
    return new Snippet({
      _id: snippet._id,
      title: snippet.title,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    });
  });
  return { status: true, msg: "Snippets loaded", snippets };
};
