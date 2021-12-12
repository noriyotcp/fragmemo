import { Realm, realmSchema, Snippet } from "./realm";

class DB extends Realm {
  constructor(path: string) {
    super({ path, schema: realmSchema });
  }

  reverseSortBy(
    className: string,
    property: string
  ): Realm.Results<Realm.Object> {
    return this.objects(className).sorted(property, true);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  createFragment(title: string, content: string): void {
    this.write(() => {
      this.create("Fragment", {
        _id: this.currentMaxId("Fragment") + 1,
        title: title,
        content: content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async updateSnippet(data: {
    _id: number;
    properties: typeof Snippet;
  }): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const findObject: Snippet = this.objectForPrimaryKey("Snippet", data._id)!;
    this.write(() => {
      Object.assign(findObject, data.properties);
      findObject.updatedAt = new Date();
    });

    console.info(
      "snippet title updated: ",
      // @ts-ignore
      this.objectForPrimaryKey("Snippet", data._id)?.title
    );
  }
}

export default DB;
