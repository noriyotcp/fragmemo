import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, queryAll } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { styleMap } from "lit/directives/style-map.js";
import { FragmentsController } from "../controllers/fragments-controller";

const { myAPI } = window;

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @queryAll("fragment-tab") tabs!: Array<HTMLElement>;

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
    const styles = { display: fragments?.length === 1 ? "none" : "" };
    return html`
      <section style=${styleMap(styles)}>
        ${map(fragments, (fragment, _) => {
          return html`
            <fragment-tab
              fragment=${JSON.stringify(fragment)}
              activeFragmentId="${this.fragmentsController.activeFragmentId}"
              @contextmenu="${this._showContextMenu}"
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
    myAPI.contextMenuCommand((_e: Event, command) =>
      this._contextMenuCommand(_e, command)
    );
  }

  private _showContextMenu(e: MouseEvent): void {
    e.preventDefault();
    // e.stopImmediatePropagation();
    myAPI.showContextMenu();
  }
  private _contextMenuCommand(e: Event, command: string): void {
    console.log(e);
    console.log(command);
  }

  private nextTab() {
    this.fragmentsController.currentTabIndex++;
    if (this.fragmentsController.currentTabIndex > this.lastTabIndex) {
      this.fragmentsController.currentTabIndex = 0;
    }
    this._clickTab();
    console.log("nextTab", this.fragmentsController.currentTabIndex);
  }

  private previousTab() {
    this.fragmentsController.currentTabIndex--;
    if (this.fragmentsController.currentTabIndex < 0) {
      this.fragmentsController.currentTabIndex = this.lastTabIndex;
    }
    this._clickTab();
    console.log("previousTab", this.fragmentsController.currentTabIndex);
  }

  private _clickTab() {
    (
      this.tabs[
        this.fragmentsController.currentTabIndex
      ].shadowRoot?.querySelector(".tab-item") as HTMLElement
    ).click();
  }

  private get lastTabIndex(): number {
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
