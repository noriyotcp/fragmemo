import { ReactiveController, ReactiveControllerHost } from "lit";

const { myAPI } = window;

export class SetupStorageController implements ReactiveController {
  private host: ReactiveControllerHost;

  status = false;
  msg = "";
  snippets = [];

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "select-snippet",
      this._selectSnippetListener as EventListener
    );
    console.info(this.constructor.name, "has connected");
    myAPI.setupStorage().then(({ status, msg, snippets }) => {
      [this.status, this.msg, this.snippets] = [status, msg, snippets];
      console.info(this.snippets);
      this.host.requestUpdate();
    });
  }

  private _selectSnippetListener = (e: CustomEvent): void => {
    console.log(e.detail.message);
  };
}
