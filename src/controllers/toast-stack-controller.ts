import { ReactiveController, ReactiveControllerHost } from "lit";

type alertType = HTMLElement & {
  variant: string;
  closable: boolean;
  duration?: number;
  innerHTML: string;
  toast?: () => void;
};

type PropsType = {
  message: string;
  variant: string;
  icon: string;
  duration?: number;
};

export class ToastStackController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "display-toast-stack",
      this._displayToast as EventListener
    );
  }

  hostDisconnected(): void {
    window.removeEventListener(
      "display-toast-stack",
      this._displayToast as EventListener
    );
  }

  // Always escape HTML for text arguments!
  escapeHtml(html: string): string {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  // Custom function to emit toast notifications
  notify({ variant, duration, icon, message }: PropsType) {
    const alert: alertType = Object.assign(document.createElement("sl-alert"), {
      variant: variant,
      closable: true,
      duration: duration,
      innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${this.escapeHtml(message)}
      `,
    });

    document.body.append(alert);
    return alert.toast?.();
  }

  private _displayToast = (e: CustomEvent): void => {
    this.notify({
      message: `${e.detail.message}`,
      variant: e.detail.variant,
      icon: e.detail.icon,
      duration: e.detail.duration ?? 2000,
    });
  };
}
