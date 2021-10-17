import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
const { myAPI } = window;

@customElement("app-element")
export class AppElement extends LitElement {
  @state()
  private _current_page = "home-element";
  @property()
  _textareaValue = "";

  static styles = [
    css`
      :host {
        display: block;
        margin-top: 100px;
        width: 100%;
        height: 100vh;
        position: fixed;
        top: 0;
        overflow: hidden;
      }
    `,
  ];

  render(): TemplateResult {
    if (this._current_page == "home-element") {
      return html`
        <test-header textareaValue="${this._textareaValue}"></test-header>
        <code-editor
          code="console.log('Hello World');"
          language="typescript"
          @change-text="${this._changeTextListener}"
        >
        </code-editor>
      `;
    } else {
      return html`<settings-element
        @back-to-home=${this._backToHomeListener}
      ></settings-element>`;
    }
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.openSettings((_e: Event, elementName: string) =>
      this._openSettings(elementName)
    );
  }

  private async _openSettings(elementName: string): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    console.log(elementName);
    this._current_page = elementName;
  }

  private _backToHomeListener(e: CustomEvent) {
    console.log(e.detail.elementName);
    this._current_page = e.detail.elementName;
  }

  private _changeTextListener(e: CustomEvent) {
    console.log(e);
    this._textareaValue = e.detail.text;
  }
}
