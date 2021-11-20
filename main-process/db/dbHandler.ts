const testContentOfFragment = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

function currentMaxId(realm: Realm, className: string): number {
  return <number>realm.objects(className).max("_id") || 0;
}

function createSnippet(realm: Realm, title: string): void {
  createFragment(realm, "", testContentOfFragment);
  const latestFragment = realm.objectForPrimaryKey(
    "Fragment",
    currentMaxId(realm, "Fragment")
  );

  realm.write(() => {
    realm.create("Snippet", {
      _id: currentMaxId(realm, "Snippet") + 1,
      title: title,
      fragments: [latestFragment],
    });
  });
}

function createFragment(realm: Realm, title: string, content: string): void {
  realm.write(() => {
    realm.create("Fragment", {
      _id: currentMaxId(realm, "Fragment") + 1,
      title: title,
      content: content,
    });
  });
}

export { createSnippet, createFragment };
