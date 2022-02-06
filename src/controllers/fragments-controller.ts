import { ReactiveController, ReactiveControllerHost } from "lit";
import { SnippetController } from "./snippet-controller";
import { Fragment } from "../models";

const { myAPI } = window;

export class FragmentsController implements ReactiveController {
  private host: ReactiveControllerHost;
  public snippet: SnippetController;

  fragments!: Fragment[];
  activeFragmentId = 0;

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
    window.addEventListener(
      "active-fragment",
      this._activeFragmentListener as EventListener
    );
  }

  private _titleChangedListener = (e: CustomEvent) => {
    const { fragmentId, title } = e.detail;
    console.info("title changed", fragmentId, title);
    // update the fragments
  };

  private _selectSnippetListener = (e: CustomEvent): void => {
    this.snippet.selectedSnippet = JSON.parse(e.detail.selectedSnippet);
    // Get the snippet by id from Realm DB
    myAPI
      .getSnippet(<number>this.snippet.selectedSnippet._id)
      .then((snippet) => {
        this.snippet.selectedSnippet = snippet as unknown as Record<
          string,
          unknown
        >;
      });
    console.info(
      "previouslySelectedSnippet",
      JSON.parse(e.detail.previouslySelectedSnippet)
    );
    myAPI
      .getActiveFragment(<number>this.snippet.selectedSnippet._id)
      .then((activeFragment) => {
        this.activeFragmentId = activeFragment.fragmentId;
      });

    myAPI
      .fetchFragments(<number>this.snippet.selectedSnippet._id)
      .then((fragments) => {
        this.fragments = fragments;
        this.fragments = this.setFragments(this.fragments);
        console.log("Fetch fragments", this.fragments, this.activeFragmentId);
        this.host.requestUpdate();
      });
  };

  private _activeFragmentListener = (e: CustomEvent): void => {
    if (!this.snippet.selectedSnippet._id) return;

    this.activeFragmentId = e.detail.activeFragmentId;
    // Update ActiveFragment in Realm DB
    myAPI
      .updateActiveFragment({
        properties: {
          fragmentId: this.activeFragmentId,
          snippetId: this.snippet.selectedSnippet._id,
        },
      })
      .then(({ status }) => {
        console.log("myAPI.updateActiveFragment", status);
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
