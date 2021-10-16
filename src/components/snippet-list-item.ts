import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "@material/mwc-list/mwc-list-item.js";

@customElement("snippet-list-item")
export class SnippetListItem extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        --mdc-theme-text-primary-on-background: ghostwhite;
        --mdc-theme-text-secondary-on-background: ghostwhite;
      }
      li {
        border-bottom: 1px solid rgba(248, 248, 255, 0.12);
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <mwc-list-item twoline>
        <span>Item</span>
        <span slot="secondary">Secondary line</span>
      </mwc-list-item>
      <li divider role="separator"></li>
    `;
  }
}
