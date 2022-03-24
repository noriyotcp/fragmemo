import { LitElement, html, TemplateResult, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { Fragment } from "models.d";
import { dispatch } from "../events/dispatcher";

@customElement("fragment-title")
export class FragmentTitle extends LitElement {
  @query("input") private inputElement!: HTMLInputElement;
  @property({ type: String })
  title = "";
  @property({ type: Number })
  fragmentId!: number;
  @property({ type: Object }) fragment!: Fragment;
  @state() editable = false;

  static styles = [
    css`
      :host {
      }

      input {
        background-color: transparent;
        color: white;
        border: none;
        text-align: center;
      }
      input[readonly] {
        outline: none;
      }
      input:not([readonly]):focus-visible {
        outline: var(--sl-color-primary-600) solid 1px;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <input
        type="text"
        .value=${live(this.fragment.title) || "untitled"}
        placeholder="untitled"
        readonly
        @dblclick="${this._enableEdit}"
        @keydown="${this._disableEditOnEnter}"
        @blur="${this._disableEditOnBlur}"
      />
    `;
  }

  private _enableEdit(e: MouseEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    target.removeAttribute("readonly");
    target.select();
  }

  private _disableEditOnEnter(e: KeyboardEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    if (!e.isComposing) {
      if (e.key === "Enter") {
        target.setAttribute("readonly", "true");
        this._titleChanged();
      }
      if (e.key === "Escape") {
        target.value = this.fragment.title;
        target.setAttribute("readonly", "true");
        this._titleChanged();
      }
    }
  }

  private _disableEditOnBlur(e: FocusEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    target.setAttribute("readonly", "true");
  }

  private _titleChanged() {
    dispatch({
      type: "fragment-title-changed",
      detail: {
        fragmentId: this.fragment._id,
        title: this.inputElement.value,
      },
    });
  }
}
