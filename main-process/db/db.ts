import {
  Realm,
  Snippet,
  Fragment,
  ActiveFragment,
  Language,
  SnippetUpdate,
} from "./realm";
import languages from "./seeds/languages";
import * as fragments from "./seeds/fragments";

type ActiveFragmentProperty = Pick<ActiveFragment, "fragmentId" | "snippetId">;

class DB extends Realm {
  constructor(path: string) {
    const schema = [
      Snippet.schema,
      Fragment.schema,
      ActiveFragment.schema,
      Language.schema,
      SnippetUpdate.schema,
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
    // TODO: seed data for testing
    // this.createFragment("", fragments.content1, latestSnippet, 0); // language == 'plaintext'
    const latestFragment = this.createFragment(
      "",
      fragments.content2,
      latestSnippet,
      0
    );

    this.createActiveFragment(latestFragment._id, latestSnippet._id);
  }

  initFragment(snippetId: number): void {
    const snippet: Snippet | undefined = this.objectForPrimaryKey(
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

  deleteFragment(fragmentId: number, nextActiveFragmentId: number): void {
    const fragment: Fragment | undefined = this.objectForPrimaryKey(
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
    this.updateActiveFragment({
      properties: { snippetId: snippet._id, fragmentId: nextActiveFragmentId },
    });
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

  async updateSnippet(data: {
    _id: number;
    properties: typeof Snippet;
  }): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snippet: Snippet = this.objectForPrimaryKey("Snippet", data._id)!;
    this.write(() => {
      Object.assign(snippet, data.properties);
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
