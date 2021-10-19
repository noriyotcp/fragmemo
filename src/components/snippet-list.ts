import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { List } from "@material/mwc-list/mwc-list.js";

import "./snippet-list-item";
@customElement("snippet-list")
export class SnippetList extends LitElement {
  @state()
  private itemCount: number;

  constructor() {
    super();
    this.itemCount = 100;
  }

  static styles = [
    css`
      :host {
        overflow-y: smooth;
        overflow-x: hidden;
        height: 100vh;
        background-color: #323233;
        --mdc-list-vertical-padding: -8px;
        padding-top: var(--mdc-list-vertical-padding);
      }
      search-item {
        position: sticky;
        top: 0;
        height: 100px;
        z-index: 9999;
        display: block;
        align-items: unset;
        justify-content: unset;
        padding: 0;
        cursor: unset;
      }
    `,
    List.styles,
  ];

  render(): TemplateResult {
    return html`
      <search-item></search-item>
      <mwc-list>
        ${this.range(1, this.itemCount).map(
          (i) =>
            html` <snippet-list-item>
              <span slot="title">${i}</span>
              <span slot="date"
                >${this.randomDate(
                  new Date(2021, 1, 1),
                  new Date()
                ).toDateString()}</span
              >
            </snippet-list-item>`
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

  private randomDate(
    start: { getTime: () => number },
    end: { getTime: () => number }
  ) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }
}
