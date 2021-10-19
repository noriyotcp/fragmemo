import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("search-item")
export class SearchItem extends LitElement {
  static styles = [
    css`
      :host {
        --mdc-theme-text-primary-on-background: ghostwhite;
        --mdc-theme-text-secondary-on-background: ghostwhite;
        --mdc-list-side-padding: 8px;
        background-color: #1e1e1e;
        position: sticky;
        top: 0;
        height: 100px;
        z-index: 9999;
        display: block;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <header>
        <button>Save</button>
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search..."
          value=""
        />
      </header>
    `;
  }
}
