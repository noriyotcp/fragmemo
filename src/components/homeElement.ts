import { LitElement, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("home-element")
export class HomeElement extends LitElement {
  render(): TemplateResult {
    return html`
      <test-header></test-header>
      <code-editor code="console.log('Hello World');" language="typescript">
      </code-editor>
    `;
  }
}
