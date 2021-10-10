import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("x-user-profile")
export class XUserProfile extends LitElement {
  render(): TemplateResult {
    return html`
      <h1>User Profile</h1>
      <p>Name: you-know-who</p>
    `;
  }
}
