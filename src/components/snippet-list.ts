import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@material/mwc-list/mwc-list.js";

import "./snippet-list-item";
@customElement("snippet-list")
export class SnippetList extends LitElement {
  @state()
  private itemCount: number;

  constructor() {
    super();
    this.itemCount = 10;
  }

  static styles = [
    css`
      :host {
        display: block;
        overflow-y: scroll;
        overflow-x: hidden;
        height: 100vh;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <mwc-list>
        ${this.range(1, this.itemCount).map(
          (i) => html`<snippet-list-item></snippet-list-item>`
        )}
      </mwc-list>
    `;
  }

  private range(
    start: number,
    end: number,
    length = end - start + 1
  ): Array<number> {
    return Array.from({ length }, (_, i) => start + i);
  }
}
