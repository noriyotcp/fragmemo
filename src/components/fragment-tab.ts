import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query, queryAll } from "lit/decorators.js";
import { Fragment } from "models";

@customElement("fragment-tab")
export class FragmentTab extends LitElement {
  @property({ type: Object }) fragment!: Fragment;
  @property({ type: Number }) activeFragmentId!: number;
  @queryAll(".tab-item") tabs!: Array<HTMLElement>;
  @query(".tab-item[active='true']") activeTab!: HTMLElement;

  static styles = css`
    :host {
      width: 100%;
      text-align: center;
      display: flex;
      align-items: center;
    }
    .tab-item {
      width: 100%;
      display: inline-flex;
    }
    .tab-item-inner {
      display: inline-flex;
      width: 100%;
      justify-content: center;
    }
    .tab-item[active="true"] {
      background-color: var(--gray);
      color: var(--text-color);
    }
    .tab-icon {
      display: inline-flex;
      width: 19px;
      padding: 0 5px;
      justify-content: center;
      align-items: center;
    }
  `;

  tabBarTemplate(): TemplateResult {
    return html`
      <div
        id="fragment-${this.fragment._id}"
        class="tab-item"
        fragmentId="${this.fragment._id}"
        active="${this._isActive(this.fragment._id)}"
        @click="${this._onClickListener}"
      >
        <div class="tab-item-inner">
          ${this.fragment.title || `fragment ${this.fragment._id}`}
        </div>
        <div class="tab-icon"><sl-icon name="record-fill"></sl-icon></div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`${this.tabBarTemplate()}`;
  }

  private _isActive(fragmentId: number): boolean {
    if (!this.activeFragmentId) return false;
    return fragmentId === this.activeFragmentId;
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
}