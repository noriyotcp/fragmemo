import { ReactiveController, ReactiveControllerHost } from "lit";
import { Snippet, ActiveSnippetHistory } from "../models";
import { SearchQueryController } from "./search-query-controller";
import {
  displayToast,
  snippetsCreated,
  snippetsLoaded,
} from "../events/global-dispatchers";
const { appAPI } = window;

export class SnippetListController implements ReactiveController {
  private host: ReactiveControllerHost;
  searchQuery: SearchQueryController;

  _snippets: Snippet[] = [];
  activeSnippetHistory!: ActiveSnippetHistory;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.searchQuery = new SearchQueryController(host);
    host.addController(this);
  }

  hostConnected(): void {
    console.info(this.constructor.name, "has connected");
    this.setupStorage();
    window.addEventListener(
      "update-snippets",
      this._onSnippetsUpdated as EventListener
    );
    window.addEventListener(
      "search-snippets",
      this._onSnippetsSearched as EventListener
    );
    // When Command or Control + N is pressed
    appAPI.newSnippet((_e: Event) => this._initSnippet());
  }

  hostDisconnected(): void {
    window.removeEventListener(
      "update-snippets",
      this._onSnippetsUpdated as EventListener
    );
    window.removeEventListener(
      "search-snippets",
      this._onSnippetsSearched as EventListener
    );
  }

  async setupStorage(): Promise<void> {
    await appAPI
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
          duration: 5000,
        });
      });
  }

  private _loadSnippets(query = "", preSnippets: Snippet[] = []) {
    appAPI
      .loadSnippets()
      .then((snippets) => {
        const filtered = snippets.filter((snippet) =>
          snippet.title.includes(query)
        );
        this.snippets = preSnippets.concat(filtered);
      })
      .catch((err) => {
        console.error(err);
        displayToast("Snippets load failed", {
          variant: "danger",
          icon: "exclamation-octagon",
          duration: 5000,
        });
      })
      .finally(() => {
        appAPI.getLatestActiveSnippetHistory().then((activeSnippetHistory) => {
          this.activeSnippetHistory = activeSnippetHistory;
          this.host.requestUpdate();
        });
      });
  }

  private _onSnippetsUpdated = (e: CustomEvent) => {
    this._loadSnippets(this.searchQuery.query);
  };

  private _initSnippet() {
    appAPI.initSnippet().then((snippet) => {
      appAPI.newActiveSnippetHistory(snippet._id);
      this._loadSnippets();
      snippetsCreated();
    });
  }

  private _onSnippetsSearched = (e: CustomEvent) => {
    const query = e.detail.query;

    if (!e.detail.query) {
      appAPI.loadSnippets().then((snippets) => {
        this.snippets = snippets;
        this.host.requestUpdate();
      });
    } else {
      appAPI.loadSnippets().then((snippets) => {
        this.snippets = snippets.filter((snippet) =>
          snippet.title.includes(query)
        );
        this.host.requestUpdate();
      });
    }
  };

  get snippets(): Snippet[] {
    return this._snippets;
  }

  set snippets(snippets: Snippet[]) {
    this._snippets = snippets;
    snippetsLoaded(this._snippets.length <= 0);
  }
}
