// @ts-nocheck

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/StandardListItem.js";

import "./snippet-list-item";
import { SetupStorageController } from "../controllers/setup-storage-controller";
import { dispatch } from "../events/dispatcher";

@customElement("snippet-list")
export class SnippetList extends LitElement {
  private setupStorage = new SetupStorageController(this);

  @query("#snippetList") snippetList!: HTMLElement;
  @queryAll("ui5-li") snippetItems!: HTMLLIElement[];

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

      ui5-li {
        min-height: 5rem;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <search-item></search-item>
      <ui5-list id="snippetList" class="full-width" mode="SingleSelect">
        ${this.setupStorage.snippets.map(
          (snippet) =>
            html`<ui5-li
              description="${this.formatDatetime(snippet.updatedAt)}"
              additional-text="snippet"
              additional-text-state="Success"
              snippet=${JSON.stringify(snippet)}
              >${snippet.title}</ui5-li
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
        detail: {
          message: e.detail.selectedItems[0].getAttribute("snippet"),
        },
      });
    }) as EventListener);
  }

  // eslint-disable-next-line no-unused-vars
  updated(changedProps: Map<string, unknown>): void {
    this._selectFirstItem();
  }

  // Select the first item on the top of the list
  private _selectFirstItem() {
    if (!this.snippetItems[0]) return;
    this.snippetList.querySelectorAll("ui5-li").forEach((li) => {
      li.removeAttribute("selected");
      li.removeAttribute("focused");
    });
    this.snippetItems[0].setAttribute("selected", true);
    this.snippetItems[0].setAttribute("focused", true);
    const event = new CustomEvent("selection-change", {
      detail: { selectedItems: [this.snippetItems[0]] },
    });
    this.snippetList.dispatchEvent(event);
    this.scroll({ top: 0, behavior: "smooth" });
    // e.g. scroll to the top of the second item
    // this.snippetItems[1] &&
    //   this.scroll({ top: this.snippetItems[1].offsetTop, behavior: "smooth" });
  }

  private formatDatetime(datetime: string) {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return new Intl.DateTimeFormat(locale || "jp", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(datetime);
  }
}
