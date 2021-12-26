// @ts-nocheck

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
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
        ${this.range(1, 10).map((num, _) => {
          return html`
            <sl-tab slot="nav" panel="tab-${num}" closable>Tab ${num}</sl-tab>
            <sl-tab-panel name="tab-${num}">
              <code-editor
                code="const num: number = ${num};"
                language="typescript"
              >
              </code-editor>
            </sl-tab-panel>
          `;
        })}
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
        const previousTab = tab.previousElementSibling
          ?.previousElementSibling as HTMLElement;
        const nextTab = tab.nextElementSibling
          ?.nextElementSibling as HTMLElement;
        if (previousTab) {
          this.tabGroup.show(previousTab.panel);
        } else {
          this.tabGroup.show(nextTab.panel);
        }
      }

      // Remove the tab + panel
      tab.remove();
      panel.remove();
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
