import { StackToastController } from "../controllers/toast-stack-controller";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("home-element")
export class HomeElement extends LitElement {
  constructor() {
    super();
    new StackToastController(this);
  }

  static styles = [
    css`
      :host {
        display: block;
        height: 100vh;
        position: fixed;
        top: 0;
        right: 0;
        overflow: hidden;
        border-left: 1px solid var(--dark-gray);
      }
    `,
  ];

  render(): TemplateResult {
    return html` <editor-element></editor-element> `;
  }
}
