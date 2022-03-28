import { ReactiveController, ReactiveControllerHost } from "lit";

export class SearchQueryController implements ReactiveController {
  query = "";

  constructor(host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "search-snippets",
      this._searchSnippetsListener as EventListener
    );
    window.addEventListener(
      "clear-internal-search-query",
      this._clearSearchQuery as EventListener
    );
  }

  private _searchSnippetsListener = (e: CustomEvent) => {
    this.query = e.detail.query;
  };

  private _clearSearchQuery = (e: CustomEvent) => {
    this.query = "";
  };
}
