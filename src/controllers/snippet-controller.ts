import { ReactiveController, ReactiveControllerHost } from "lit";
const { myAPI } = window;

export class SnippetController implements ReactiveController {
  private host: ReactiveControllerHost;

  selectedSnippet: Record<string, unknown> = {};

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

    window.addEventListener(
      "snippet-changed",
      this._snippetChangedListener as EventListener
    );
  }

  private _selectSnippetListener = (e: CustomEvent): void => {
    this.selectedSnippet = JSON.parse(e.detail.message);
    this.host.requestUpdate();
  };

  private _snippetChangedListener = (e: CustomEvent): void => {
    console.info("Changed Data: ", e.detail.properties);
    myAPI.updateSnippet(e.detail);
    this.host.requestUpdate();
  };
}
