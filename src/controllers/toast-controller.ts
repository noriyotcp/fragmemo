import { ReactiveController, ReactiveControllerHost } from "lit";

export class ToastController implements ReactiveController {
  private host: ReactiveControllerHost;

  text = "";

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "display-toast",
      this._displayToastListener as EventListener
    );
    console.info(this.constructor.name, "has connected");
  }

  private _displayToastListener = (e: CustomEvent): void => {
    this.text = e.detail.message || "Default text";
    e.detail.target.show();
    this.host.requestUpdate();
  };
}
