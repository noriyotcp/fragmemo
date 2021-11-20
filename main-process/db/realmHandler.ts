import { initRealm, Realm } from "./realm";
let realm: Realm;

function init(pathToDB: string): void {
  realm = initRealm(pathToDB);
}

function close(): void {
  realm.close();
}

const testContentOfFragment = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

function currentMaxId(className: string): number {
  return <number>realm.objects(className).max("_id") || 0;
}

function createSnippet(title: string): void {
  createFragment("", testContentOfFragment);
  const latestFragment = realm.objectForPrimaryKey(
    "Fragment",
    currentMaxId("Fragment")
  );

  realm.write(() => {
    realm.create("Snippet", {
      _id: currentMaxId("Snippet") + 1,
      title: title,
      fragments: [latestFragment],
    });
  });
}

function createFragment(title: string, content: string): void {
  realm.write(() => {
    realm.create("Fragment", {
      _id: currentMaxId("Fragment") + 1,
      title: title,
      content: content,
    });
  });
}

export { init, close, createSnippet, createFragment };
