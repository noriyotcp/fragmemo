import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
const { myAPI } = window;

@customElement("app-element")
export class AppElement extends LitElement {
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
    return html` <home-element></home-element> `;
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
  }
}
