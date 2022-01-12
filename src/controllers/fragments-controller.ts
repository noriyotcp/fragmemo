import { dispatch } from "../events/dispatcher";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { SnippetController } from "./snippet-controller";
import { Fragment } from "../models";

const { myAPI } = window;

export class FragmentsController implements ReactiveController {
  private host: ReactiveControllerHost;
  private snippet: SnippetController;

  fragments!: Fragment[];

  constructor(host: ReactiveControllerHost) {
    this.snippet = new SnippetController(host);
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener(
      "select-snippet",
      this._selectSnippetListener as EventListener
    );
    window.addEventListener(
      "fragment-title-changed",
      this._titleChangedListener as EventListener
    );
  }

  private _titleChangedListener = (e: CustomEvent) => {
    const { fragmentId, title } = e.detail;
    console.info("title changed", fragmentId, title);
    // update the fragments
  };

  private _selectSnippetListener = (e: CustomEvent): void => {
    this.snippet.selectedSnippet = JSON.parse(e.detail.message);
    console.info(
      this.constructor.name,
      "has selected snippet",
      this.snippet.selectedSnippet
    );
    myAPI
      .fetchFragments(<number>this.snippet.selectedSnippet._id)
      .then((fragments) => {
        this.fragments = fragments;
        this.fragments = this.setFragments(this.fragments);
        console.log("Fetch fragments", this.fragments);
        this.host.requestUpdate();
      });
  };

  setFragments(fragments: Fragment[]): Fragment[] {
    return fragments.map((fragment) => {
      return new Fragment({
        _id: fragment._id,
        title: fragment.title,
        content: fragment.content,
        snippet: fragment.snippet,
        createdAt: fragment.createdAt,
        updatedAt: fragment.updatedAt,
      });
    });
  }
}
