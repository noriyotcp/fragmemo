import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { List } from "@material/mwc-list/mwc-list.js";

import "./snippet-list-item";
import { SetupStorageController } from "../controllers/setup-storage-controller";

@customElement("snippet-list")
export class SnippetList extends LitElement {
  private setupStorage = new SetupStorageController(this);

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
    `,
    List.styles,
  ];

  render(): TemplateResult {
    return html`
      <search-item></search-item>
      <mwc-list>
        ${Object.entries(this.setupStorage.snippets).map(
          ([snippet, _]) =>
            html` <snippet-list-item>
              <span slot="title">${snippet}</span>
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
