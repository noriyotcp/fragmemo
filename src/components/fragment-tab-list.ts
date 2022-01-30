import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { FragmentsController } from "../controllers/fragments-controller";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @query("sl-tab-group") tabGroup!: HTMLElement;
  @queryAll(".tab-item") tabs!: Array<HTMLElement>;
  @query(".tab-item[active='true']") activeTab!: HTMLElement;

  static styles = css`
    :host {
    }
    section {
      display: flex;
      flex-wrap: nowrap;
    }
    .tab-item {
      width: 100%;
      text-align: center;
    }
    .tab-item[active="true"] {
      background-color: var(--gray);
      color: ghostwhite;
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
            <div
              id="fragment-${fragment._id}"
              class="tab-item"
              fragmentId="${fragment._id}"
              active="${this._isActive(fragment._id)}"
              @click="${this._onClickListener}"
            >
              ${fragment.title || `fragment ${fragment._id}`}
            </div>
          `;
        })}
      </section>
    `;
  }

  render(): TemplateResult {
    return html`${this.tabBarTemplate()}`;
  }

  updated() {
    const activeFragmentId = this.activeTab?.getAttribute("fragmentid");
    this.dispatchEvent(
      new CustomEvent("fragment-activated", {
        detail: {
          activeFragmentId,
        },
      })
    );
  }

  private _isActive(fragmentId: number): boolean {
    return fragmentId === this.fragmentsController.activeFragmentId;
  }

  private _onClickListener(e: MouseEvent) {
    if (!e.currentTarget) return;
    const fragmentId = Number(
      (<HTMLDivElement>e.currentTarget).getAttribute("fragmentId")
    );
    // Do nothing if the fragment is already active
    if (this._isActive(fragmentId)) return;

    this.tabs.forEach((tab, _) => {
      tab.removeAttribute("active");
    });

    dispatch({
      type: "active-fragment",
      detail: {
        activeFragmentId: fragmentId,
      },
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
