import { ReactiveController, ReactiveControllerHost } from "lit";

export class IsSearchingController implements ReactiveController {
  isSearching = false;

  constructor(host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "search-snippets",
      this._searchSnippetsListener as EventListener
    );
    window.addEventListener(
      "clear-search-snippets",
      this._clearSearchSnippetsListener as EventListener
    );
  }

  get searching() {
    return this.isSearching;
  }

  private _searchSnippetsListener = (e: CustomEvent) => {
    this.isSearching = true;
  };

  private _clearSearchSnippetsListener = (e: CustomEvent) => {
    this.isSearching = false;
  };
}
