import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

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
}
