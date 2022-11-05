import {
  Realm,
  Snippet,
  Fragment,
  ActiveFragment,
  Language,
  SnippetUpdate,
  ActiveSnippetHistory,
} from "./realm";
import languages from "./seeds/languages";

interface ActiveFragmentProps {
  properties: Pick<ActiveFragment, "fragmentId" | "snippetId">;
}

class DB extends Realm {
  constructor(path: string) {
    const schema = [
      Snippet.schema,
      Fragment.schema,
      ActiveFragment.schema,
      Language.schema,
      SnippetUpdate.schema,
      ActiveSnippetHistory.schema,
    ];
    super({ path, schema });
  }

  initLanguage(): void {
    this.write(() => {
      languages.forEach((language, i) => {
        this.create("Language", {
          _idx: i,
          name: language.id,
          alias: language.alias,
        });
      });
    });
  }

  sortBy(className: string, property: string): Realm.Results<Realm.Object> {
    return this.objects(className).sorted(property);
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

  initSnippet(title: string): void {
    const snippetUpdate = this.createSnippetUpdate();
    const latestSnippet = this.createSnippet(title, snippetUpdate);

    // create an empty fragment
    const latestFragment = this.createFragment("", "", latestSnippet, 0);

    this.createActiveFragment(latestFragment._id, latestSnippet._id);
  }

  initFragment(snippetId: number): void {
    const snippet: Snippet | null = this.objectForPrimaryKey(
      "Snippet",
      snippetId
    );

    if (!snippet) {
      throw new Error("snippet not found");
    }

    const fragment = this.createFragment("", "", snippet, 0);

    this.updateActiveFragment({
      properties: { snippetId: snippetId, fragmentId: fragment._id },
    });
    this.write(() => {
      snippet.snippetUpdate.updatedAt = new Date();
    });
  }

  deleteFragment(fragmentId: number, nextActiveFragmentId?: number): void {
    const fragment: Fragment | null = this.objectForPrimaryKey(
      "Fragment",
      fragmentId
    );

    if (!fragment) {
      throw new Error("fragment not found");
    }

    const snippet: Snippet = fragment.snippet;

    this.write(() => {
      this.delete(fragment);
    });

    if (nextActiveFragmentId) {
      this.updateActiveFragment({
        properties: {
          snippetId: snippet._id,
          fragmentId: nextActiveFragmentId,
        },
      });
    }

    this.write(() => {
      snippet.snippetUpdate.updatedAt = new Date();
    });
  }

  private createSnippet(title: string, snippetUpdate: SnippetUpdate) {
    let snippet!: Snippet;
    this.write(() => {
      snippet = this.create("Snippet", {
        _id: this.currentMaxId("Snippet") + 1,
        title: title,
        snippetUpdate: snippetUpdate,
      });
    });
    return snippet;
  }

  createFragment(
    title: string,
    content: string,
    snippet: Snippet,
    languageIdx: number
  ): Fragment {
    let fragment!: Fragment;
    this.write(() => {
      fragment = this.create("Fragment", {
        _id: this.currentMaxId("Fragment") + 1,
        title: title,
        content: content,
        snippet: snippet,
        language: this.objectForPrimaryKey("Language", languageIdx) as Language,
      });
    });
    return fragment;
  }

  createActiveFragment(fragmentId: number, snippetId: number): ActiveFragment {
    let activeFragment!: ActiveFragment;
    this.write(() => {
      activeFragment = this.create("ActiveFragment", {
        _id: this.currentMaxId("ActiveFragment") + 1,
        fragmentId: fragmentId,
        snippetId: snippetId,
      });
    });
    return activeFragment;
  }

  createSnippetUpdate(): SnippetUpdate {
    let snippetUpdate!: SnippetUpdate;
    this.write(() => {
      snippetUpdate = this.create("SnippetUpdate", {
        _id: this.currentMaxId("SnippetUpdate") + 1,
        updatedAt: new Date(),
      });
    });
    return snippetUpdate;
  }

  createActiveSnippetHistory(snippetId: number): void {
    this.write(() => {
      this.create("ActiveSnippetHistory", {
        _id: this.currentMaxId("ActiveSnippetHistory") + 1,
        snippetId,
      });
    });
  }

  updateSnippet(props: { _id: number; properties: typeof Snippet }): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snippet: Snippet = this.objectForPrimaryKey("Snippet", props._id)!;
    this.write(() => {
      Object.assign(snippet, props.properties);
      snippet.snippetUpdate.updatedAt = new Date();
    });
  }

  async updateFragment(data: {
    _id: number;
    properties: typeof Fragment;
  }): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fragment: Fragment = this.objectForPrimaryKey("Fragment", data._id)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snippetUpdate: SnippetUpdate = this.objectForPrimaryKey(
      "SnippetUpdate",
      fragment.snippet.snippetUpdate._id
    )!;
    this.write(() => {
      Object.assign(fragment, data.properties);
      snippetUpdate.updatedAt = new Date();
    });
  }

  async updateActiveFragment({
    properties,
  }: ActiveFragmentProps): Promise<void> {
    const activeFragment = this.objects("ActiveFragment").filtered(
      `snippetId = ${properties.snippetId}`
    )[0] as unknown as ActiveFragment;
    this.write(() => {
      if (activeFragment) {
        activeFragment.fragmentId = properties.fragmentId;
      }
    });
  }

  deleteSnippet(snippetId: number): void {
    const snippet = this.objectForPrimaryKey("Snippet", snippetId);
    if (!snippet) {
      throw new Error("snippet not found");
    }

    const fragments = this.objects("Fragment").filtered(
      `snippet._id == ${snippetId}`
    );
    const activeFragments = this.objects("ActiveFragment").filtered(
      `snippetId == ${snippetId}`
    );
    const snippetUpdates = this.objects("SnippetUpdate").filtered(
      `_id == ${snippetId}`
    );
    const activeSnippetHistories = this.objects(
      "ActiveSnippetHistory"
    ).filtered(`snippetId == ${snippetId}`);

    this.write(() => {
      this.delete(fragments);
      this.delete(activeFragments);
      this.delete(snippetUpdates);
      this.delete(activeSnippetHistories);
      this.delete(snippet);
    });
  }

  resetActiveSnippetHistory(): void {
    this.write(() => {
      // delete all activeSnippetHistory except the latest one
      this.delete(
        this.objects("ActiveSnippetHistory").filtered(
          `_id != ${this.currentMaxId("ActiveSnippetHistory")}`
        )
      );
      // update _id of the latest one to 1
      const latestOne: ActiveSnippetHistory | null = this.objectForPrimaryKey(
        "ActiveSnippetHistory",
        this.currentMaxId("ActiveSnippetHistory")
      );
      if (latestOne) {
        latestOne._id = 1;
      }
    });
  }
}

export default DB;
