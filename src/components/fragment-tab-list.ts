import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  @query("#tab-container") tabContainer!: HTMLElement;
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
        <sl-tab slot="nav" panel="tab-4" closable>Tab 4</sl-tab>
        <sl-tab slot="nav" panel="tab-5" closable>Tab 5</sl-tab>
        <sl-tab slot="nav" panel="tab-6" closable>Tab 6</sl-tab>
        <sl-tab slot="nav" panel="tab-7" closable>Tab 7</sl-tab>
        <sl-tab slot="nav" panel="tab-8" closable>Tab 8</sl-tab>
        <sl-tab slot="nav" panel="tab-9" closable>Tab 9</sl-tab>
        <sl-tab slot="nav" panel="tab-10" closable>Tab 10</sl-tab>
        <sl-tab slot="nav" panel="tab-11" closable>Tab 11</sl-tab>
        <sl-tab slot="nav" panel="tab-12" closable>Tab 12</sl-tab>
        <sl-tab slot="nav" panel="tab-13" closable>Tab 13</sl-tab>
        <sl-tab slot="nav" panel="tab-14" closable>Tab 14</sl-tab>
        <sl-tab slot="nav" panel="tab-15" closable>Tab 15</sl-tab>
        <sl-tab slot="nav" panel="tab-16" closable>Tab 16</sl-tab>
        <sl-tab slot="nav" panel="tab-17" closable>Tab 17</sl-tab>
        <sl-tab slot="nav" panel="tab-18" closable>Tab 18</sl-tab>
        <sl-tab slot="nav" panel="tab-19" closable>Tab 19</sl-tab>
        <sl-tab slot="nav" panel="tab-20" closable>Tab 20</sl-tab>
      </sl-tab-group>
    `;
  }

  firstUpdated() {
    console.log("FragmentTabList firstUpdated");

    this.tabGroup.addEventListener("sl-close", async (event) => {
      const tab = event.target as HTMLElement;
      // Remove the tab
      tab.remove();
    });
  }
}
