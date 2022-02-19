import { dispatch } from "../events/dispatcher";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Snippet } from "../models";
const { myAPI } = window;

export class SetupStorageController implements ReactiveController {
  private host: ReactiveControllerHost;

  status = false;
  msg = "";
  snippets: Snippet[] = [];

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    console.info(this.constructor.name, "has connected");
    this.setupStorage().then(() => {
      this._displayToast();
    });
    window.addEventListener(
      "update-snippets",
      this._updateSnippetsListener as EventListener
    );
  }

  async setupStorage(): Promise<void> {
    await myAPI.setupStorage().then(({ status }) => {
      if (status) {
        this._loadingSnippets();
      } else {
        this.msg = "Setup failed";
      }
    });
  }

  private _loadingSnippets() {
    this.msg = "Snippets loaded";
    myAPI.loadSnippets().then(({ status, snippets }) => {
      if (status) {
        this.snippets = snippets;
        this.msg = "Snippets loaded";
        this.host.requestUpdate();
      } else {
        this.msg = "Snippets load failed";
      }
    });
  }

  private _updateSnippetsListener = (e: CustomEvent) => {
    this.setupStorage().then(() => {
      this.msg = e.detail.message;
      this._displayToast();
    });
  };

  private _displayToast() {
    dispatch({
      type: "display-toast",
      detail: {
        message: this.msg,
      },
    });
  }
}
