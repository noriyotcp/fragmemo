import { LitElement, html, TemplateResult, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { Fragment } from "models.d";
import { dispatch } from "../events/dispatcher";

const { myAPI } = window;

@customElement("fragment-title")
export class FragmentTitle extends LitElement {
  @query("input") private inputElement!: HTMLInputElement;
  @property({ type: String })
  title = "";
  @property({ type: Object }) fragment!: Fragment;
  @state() editable = false;

  static styles = [
    css`
      :host {
        width: 100%;
      }

      input {
        background-color: transparent;
        color: white;
        border: none;
        text-align: center;
        width: 100%;
      }
      input[readonly] {
        outline: none;
      }
      input:not([readonly]):focus-visible {
        outline: var(--sl-color-primary-600) solid 1px;
      }
      input::placeholder {
        color: var(--placeholder-color);
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <input
        type="text"
        .value=${live(this.fragment.title)}
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
        this._updateFragmentTitle();
        this._titleChanged();
      }
      if (e.key === "Escape") {
        target.value = this.fragment.title;
        target.setAttribute("readonly", "true");
      }
    }
  }

  private _disableEditOnBlur(e: FocusEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    target.setAttribute("readonly", "true");
  }

  private _updateFragmentTitle() {
    myAPI
      .updateFragment({
        _id: this.fragment._id,
        properties: {
          title: this.inputElement.value,
        },
      })
      .then(() => {
        dispatch({
          type: "update-snippets",
        });
      });
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
