import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Store } from "stores";

@customElement("editing-state-icon")
export class EditingStateIcon extends LitElement {
  @state() private _isEditing!: boolean;
  private _fragmentStore: typeof Store;

  static styles = css`
    :host {
      display: flex;
      justify-content: flex-end;
    }
    .editing-state-icon {
      display: inline-flex;
      width: 19px;
      padding: 0 5px;
      justify-content: center;
      align-items: center;
    }
    .rotate-icon {
      animation: rotation 2s linear infinite;
    }
    @keyframes rotation {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(359deg);
      }
    }
  `;

  iconTemplate(): TemplateResult {
    return this._isEditing
      ? html` <sl-icon name="arrow-repeat" class="rotate-icon"></sl-icon> `
      : html``;
  }

  render(): TemplateResult {
    return html` <div class="editing-state-icon">${this.iconTemplate()}</div> `;
  }

  firstUpdated(): void {
    window.addEventListener(
      "content-editing-state-changed",
      this._stateChangedListener as EventListener
    );
    window.addEventListener(
      "snippet-selected",
      this._snippetSelectedListener as EventListener
    );
    window.addEventListener(
      "active-fragment",
      this._activeFragmentListener as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener(
      "content-editing-state-changed",
      this._stateChangedListener as EventListener
    );
    window.removeEventListener(
      "snippet-selected",
      this._snippetSelectedListener as EventListener
    );
    window.removeEventListener(
      "active-fragment",
      this._activeFragmentListener as EventListener
    );
  }

  private _snippetSelectedListener = (e: CustomEvent) => {
    // e.detail.to is active fragment ID
    this._setIsEditing(e.detail.to);
  };

  private _activeFragmentListener = (e: CustomEvent) => {
    this._setIsEditing(e.detail.activeFragmentId);
  };

  private _stateChangedListener = (e: CustomEvent): void => {
    this._fragmentStore = e.detail.fragmentStore;
    this._setIsEditing(e.detail._id);
  };

  private _setIsEditing(fragmentId: number) {
    this._isEditing = !!this._fragmentStore?.getCell(
      "states",
      `${fragmentId}`,
      "isEditing"
    );
  }
}
