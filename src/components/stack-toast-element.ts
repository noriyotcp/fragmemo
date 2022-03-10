import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "@ui5/webcomponents/dist/Toast.js";

@customElement("stack-toast-element")
export class StackToastElement extends LitElement {
  count = 0;

  firstUpdated() {
    window.addEventListener(
      "display-stack-toast",
      this._displayToastListener as EventListener
    );
  }

  // Always escape HTML for text arguments!
  escapeHtml(html: string): string {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  // Custom function to emit toast notifications
  notify(
    message: string,
    variant = "primary",
    icon = "info-circle",
    duration?: number
  ) {
    type alertType = HTMLElement & {
      variant: string;
      closable: boolean;
      duration?: number;
      innerHTML: string;
      toast?: () => void;
    };
    const alert: alertType = Object.assign(document.createElement("sl-alert"), {
      variant,
      closable: true,
      duration,
      innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${this.escapeHtml(message)}
      `,
    });

    document.body.append(alert);
    return alert.toast?.();
  }

  private _displayToastListener = (e: CustomEvent): void => {
    this.notify(
      `${e.detail.message} #${++this.count}`,
      undefined,
      undefined,
      5000
    );
  };
}
