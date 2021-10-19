import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ListItem } from "@material/mwc-list/mwc-list-item.js";

@customElement("search-item")
export class SearchItem extends LitElement {
  static styles = [
    css`
      :host {
        --mdc-theme-text-primary-on-background: ghostwhite;
        --mdc-theme-text-secondary-on-background: ghostwhite;
        --mdc-list-side-padding: 8px;
        background-color: #1e1e1e;
      }
    `,
    ListItem.styles,
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
