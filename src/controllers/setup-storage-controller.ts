import { displayToast } from "../displayToast";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Snippet, ActiveSnippetHistory } from "../models";
import { IsSearchingController } from "./is-searching-controller";
const { myAPI } = window;

export class SetupStorageController implements ReactiveController {
  private host: ReactiveControllerHost;
  isSearching: IsSearchingController;

  snippets: Snippet[] = [];
  activeSnippetHistory!: ActiveSnippetHistory;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.isSearching = new IsSearchingController(host);
    host.addController(this);
  }

  hostConnected(): void {
    console.info(this.constructor.name, "has connected");
    this.setupStorage();
    window.addEventListener(
      "update-snippets",
      this._updateSnippetsListener as EventListener
    );
    window.addEventListener(
      "search-snippets",
      this._searchSnippetsListener as EventListener
    );
    // When Command or Control + N is pressed
    myAPI.newSnippet((_e: Event) => this._initSnippet());
  }

  get searching() {
    return this.isSearching.searching;
  }

  async setupStorage(): Promise<void> {
    await myAPI
      .setupStorage()
      .then(() => {
        displayToast("Setup storage", {
          variant: "primary",
          icon: "check2-circle",
        });
        this._loadSnippets();
      })
      .catch((err) => {
        console.error(err);
        displayToast("Setup storage failed", {
          variant: "danger",
          icon: "exclamation-octagon",
        });
      });
  }

  private _loadSnippets() {
    myAPI
      .loadSnippets()
      .then((snippets) => {
        this.snippets = snippets;
      })
      .catch((err) => {
        console.error(err);
        displayToast("Snippets load failed", {
          variant: "danger",
          icon: "exclamation-octagon",
        });
      })
      .finally(() => {
        myAPI.getLatestActiveSnippetHistory().then((activeSnippetHistory) => {
          this.activeSnippetHistory = activeSnippetHistory;
          this.host.requestUpdate();
        });
      });
  }

  private _updateSnippetsListener = (e: CustomEvent) => {
    if (this.isSearching.searching) return;

    this._loadSnippets();
  };

  private _initSnippet() {
    myAPI.initSnippet().then((snippet) => {
      myAPI.newActiveSnippetHistory(snippet._id);
      this._loadSnippets();
    });
  }

  private _searchSnippetsListener = (e: CustomEvent) => {
    const query = e.detail.query;

    if (!e.detail.query) {
      myAPI.loadSnippets().then((snippets) => {
        this.snippets = snippets;
        this.host.requestUpdate();
      });
    } else {
      myAPI.loadSnippets().then((snippets) => {
        this.snippets = snippets.filter((snippet) =>
          snippet.title.includes(query)
        );
        this.host.requestUpdate();
      });
    }
  };
}
