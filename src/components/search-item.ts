import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
import {
  clearInternalSearchQuery,
  updateSnippets,
} from "../events/global-dispatchers";

@customElement("search-item")
export class SearchItem extends LitElement {
  @query("#search-item") searchItem!: HTMLInputElement;

  // Get rid of border on sl-input
  static styles = [
    css`
      :host {
        position: sticky;
        top: 0;
        width: 100%;
        display: block;
        z-index: 600;
        --sl-input-border-color-focus: transparent;
        --sl-focus-ring: none;
        --sl-input-border-width: 0;
        --sl-input-border-color: transparent;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <header>
        <sl-input
          id="search-item"
          placeholder="Input or press enter..."
          size="large"
          type="search"
          inputmode="search"
          clearable
          @input="${this._search}"
          @keydown="${this._searchByEnter}"
          @compositionend="${this._search}"
          @sl-clear="${this._clear}"
        ></sl-input>
      </header>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener(
      "snippets-created",
      this._clearSearch as EventListener
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      "snippets-created",
      this._clearSearch as EventListener
    );

    super.disconnectedCallback();
  }

  private _search = (e: InputEvent): void => {
    const target = <HTMLInputElement>e.currentTarget;
    if (e.isComposing) return;

    dispatch({
      type: "search-snippets",
      detail: {
        query: target.value,
      },
    });
  };

  private _searchByEnter = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" || e.isComposing) return;

    const target = <HTMLInputElement>e.currentTarget;

    if (!target.value) return;

    dispatch({
      type: "search-snippets",
      detail: {
        query: target.value,
      },
    });
  };

  private _clear = (e: Event): void => {
    clearInternalSearchQuery();
    updateSnippets();
  };

  private _clearSearch = (_e: InputEvent): void => {
    this.searchItem.value = "";
    this.searchItem.dispatchEvent(new CustomEvent("sl-clear"));
  };
}
