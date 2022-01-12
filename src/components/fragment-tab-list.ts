// @ts-nocheck

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { map } from "lit/directives/map.js";
import { FragmentsController } from "../controllers/fragments-controller";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @query("sl-tab-group") tabGroup!: HTMLElement;
  @queryAll("sl-tab[panel^='tab-']") tabs: Array<HTMLElement>;

  // fragments: Fragment[] = [];

  static styles = css`
    :host {
    }
    sl-tab > input {
      background-color: transparent;
      color: white;
      border: none;
      text-align: center;
    }
    sl-tab > input[readonly] {
      outline: none;
    }
    sl-tab > input:not([readonly]):focus-visible {
      outline: var(--sl-color-primary-600) solid 1px;
    }
    .tab-settings {
      user-select: none;
    }
    .tab-settings > input {
      pointer-events: none;
    }
  `;

  settingsTemplate(): TemplateResult {
    return html`
      <sl-tab slot="nav" panel="tab-settings" closable class="tab-settings"
        ><input type="text" value="Settings" readonly
      /></sl-tab>
      <sl-tab-panel name="tab-settings">
        <settings-element></settings-element>
      </sl-tab-panel>
    `;
  }

  render(): TemplateResult {
    return html`
      <sl-tab-group class="tabs-closable">
        ${map(this.fragmentsController.fragments, (fragment, _) => {
          return html`
            <sl-tab
              slot="nav"
              closable
              panel="tab-${fragment._id}"
              id="tab-${fragment._id}"
            >
              <fragment-title
                fragmentId="${fragment._id}"
                title="${fragment.title}"
              ></fragment-title>
            </sl-tab>
          `;
        })}
        ${this.settingsTemplate()}
      </sl-tab-group>
    `;
  }

  updated() {
    console.info("fragments updated", this.fragmentsController.fragments);
  }

  firstUpdated() {
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
