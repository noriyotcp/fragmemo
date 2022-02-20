import { ReactiveController, ReactiveControllerHost } from "lit";
import { Fragment, Snippet } from "../models";

const { myAPI } = window;

export class FragmentsController implements ReactiveController {
  private host: ReactiveControllerHost;

  fragments!: Fragment[];
  activeFragmentId = 0;
  snippet?: Snippet;

  constructor(host: ReactiveControllerHost) {
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
    this.snippet = JSON.parse(e.detail.selectedSnippet);
    if (!this.snippet) return;

    // Get the snippet by id from Realm DB
    myAPI.getSnippet(<number>this.snippet._id).then((snippet) => {
      this.snippet = snippet as unknown as Snippet;
    });
    console.info(
      "previouslySelectedSnippet",
      JSON.parse(e.detail.previouslySelectedSnippet)
    );
    myAPI.getActiveFragment(<number>this.snippet._id).then((activeFragment) => {
      this.activeFragmentId = activeFragment.fragmentId;
    });

    myAPI.fetchFragments(<number>this.snippet._id).then((fragments) => {
      this.fragments = fragments;
      console.log("Fetch fragments", this.fragments, this.activeFragmentId);
      this.host.requestUpdate();
    });
  };

  private _activeFragmentListener = (e: CustomEvent): void => {
    if (!this.snippet) return;

    this.activeFragmentId = e.detail.activeFragmentId;
    // Update ActiveFragment in Realm DB
    myAPI
      .updateActiveFragment({
        properties: {
          fragmentId: this.activeFragmentId,
          snippetId: this.snippet._id,
        },
      })
      .then(({ status }) => {
        console.log("myAPI.updateActiveFragment", status);
        this.host.requestUpdate();
      });
  };
}
