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
        margin-top: 47px;
      }

      header {
        max-height: 53px;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <header>
        <test-header textareaValue="${this._textareaValue}"></test-header>
        <fragment-tab-list></fragment-tab-list>
      </header>
      <code-editor code="" language="typescript"> </code-editor>
    `;
  }
}
