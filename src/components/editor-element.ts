import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("editor-element")
export class EditorElement extends LitElement {
  @property()
  _textareaValue = "";
  @state()
  private _code = "";

  static styles = [
    css`
      :host {
        display: block;
        margin-top: 41px;
      }

      header {
        max-height: 59px;
      }

      footer {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #808080b5;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `,
  ];

  activeFragment(e: CustomEvent): void {
    console.log(e.type, e.detail.activeFragmentId);

    this._code = e.detail.activeFragmentId;
  }

  render(): TemplateResult {
    return html`
      <header>
        <test-header textareaValue="${this._textareaValue}"></test-header>
        <fragment-tab-list
          @fragment-activated=${this.activeFragment}
        ></fragment-tab-list>
        <code-editor
          code="const num: number = ${this._code};"
          language="typescript"
        ></code-editor>
      </header>
      <footer>
        <div>Language</div>
        <div>Item</div>
      </footer>
    `;
  }
}
