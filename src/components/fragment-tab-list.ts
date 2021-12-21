// @ts-nocheck

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  @query(".tabs-closable") tabGroup!: HTMLElement;

  static styles = css`
    :host {
    }
  `;

  render(): TemplateResult {
    return html`
      <sl-tab-group class="tabs-closable">
        <sl-tab slot="nav" panel="tab-1" closable>Tab 1</sl-tab>
        <sl-tab slot="nav" panel="tab-2" closable>Tab 2</sl-tab>
        <sl-tab slot="nav" panel="tab-3" closable>Tab 3</sl-tab>

        <sl-tab-panel name="tab-1">
          <code-editor code="" language="typescript"> </code-editor>
        </sl-tab-panel>
        <sl-tab-panel name="tab-2">
          <code-editor code="" language="typescript"> </code-editor>
        </sl-tab-panel>
        <sl-tab-panel name="tab-3">
          <settings-element></settings-element>
        </sl-tab-panel>
      </sl-tab-group>
    `;
  }

  firstUpdated() {
    console.log("FragmentTabList firstUpdated");

    this.tabGroup.addEventListener("sl-close", async (event) => {
      const tab = event.target as HTMLElement;
      const panel = this.tabGroup.querySelector(
        `sl-tab-panel[name="${tab.panel}"]`
      );

      // Show the previous tab if the tab is currently active
      if (tab.active) {
        this.tabGroup.show(tab.previousElementSibling.panel);
      }

      // Remove the tab + panel
      tab.remove();
      panel.remove();
    });
  }
}
