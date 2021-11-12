import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { List } from "@material/mwc-list/mwc-list.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/StandardListItem.js";

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
      #snippet-list {
        --mdc-ripple-color: transparent;
      }
    `,
    List.styles,
  ];

  render(): TemplateResult {
    return html`
      <search-item></search-item>
      <ui5-list id="myList" class="full-width">
        ${Object.entries(this.setupStorage.snippets).map(
          ([snippet, _]) =>
            html` <ui5-li
              description="${this.randomDate(
                new Date(2021, 1, 1),
                new Date()
              ).toDateString()}"
              additional-text="snippet"
              additional-text-state="Success"
              >${snippet}</ui5-li
            >`
        )}
      </ui5-list>
      <mwc-list id="snippet-list">
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

  // eslint-disable-next-line no-unused-vars
  updated(changedProps: Map<string, unknown>): void {
    console.log("storage status: ", this.setupStorage.status);
    console.info(this.setupStorage.snippets);
    console.log(this.setupStorage.msg);
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
