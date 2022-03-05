import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("home-element")
export class HomeElement extends LitElement {
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

  render(): TemplateResult {
    return html`
      <toast-element></toast-element>
      <editor-element></editor-element>
    `;
  }
}
