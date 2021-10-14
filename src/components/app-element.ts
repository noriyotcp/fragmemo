import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
const { myAPI } = window;

@customElement("app-element")
export class AppElement extends LitElement {
  @state()
  private _current_page = "settings-element";

  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }
    `,
  ];

  render(): TemplateResult {
    if (this._current_page == "settings-element") {
      return html`<settings-element
        @back-to-home=${this._backToHomeListener}
      ></settings-element>`;
    } else {
      return html`<home-element></home-element>`;
    }
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.openSettings((_e: Event, message: string) =>
      this._openSettings(message)
    );
  }

  private async _openSettings(message: string): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    console.log(message);
    this._current_page = message;
  }

  private _backToHomeListener(e: CustomEvent) {
    console.log(e.detail.elementName);
    this._current_page = e.detail.elementName;
  }
}
