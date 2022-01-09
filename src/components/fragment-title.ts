import { LitElement, html, TemplateResult, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { SnippetController } from "../controllers/snippet-controller";

@customElement("fragment-title")
export class FragmentTitle extends LitElement {
  @query("input") private inputElement!: HTMLInputElement;
  @property({ type: String })
  initialValue!: string;

  private snippet = new SnippetController(this);

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
        value="${this.snippet.selectedSnippet.title}"
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
