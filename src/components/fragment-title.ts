import { LitElement, html, TemplateResult, css } from "lit";
import { customElement } from "lit/decorators.js";
import { SnippetController } from "../controllers/snippet-controller";

@customElement("fragment-title")
export class FragmentTitle extends LitElement {
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
        class="is-editable"
        value="${this.snippet.selectedSnippet.title}"
        placeholder="untitled"
        readonly
        @dblclick="${this._enableEdit}"
      />
    `;
  }

  private _enableEdit(e: MouseEvent) {
    const target = <HTMLInputElement>e.currentTarget;
    target.removeAttribute("readonly");
    target.select();
  }
}
