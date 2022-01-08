// @ts-nocheck

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { SnippetController } from "../controllers/snippet-controller";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private snippet = new SnippetController(this);

  @query("sl-tab-group") tabGroup!: HTMLElement;
  @queryAll("sl-tab[panel^='tab-']") tabs: Array<HTMLElement>;

  static styles = css`
    :host {
    }
  `;

  settingsTemplate(): TemplateResult {
    return html`
      <sl-tab slot="nav" panel="tab-settings" closable>Tab settings</sl-tab>
      <sl-tab-panel name="tab-settings">
        <settings-element></settings-element>
      </sl-tab-panel>
    `;
  }

  render(): TemplateResult {
    return html`
      <sl-tab-group class="tabs-closable">
        ${repeat(
          this.range(1, 10),
          (num) => num,
          (num, _) => {
            return html`
              <sl-tab slot="nav" closable panel="tab-${num}"
                >${this.snippet.selectedSnippet.title} Tab ${num}</sl-tab
              >
            `;
          }
        )}
        ${this.settingsTemplate()}
      </sl-tab-group>
    `;
  }

  firstUpdated() {
    console.log("FragmentTabList firstUpdated");
    console.info(this.tabs);

    this.tabGroup.addEventListener("sl-close", async (event) => {
      const tab = event.target as HTMLElement;
      const panel = this.tabGroup.querySelector(
        `sl-tab-panel[name="${tab.panel}"]`
      );

      // Show the previous tab if the tab is currently active
      if (tab.active) {
        const previousTab = tab.previousElementSibling as HTMLElement;
        const nextTab = tab.nextElementSibling as HTMLElement;
        if (previousTab) {
          this.tabGroup.show(previousTab.panel);
        } else if (nextTab) {
          this.tabGroup.show(nextTab.panel);
        }
      }

      // Remove the tab + panel
      tab.remove();
      panel?.remove();
    });

    this.tabGroup.addEventListener("sl-tab-show", (event) => {
      console.info("Tab show", event);
    });
  }

  private range(
    start: number,
    end: number,
    length = end - start + 1
  ): Array<number> {
    return Array.from({ length }, (_, i) => start + i);
  }
}
