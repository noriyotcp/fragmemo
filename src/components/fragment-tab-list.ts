import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents/dist/TabSeparator.js";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  @query("#tab-container") tabContainer!: HTMLElement;

  static styles = css`
    :host {
    }
  `;

  render(): TemplateResult {
    return html`
      <ui5-tabcontainer id="tab-container" class="full-width" collapsed fixed>
        <ui5-tab text="Home"></ui5-tab>
        <ui5-tab text="What's new" selected></ui5-tab>
        <ui5-tab text="Who are we"></ui5-tab>
        <ui5-tab text="About"></ui5-tab>
        <ui5-tab text="Contacts"></ui5-tab>
      </ui5-tabcontainer>
    `;
  }

  firstUpdated() {
    console.log("FragmentTabList connectedCallback");
    this.tabContainer.addEventListener("tab-select", ((e: CustomEvent) => {
      // e.detail.tab is ui5-tab
      console.info(
        `${e.detail.tab} / Index: ${e.detail.tabIndex} / state: ${e.detail.tab._state}`
      );
    }) as EventListener);
  }
}
