import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
const { myAPI } = window;

@customElement("home-element")
export class HomeElement extends LitElement {
  @state()
  private _current_page = "home-element";

  static styles = [
    css`
      :host {
        display: block;
        height: 100vh;
        position: fixed;
        top: 0;
        right: 0;
        overflow: hidden;
      }
    `,
  ];

  toastTemplate() {
    return html`<toast-element></toast-element>`;
  }

  render(): TemplateResult {
    if (this._current_page == "home-element") {
      return html`
        ${this.toastTemplate()}
        <editor-element></editor-element>
        <footer>This is the footer</footer>
      `;
    } else {
      return html`
        ${this.toastTemplate()}
        <settings-element
          @back-to-home=${this._backToHomeListener}
        ></settings-element>
      `;
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
}
