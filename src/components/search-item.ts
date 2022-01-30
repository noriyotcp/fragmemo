import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("search-item")
export class SearchItem extends LitElement {
  @query("#search-message") searchMessage!: HTMLSpanElement;

  static styles = [
    css`
      :host {
        --mdc-theme-text-primary-on-background: var(--text-color);
        --mdc-theme-text-secondary-on-background: var(--text-color);
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
        <span
          id="search-message"
          @input-title="${this._inputTitleListener}"
        ></span>
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

  constructor() {
    super();
    window.addEventListener(
      "input-title",
      this._inputTitleListener as EventListener
    );
  }

  private _inputTitleListener = (e: CustomEvent): void => {
    this.searchMessage.textContent = e.detail.message;
  };
}
