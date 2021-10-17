import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ListItem } from "@material/mwc-list/mwc-list-item.js";

@customElement("snippet-list-item")
export class SnippetListItem extends LitElement {
  static styles = [
    css`
      :host {
        --mdc-theme-text-primary-on-background: ghostwhite;
        --mdc-theme-text-secondary-on-background: ghostwhite;
        --mdc-list-side-padding: 8px;
        border-bottom: 1px solid rgba(248, 248, 255, 0.12);
      }
      mwc-list-item {
        flex-shrink: 0;
        width: 100%;
      }
    `,
    ListItem.styles,
  ];

  render(): TemplateResult {
    return html`
      <mwc-list-item twoline>
        <span>Item<slot name="title"></slot></span>
        <span slot="secondary"><slot name="date"></slot></span>
      </mwc-list-item>
      <li divider role="separator"></li>
    `;
  }
}
