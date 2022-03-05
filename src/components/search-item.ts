import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("search-item")
export class SearchItem extends LitElement {
  static styles = [
    css`
      :host {
        background-color: #1e1e1e;
        position: sticky;
        top: 0;
        height: 100px;
        z-index: 600;
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
        <span id="search-message"></span>
        <sl-button type="default" size="small">
          <sl-icon slot="prefix" name="gear"></sl-icon>
          Settings
        </sl-button>

        <sl-button type="default" size="small">
          <sl-icon slot="suffix" name="arrow-counterclockwise"></sl-icon>
          Refresh
        </sl-button>

        <sl-button type="default" size="small">
          <sl-icon slot="prefix" name="link-45deg"></sl-icon>
          <sl-icon slot="suffix" name="box-arrow-up-right"></sl-icon>
          Open
        </sl-button>
      </header>
    `;
  }
}
