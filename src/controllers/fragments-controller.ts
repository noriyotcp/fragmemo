import { dispatch } from "../events/dispatcher";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Fragment, Snippet } from "models.d";

const { myAPI } = window;

export class FragmentsController implements ReactiveController {
  private host: ReactiveControllerHost;

  fragments!: Fragment[];
  activeFragmentId = 0;
  inactiveFragmentId: number | null = null;
  currentTabIndex = 0;
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
    // When Command or Control + T is pressed
    myAPI.newFragment((_e: Event) => this._initFragment());
  }

  private _initFragment() {
    if (!this.snippet) return;

    myAPI.initFragment(this.snippet._id).then(() => {
      dispatch({
        type: "update-snippets",
        detail: {
          message: "Fragment created",
        },
      });
    });
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
      dispatch({
        type: "snippet-selected",
        detail: {
          to: this.activeFragmentId,
          from: null,
          snippetId: this.snippet?._id,
        },
      });
    });

    myAPI.fetchFragments(<number>this.snippet._id).then((fragments) => {
      this.fragments = fragments;
      this._setCurrentTabIndex();
      this.host.requestUpdate();
    });
  };

  private _activeFragmentListener = (e: CustomEvent): void => {
    if (!this.snippet) return;

    this.inactiveFragmentId = this.activeFragmentId;
    this.activeFragmentId = e.detail.activeFragmentId;
    dispatch({
      type: "fragment-switched",
      detail: {
        from: this.inactiveFragmentId,
        to: this.activeFragmentId,
      },
    });

    this._setCurrentTabIndex();
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

  private _setCurrentTabIndex() {
    this.currentTabIndex = Array.from(this.fragments).findIndex(
      (f) => f._id === this.activeFragmentId
    );
  }
}
