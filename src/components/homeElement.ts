import { LitElement, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("home-element")
export class HomeElement extends LitElement {
  render(): TemplateResult {
    return html`
      <div id="textarea" rows="4">
        <form>
          <button type="button" id="btn-save">保存</button>
          <span id="message"></span>
        </form>
        <textarea id="text"></textarea>
      </div>
      <code-editor code="console.log('Hello World');" language="typescript">
      </code-editor>
    `;
  }
}
