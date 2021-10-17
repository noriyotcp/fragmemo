import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("editor-element")
export class EditorElement extends LitElement {
  @property()
  _textareaValue = "";

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

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
    console.log(e);
    this._textareaValue = e.detail.text;
  }
}
