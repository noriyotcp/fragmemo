import { ReactiveController, ReactiveControllerHost } from "lit";

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
  }

  private _selectSnippetListener = (e: CustomEvent): void => {
    this.selectedSnippet = JSON.parse(e.detail.selectedSnippet);
    console.info(
      "previouslySelectedSnippet",
      JSON.parse(e.detail.previouslySelectedSnippet)
    );
    this.host.requestUpdate();
  };
}
