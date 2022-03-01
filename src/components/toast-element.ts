import { LitElement, html, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "@ui5/webcomponents/dist/Toast.js";
import { Override } from "index.d";

@customElement("toast-element")
export class ToastElement extends LitElement {
  @query("#wcToastBE") private toast!: Override<
    HTMLElement,
    { show: () => void }
  >;
  @property({ type: String })
  toastContent!: string;

  render(): TemplateResult {
    return html`
      <ui5-toast id="wcToastBE" placement="BottomEnd">
        <p>
          <a
            href="https://sap.github.io/ui5-webcomponents/playground/components/Toast/"
            target="_blank"
            >UI5 Toast</a
          >
        </p>
        <p>${this.toastContent}</p>
      </ui5-toast>
    `;
  }

  firstUpdated() {
    window.addEventListener(
      "display-toast",
      this._displayToastListener as EventListener
    );
  }

  private _displayToastListener = (e: CustomEvent): void => {
    this.toast.show();
    this.toastContent = e.detail.message || "Default text";
  };
}
