import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "@material/mwc-list/mwc-list.js";
import "@material/mwc-list/mwc-list-item.js";

@customElement("snippet-list")
export class SnippetList extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        --mdc-theme-text-primary-on-background: ghostwhite;
        --mdc-theme-text-secondary-on-background: ghostwhite;
      }
      mwc-list > li {
        border-bottom-color: rgba(248, 248, 255, 0.12);
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <mwc-list>
        <mwc-list-item twoline>
          <span>Item 0</span>
          <span slot="secondary">Secondary line</span>
        </mwc-list-item>
        <li divider role="separator"></li>

        <mwc-list-item twoline>
          <span>Item 1</span>
          <span slot="secondary">Secondary line</span>
        </mwc-list-item>
        <li divider role="separator"></li>

        <mwc-list-item twoline>
          <span>Item 2</span>
          <span slot="secondary">Secondary line</span>
        </mwc-list-item>
        <li divider role="separator"></li>

        <mwc-list-item twoline>
          <span>Item 3</span>
          <span slot="secondary">Secondary line</span>
        </mwc-list-item>
        <li divider role="separator"></li>
      </mwc-list>
    `;
  }
}
