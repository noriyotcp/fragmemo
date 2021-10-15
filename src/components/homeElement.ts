import { LitElement, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("home-element")
export class HomeElement extends LitElement {
  @state()
  private _textareaValue = "";

  render(): TemplateResult {
    return html`
      <test-header textareaValue="${this._textareaValue}"></test-header>
      <code-editor
        code="console.log('Hello World');"
        language="typescript"
        @change-text="${this._changeTextListener}"
      >
      </code-editor>
    `;
  }

  private _changeTextListener(e: CustomEvent) {
    this._textareaValue = e.detail.text;
  }
}
