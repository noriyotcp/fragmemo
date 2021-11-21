import { Realm, realmSchema } from "./realm";

class DB extends Realm {
  constructor(path: string) {
    super({ path, schema: realmSchema });
  }

  reverseSortById(className: string): Realm.Results<Realm.Object> {
    return this.objects(className).sorted("_id", true);
  }

  currentMaxId(className: string): number {
    // If no records exist, return 0
    return <number>this.objects(className).max("_id") || 0;
  }

  createSnippet(title: string): void {
    // For testing
    const testContentOfFragment = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

    this.createFragment("", testContentOfFragment);
    const latestFragment = this.objectForPrimaryKey(
      "Fragment",
      this.currentMaxId("Fragment")
    );

    this.write(() => {
      this.create("Snippet", {
        _id: this.currentMaxId("Snippet") + 1,
        title: title,
        fragments: [latestFragment],
      });
    });
  }

  createFragment(title: string, content: string): void {
    this.write(() => {
      this.create("Fragment", {
        _id: this.currentMaxId("Fragment") + 1,
        title: title,
        content: content,
      });
    });
  }
}

export default DB;
