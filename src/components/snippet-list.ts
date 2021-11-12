import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/StandardListItem.js";

import "./snippet-list-item";
import { SetupStorageController } from "../controllers/setup-storage-controller";
import { dispatch } from "../events/dispatcher";

@customElement("snippet-list")
export class SnippetList extends LitElement {
  private setupStorage = new SetupStorageController(this);

  @query("#snippetList") snippetList!: HTMLElement;

  constructor() {
    super();
  }

  static styles = [
    css`
      :host {
        overflow-y: smooth;
        overflow-x: hidden;
        height: 100vh;
        padding-top: -8px;
        --sapTextColor: ghostwhite;
        --ui5-listitem-background-color: #323233;
        --sapList_Hover_Background: #1e1e1e;
        --sapList_Hover_SelectionBackground: #1e1e1e;
        --sapList_SelectionBackgroundColor: #1e1e1e;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <search-item></search-item>
      <ui5-list id="snippetList" class="full-width" mode="SingleSelect">
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
    `;
  }

  firstUpdated(): void {
    this.snippetList.addEventListener("selection-change", ((
      e: CustomEvent
    ): void => {
      dispatch({
        type: "select-snippet",
        message: e.detail.selectedItems[0].textContent,
      });
    }) as EventListener);
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
