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
        border-bottom: 1px solid rgba(248, 248, 255, 0.12);
        background-color: #1e1e1e;
      }
    `,
    ListItem.styles,
  ];

  render(): TemplateResult {
    return html`
      <mwc-list-item twoline>
        <span>Search...</span>
        <li divider role="separator"></li>
      </mwc-list-item>
    `;
  }
}
