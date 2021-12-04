import { LitElement, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "@ui5/webcomponents/dist/Toast.js";

@customElement("toast-element")
export class ToastElement extends LitElement {
  render(): TemplateResult {
    return html`
      <ui5-toast id="wcToastBE" placement="BottomEnd">
        <slot name="toast-text"></slot>
      </ui5-toast>
    `;
  }
}
