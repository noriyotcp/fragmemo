import { LitElement, html, TemplateResult, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("settings-element")
export class SettingsElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        color: ghostwhite;
      }
      header {
        display: grid;
        grid-template-columns: 7fr 1fr;
        align-items: center;
        justify-content: spece-between;
      }
      div.close {
        text-align: center;
        cursor: pointer;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <header>
        <h1>Settings</h1>
        <div class="close">
          <span>X</span>
        </div>
      </header>
    `;
  }
}
