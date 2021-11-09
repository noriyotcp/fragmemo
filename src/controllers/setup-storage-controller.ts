import { ReactiveController, ReactiveControllerHost } from "lit";
import { setupStorageResultType } from "src/@types/global";

const { myAPI } = window;

export class SetupStorageController implements ReactiveController {
  private host: ReactiveControllerHost;

  status = false;
  msg = "";
  snippets = {};

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    console.info(this.constructor.name, "has connected");
    myAPI
      .setupStorage()
      .then(({ status, msg, snippets }: setupStorageResultType) => {
        this.status = status;
        this.msg = msg;
        this.snippets = snippets;
        this.host.requestUpdate();
      });
  }
}
