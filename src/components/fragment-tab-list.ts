import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, queryAll, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { styleMap } from "lit/directives/style-map.js";
import { FragmentsController } from "../controllers/fragments-controller";
import { Override } from "index";
import { Fragment } from "models";

const { myAPI } = window;

interface ITabOnContext {
  fragmentId: number;
  tabIndex: number;
}

interface FragmentIdToDelete {
  fragmentId: number;
  nextActiveFragmentId?: number;
}

type TabType = Override<
  HTMLElement,
  { fragment: Fragment; activeFragmentId: number }
>;

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @state() private tabOnContext!: ITabOnContext;
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
        ${map(fragments, (fragment, index) => {
          return html`
            <fragment-tab
              fragment=${JSON.stringify(fragment)}
              activeFragmentId="${this.fragmentsController.activeFragmentId}"
              tabIndex="${index}"
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
    const fragment = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (<HTMLElement>e.currentTarget).getAttribute("fragment")!
    );

    this.tabOnContext = {
      fragmentId: fragment._id,
      tabIndex: Number((<HTMLElement>e.currentTarget).getAttribute("tabIndex")),
    };
    myAPI.showContextMenu();
  }

  fragmentIdToDelete({
    fragmentId,
    tabIndex,
  }: ITabOnContext): FragmentIdToDelete {
    const tab = Array.from(this.tabs).find(
      (tab) => (<TabType>tab).fragment._id === fragmentId
    ) as TabType;

    const isActiveTab = tab.fragment._id === tab.activeFragmentId;

    const nextActiveIndex = () => {
      if (tabIndex <= 0) {
        return tabIndex + 1;
      } else {
        return tabIndex - 1;
      }
    };

    const nextActiveTab = Array.from(this.tabs).find(
      (tab) => (<TabType>tab).tabIndex === nextActiveIndex()
    ) as TabType;

    if (isActiveTab) {
      return {
        fragmentId: tab.fragment._id,
        nextActiveFragmentId: nextActiveTab.fragment._id,
      };
    } else {
      return {
        fragmentId: tab.fragment._id,
      };
    }
  }

  private _contextMenuCommand(e: Event, command: string): void {
    if (command === "delete-fragment") {
      myAPI.deleteFragment(this.fragmentIdToDelete(this.tabOnContext));
    }
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
