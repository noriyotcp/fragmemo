import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("search-item")
export class SearchItem extends LitElement {
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
          id="search"
          placeholder="Search..."
          size="large"
          type="search"
          inputmode="search"
          clearable
          @sl-input="${this._search}"
          @sl-clear="${this._clear}"
        ></sl-input>
      </header>
    `;
  }

  private _search = (e: Event): void => {
    const target = <HTMLInputElement>e.currentTarget;
    console.log("search:", target.value);
  };

  private _clear = (e: Event): void => {
    console.log("Clear:", e);
  };
}
