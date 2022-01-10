import { LitElement, html, TemplateResult, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("fragment-title")
export class FragmentTitle extends LitElement {
  @query("input") private inputElement!: HTMLInputElement;
  @property({ type: String })
  initialValue!: string;
  @property({ type: String })
  title = "";

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
        value="${this.title}"
        placeholder="untitled"
        readonly
        @dblclick="${this._enableEdit}"
        @keydown="${this._disableEditOnEnter}"
        @blur="${this._disableEditOnBlur}"
      />
    `;
  }

  updated() {
    console.info("title updated", this.title);
  }

  private _enableEdit(e: MouseEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    this.initialValue = this.inputElement.value;
    target.removeAttribute("readonly");
    target.select();
  }

  private _disableEditOnEnter(e: KeyboardEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    if (!e.isComposing) {
      if (e.key === "Enter") {
        target.setAttribute("readonly", "true");
      }
      if (e.key === "Escape") {
        target.value = this.initialValue;
        target.setAttribute("readonly", "true");
      }
    }
  }

  private _disableEditOnBlur(e: FocusEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    target.setAttribute("readonly", "true");
  }
}
