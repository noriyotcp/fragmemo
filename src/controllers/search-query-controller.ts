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
      "clear-search-snippets",
      this._clearSearchSnippetsListener as EventListener
    );
  }

  private _searchSnippetsListener = (e: CustomEvent) => {
    this.query = e.detail.query;
  };

  private _clearSearchSnippetsListener = (e: CustomEvent) => {
    this.query = "";
  };
}
