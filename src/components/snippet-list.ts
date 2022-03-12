import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import { until } from "lit/directives/until.js";
import { repeat } from "lit/directives/repeat.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/StandardListItem.js";

import { SetupStorageController } from "../controllers/setup-storage-controller";
import { dispatch } from "../events/dispatcher";
import { Snippet } from "../models";

const { myAPI } = window;

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
        --sapTextColor: var(--text-color);
        --ui5-listitem-background-color: #1e1e1e;
        --sapList_Hover_Background: var(--dark-gray);
        --sapList_Hover_SelectionBackground: var(--dark-gray);
        --sapList_SelectionBackgroundColor: var(--dark-gray);
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
        ${repeat(
          this.setupStorage.snippets,
          (snippet: Snippet) => snippet._id,
          (snippet: Snippet, index) =>
            html`<ui5-li
              description="${this.formatDatetime(
                snippet.snippetUpdate.updatedAt
              )}"
              additional-text="${until(
                this._fragmentsCount(snippet._id),
                "0"
              )} 📄"
              additional-text-state="Success"
              snippet=${JSON.stringify(snippet)}
              itemindex="${index}"
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
      const previouslySelectedSnippet = e.detail.previouslySelectedItems
        ? e.detail.previouslySelectedItems[0].getAttribute("snippet")
        : null;

      dispatch({
        type: "select-snippet",
        detail: {
          selectedSnippet: e.detail.selectedItems[0].getAttribute("snippet"),
          previouslySelectedSnippet,
        },
      });
    }) as EventListener);
  }

  updated(): void {
    if (!this.snippetItems[0]) return;
    // Select the first item on the top of the list
    const topItem = Array.from(this.snippetItems).find(
      (item) => item.getAttribute("itemindex") === "0"
    );
    this._updateSelectedItem(topItem!);
  }

  private _updateSelectedItem(item: HTMLLIElement): void {
    this.snippetList.querySelectorAll("ui5-li").forEach((li) => {
      li.removeAttribute("selected");
      li.removeAttribute("focused");
    });
    item.setAttribute("selected", "true");
    item.setAttribute("focused", "true");

    const event = new CustomEvent("selection-change", {
      detail: { selectedItems: [item] },
    });
    this.snippetList.dispatchEvent(event);
    this.scroll({ top: 0, behavior: "smooth" });
    // e.g. scroll to the top of the second item
    // this.snippetItems[1] &&
    //   this.scroll({ top: this.snippetItems[1].offsetTop, behavior: "smooth" });
  }

  private formatDatetime(datetime: Date): string {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return new Intl.DateTimeFormat(locale || "jp", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(datetime);
  }

  private async _fragmentsCount(snippetId: number): Promise<number> {
    const fragments = await myAPI.loadFragments(snippetId);
    return fragments.length;
  }
}
