import { dispatch } from "../events/dispatcher";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Snippet } from "../models";
const { myAPI } = window;

export class SetupStorageController implements ReactiveController {
  private host: ReactiveControllerHost;

  snippets: Snippet[] = [];

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    console.info(this.constructor.name, "has connected");
    this.setupStorage();
    window.addEventListener(
      "update-snippets",
      this._updateSnippetsListener as EventListener
    );
  }

  async setupStorage(): Promise<void> {
    await myAPI
      .setupStorage()
      .then(() => {
        this._loadSnippets();
        this._displayToast("Snippets loaded");
      })
      .catch((err) => {
        console.error(err);
        this._displayToast("Setup failed");
      });
  }

  private _loadSnippets() {
    myAPI
      .loadSnippets()
      .then((snippets) => {
        this.snippets = snippets;
        this.host.requestUpdate();
      })
      .catch((err) => {
        console.error(err);
        this._displayToast("Snippets load failed");
      });
  }

  private _updateSnippetsListener = (e: CustomEvent) => {
    this._loadSnippets();
    this._displayToast(e.detail.message);
  };

  private _displayToast(message: string) {
    dispatch({
      type: "display-toast",
      detail: {
        message,
      },
    });
  }
}
