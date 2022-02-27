import { ReactiveController, ReactiveControllerHost } from "lit";

export class ViewStatesController implements ReactiveController {
  private host: ReactiveControllerHost;

  currentFragmentId: number | null = null;
  previousFragmentId: number | null = null;
  currentSnippetId: number | null = null;
  isSnippetSwitched = false;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "fragment-switched",
      this._fragmentSwitchedListener as EventListener
    );
    window.addEventListener(
      "snippet-selected",
      this._snippetSelectedListener as EventListener
    );
  }

  private _fragmentSwitchedListener = (e: CustomEvent) => {
    this.isSnippetSwitched = false;

    this.currentFragmentId = e.detail.to;
    this.previousFragmentId = e.detail.from;

    console.log("fragment-switched", e.detail);
  };

  private _snippetSelectedListener = (e: CustomEvent) => {
    this.isSnippetSwitched = this.currentSnippetId !== e.detail.snippetId;
    this.currentSnippetId = e.detail.snippetId;

    this.currentFragmentId = e.detail.to;
    this.previousFragmentId = e.detail.from;

    console.log("snippet-selected", e.detail);
  };
}
