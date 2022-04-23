import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import { Fragment } from "models.d";
import { Store } from "stores";
import { activeFragment } from "../events/global-dispatchers";

@customElement("fragment-tab")
export class FragmentTab extends LitElement {
  @property({ type: Object }) fragment!: Fragment;
  @property({ type: Number }) activeFragmentId!: number;
  @queryAll(".tab-item") tabs!: Array<HTMLElement>;

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
  private _fragmentStore: typeof Store;

  iconTemplate(): TemplateResult {
    return this._isEditing
      ? html` <sl-icon name="record-fill"></sl-icon> `
      : html``;
  }

  render(): TemplateResult {
    return html`
      <div
        id="fragment-${this.fragment._id}"
        class="tab-item"
        fragmentId="${this.fragment._id}"
        active="${this._isActive(this.fragment._id)}"
        @click="${this._activeFragmentTab}"
      >
        <div class="tab-item-inner">
          <fragment-title
            fragment=${JSON.stringify(this.fragment)}
          ></fragment-title>
        </div>
        <div class="tab-icon">${this.iconTemplate()}</div>
      </div>
    `;
  }

  firstUpdated(): void {
    window.addEventListener(
      "content-editing-state-changed",
      this._onContentEditingStateChanged as EventListener
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      "content-editing-state-changed",
      this._onContentEditingStateChanged as EventListener
    );

    super.disconnectedCallback();
  }

  private _onContentEditingStateChanged = (e: CustomEvent): void => {
    if (this.fragment._id !== e.detail._id) return;

    this._fragmentStore = e.detail.fragmentStore;
    this.requestUpdate();
  };

  private get _isEditing(): boolean {
    return !!this._fragmentStore?.getCell(
      "states",
      `${this.fragment._id}`,
      "isEditing"
    );
  }

  private _isActive(fragmentId: number): boolean {
    if (!this.activeFragmentId) return false;
    return fragmentId === this.activeFragmentId;
  }

  private _activeFragmentTab(e: MouseEvent) {
    if (!e.currentTarget) return;
    const fragmentId = Number(
      (<HTMLDivElement>e.currentTarget).getAttribute("fragmentId")
    );
    // Do nothing if the fragment is already active
    if (this._isActive(fragmentId)) return;

    this.tabs.forEach((tab, _) => {
      tab.removeAttribute("active");
    });

    activeFragment(fragmentId);
  }
}
