import { dispatch } from "../events/dispatcher";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Snippet, Fragment } from "../models";
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
    console.info(this.constructor.name, "has connected");
    this.setupStorage().then(() => {
      this._displayToast();
    });
    window.addEventListener(
      "update-snippets",
      this._updateSnippetsListener as EventListener
    );
  }

  private _updateSnippetsListener = (e: CustomEvent) => {
    this.setupStorage().then(() => {
      this.msg = e.detail.message;
      this._displayToast();
    });
  };

  async setupStorage(): Promise<void> {
    await myAPI.setupStorage().then(({ status, msg, snippets }) => {
      [this.status, this.msg, this.snippets] = [status, msg, snippets];
      // @ts-ignore
      this.snippets = this.setSnippets(this.snippets);
      console.info("Snippet instances: ", this.snippets);
      this.host.requestUpdate();
    });
  }

  private _displayToast() {
    dispatch({
      type: "display-toast",
      detail: {
        message: this.msg,
      },
    });
  }

  setSnippets(snippets: Snippet[]): Snippet[] {
    return snippets.map((snippet) => {
      return new Snippet({
        _id: snippet._id,
        title: snippet.title,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
        fragments: this.setFragments(snippet.fragments),
      });
    });
  }

  setFragments(fragments: Fragment[]): Fragment[] {
    return fragments.map((fragment) => {
      return new Fragment({
        _id: fragment._id,
        title: fragment.title,
        content: fragment.content,
        createdAt: fragment.createdAt,
        updatedAt: fragment.updatedAt,
      });
    });
  }
}
