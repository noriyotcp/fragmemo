import { Realm, realmSchema, Snippet, Fragment, ActiveFragment } from "./realm";
type ActiveFragmentProperty = Pick<ActiveFragment, "fragmentId" | "snippetId">;

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
    this.write(() => {
      this.create("Snippet", {
        _id: this.currentMaxId("Snippet") + 1,
        title: title,
        latestActiveFragmentId: 0, // initial value
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const latestSnippet: Snippet = this.objectForPrimaryKey(
      "Snippet",
      this.currentMaxId("Snippet")
    )!;

    // create an empty fragment
    this.createFragment("", "", latestSnippet);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const latestFragment: Fragment = this.objectForPrimaryKey(
      "Fragment",
      this.currentMaxId("Fragment")
    )!;

    // TODO: Remove this
    this.write(() => {
      latestSnippet.latestActiveFragmentId = latestFragment._id;
    });
    this.createActiveFragment(latestFragment._id, latestSnippet._id);
  }

  createFragment(title: string, content: string, snippet: Snippet): void {
    this.write(() => {
      this.create("Fragment", {
        _id: this.currentMaxId("Fragment") + 1,
        title: title,
        content: content,
        snippet: snippet,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  createActiveFragment(fragmentId: number, snippetId: number): void {
    this.write(() => {
      this.create("ActiveFragment", {
        _id: this.currentMaxId("ActiveFragment") + 1,
        fragmentId: fragmentId,
        snippetId: snippetId,
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

    const snippet = this.objectForPrimaryKey<Snippet>("Snippet", data._id);
    console.info("snippet title updated: ", snippet?.title);
  }

  async updateActiveFragment(data: {
    properties: ActiveFragmentProperty;
  }): Promise<void> {
    const activeFragment = this.objects("ActiveFragment").filtered(
      `snippetId = ${data.properties.snippetId}`
    )[0] as unknown as ActiveFragment;
    this.write(() => {
      if (activeFragment) {
        activeFragment.fragmentId = data.properties.fragmentId;
      }
    });
  }
}

export default DB;
