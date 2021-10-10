import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("x-home-view")
export class XHomeView extends LitElement {
  render(): TemplateResult {
    return html` <h1>Home</h1> `;
  }
}
