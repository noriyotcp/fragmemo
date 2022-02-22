import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { FragmentsController } from "../controllers/fragments-controller";

const { myAPI } = window;

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @query("sl-tab-group") tabGroup!: HTMLElement;
  @queryAll("fragment-tab") tabs!: Array<HTMLElement>;
  @query(".tab-item[active='true']") activeTab!: HTMLElement;
  @state() private currentTabIndex = 0;

  static styles = css`
    section {
      display: flex;
      flex-wrap: nowrap;
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

  tabBarTemplate(): TemplateResult {
    const fragments = this.fragmentsController.fragments;
    return html`
      <section>
        ${map(fragments, (fragment, _) => {
          return html`
            <fragment-tab
              fragment=${JSON.stringify(fragment)}
              activeFragmentId="${this.fragmentsController.activeFragmentId}"
            ></fragment-tab>
          `;
        })}
      </section>
    `;
  }

  render(): TemplateResult {
    return html`${this.tabBarTemplate()}`;
  }

  firstUpdated(): void {
    myAPI.nextTab((_e: Event) => this.nextTab());
    myAPI.previousTab((_e: Event) => this.previousTab());
  }

  nextTab() {
    this.currentTabIndex++;
    if (this.currentTabIndex > this.lastTabIndex) {
      this.currentTabIndex = 0;
    }
    console.log("nextTab", this.currentTabIndex);
  }

  previousTab() {
    this.currentTabIndex--;
    if (this.currentTabIndex < 0) {
      this.currentTabIndex = this.lastTabIndex;
    }
    console.log("previousTab", this.currentTabIndex);
  }

  public get lastTabIndex(): number {
    return this.tabs.length - 1;
  }

  updated() {
    if (this.fragmentsController.activeFragmentId) {
      this.dispatchEvent(
        new CustomEvent("fragment-activated", {
          detail: {
            activeFragmentId: this.fragmentsController.activeFragmentId,
          },
        })
      );
    }
  }
}
