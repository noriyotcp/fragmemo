import { ReactiveController, ReactiveControllerHost } from "lit";
import { Fragment, Snippet } from "models.d";
import {
  activeFragment as activeFragmentEvent,
  fragmentSwitched,
  initFragment,
  snippetSelected,
  updateSnippets,
} from "../events/global-dispatchers";

const { appAPI } = window;

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
      this._onSnippetSelected as EventListener
    );
    window.addEventListener(
      "active-fragment",
      this._onFragmentActivated as EventListener
    );
    // When Command or Control + T is pressed
    appAPI.newFragment((_e: Event) => this._initFragment());
  }

  hostDisconnected(): void {
    window.removeEventListener(
      "select-snippet",
      this._onSnippetSelected as EventListener
    );
    window.removeEventListener(
      "active-fragment",
      this._onFragmentActivated as EventListener
    );
    appAPI.removeAllListeners("new-fragment");
  }

  private _initFragment() {
    if (!this.snippet) return;

    appAPI.initFragment(this.snippet._id).then(() => {
      appAPI
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .getActiveFragment(<number>this.snippet._id)
        .then((activeFragment) => {
          // dispatch the fragment to be active ID to active-fragment event
          activeFragmentEvent(activeFragment.fragmentId);
          initFragment();
          updateSnippets();
        });
    });
  }

  private _onSnippetSelected = (e: CustomEvent): void => {
    this.snippet = JSON.parse(e.detail.selectedSnippet);
    if (!this.snippet) return;

    appAPI.newActiveSnippetHistory(<number>this.snippet._id);

    // Get the snippet by id from Realm DB
    appAPI.getSnippet(<number>this.snippet._id).then((snippet) => {
      this.snippet = snippet as unknown as Snippet;
    });
    appAPI.getActiveFragment(<number>this.snippet._id).then((activeFragment) => {
      this.activeFragmentId = activeFragment.fragmentId;
      snippetSelected(this.activeFragmentId, undefined, this.snippet?._id);
    });

    appAPI.loadFragments(<number>this.snippet._id).then((fragments) => {
      this.fragments = fragments;
      this._setCurrentTabIndex();
      this.host.requestUpdate();
    });
  };

  private _onFragmentActivated = (e: CustomEvent): void => {
    if (!this.snippet) return;

    this.inactiveFragmentId = this.activeFragmentId;
    this.activeFragmentId = e.detail.activeFragmentId;
    fragmentSwitched(this.inactiveFragmentId, this.activeFragmentId);

    this._setCurrentTabIndex();
    // Update ActiveFragment in Realm DB
    appAPI
      .updateActiveFragment({
        properties: {
          fragmentId: this.activeFragmentId,
          snippetId: this.snippet._id,
        },
      })
      .then(({ status }) => {
        console.log("appAPI.updateActiveFragment", status);
        this.host.requestUpdate();
      });
  };

  private _setCurrentTabIndex() {
    this.currentTabIndex = Array.from(this.fragments).findIndex(
      (f) => f._id === this.activeFragmentId
    );
  }
}
