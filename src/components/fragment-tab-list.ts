import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, queryAll, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { styleMap } from "lit/directives/style-map.js";
import { FragmentsController } from "../controllers/fragments-controller";
import { dispatch } from "../events/dispatcher";
import { IdsOnDeleteFragment } from "index.d";
import { Fragment } from "models.d";

const { myAPI } = window;

interface ITabOnContext {
  fragmentId: number;
  tabIndex: number;
}

interface TabType extends HTMLElement {
  fragment: Fragment;
  activeFragmentId: number;
}

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  private tabOnContext!: ITabOnContext;
  @queryAll("fragment-tab") tabs!: Array<HTMLElement>;

  static styles = css`
    section {
      flex-wrap: nowrap;
      height: 22px;
      border: 1px solid var(--gray);
    }
  `;

  tabBarTemplate(): TemplateResult {
    const fragments = this.fragmentsController.fragments;
    const styles = { display: fragments?.length === 1 ? "none" : "flex" };
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
    myAPI.nextTab((_e: Event) => this._nextTab());
    myAPI.previousTab((_e: Event) => this._previousTab());
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

  private _idsOnDeleteFragment({
    fragmentId,
    tabIndex,
  }: ITabOnContext): IdsOnDeleteFragment {
    const tab = Array.from(this.tabs).find(
      (tab) => (<TabType>tab).fragment._id === fragmentId
    ) as TabType;

    const nextActiveIndex = () => {
      return tabIndex <= 0 ? tabIndex + 1 : tabIndex - 1;
    };

    const nextActiveTab = Array.from(this.tabs).find((tab) => {
      return (<TabType>tab).tabIndex === nextActiveIndex();
    }) as TabType;

    if (tab.fragment._id === tab.activeFragmentId) {
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
      myAPI
        .deleteFragment(this._idsOnDeleteFragment(this.tabOnContext))
        .then(() => {
          dispatch({
            type: "update-snippets",
            detail: {
              message: "Fragment deleted",
            },
          });
        });
    }
  }

  private _nextTab() {
    this.fragmentsController.currentTabIndex++;
    if (this.fragmentsController.currentTabIndex > this.lastTabIndex) {
      this.fragmentsController.currentTabIndex = 0;
    }
    this._clickTab();
  }

  private _previousTab() {
    this.fragmentsController.currentTabIndex--;
    if (this.fragmentsController.currentTabIndex < 0) {
      this.fragmentsController.currentTabIndex = this.lastTabIndex;
    }
    this._clickTab();
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

  updated(): void {
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
