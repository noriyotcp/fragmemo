// @ts-nocheck

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { FragmentsController } from "../controllers/fragments-controller";
import "@material/mwc-tab-bar";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @query("sl-tab-group") tabGroup!: HTMLElement;
  @queryAll("sl-tab[panel^='tab-']") tabs: Array<HTMLElement>;
  @query("mwc-tab-bar") tabBar!: HTMLElement;

  static styles = css`
    :host {
    }
    mwc-tab-bar {
      --mdc-theme-primary: grey;
      --mdc-text-transform: none;
      --mdc-tab-text-label-color-default: ghostwhite;
    }
    sl-tab > input {
      background-color: transparent;
      color: white;
      border: none;
      text-align: center;
    }
    sl-tab > input[readonly] {
      outline: none;
    }
    sl-tab > input:not([readonly]):focus-visible {
      outline: var(--sl-color-primary-600) solid 1px;
    }
    .tab-settings {
      user-select: none;
    }
    .tab-settings > input {
      pointer-events: none;
    }
  `;

  settingsTemplate(): TemplateResult {
    return html`
      <sl-tab slot="nav" panel="tab-settings" closable class="tab-settings"
        ><input type="text" value="Settings" readonly
      /></sl-tab>
      <sl-tab-panel name="tab-settings">
        <settings-element></settings-element>
      </sl-tab-panel>
    `;
  }

  render(): TemplateResult {
    return html`
      <mwc-tab-bar>
        ${map(this.fragmentsController.fragments, (fragment, _) => {
          return html`
            <mwc-tab
              label="${fragment.title || `fragment  ${fragment._id}`}"
              id="mdc-tab-${fragment._id}"
            ></mwc-tab>
          `;
        })}
      </mwc-tab-bar>
    `;
  }

  updated() {
    console.info("fragments updated", this.fragmentsController.fragments);
  }

  firstUpdated() {
    console.info(this.tabs);
    this.addEventListener("MDCTab:interacted", (e: CustomEvent) => {
      console.log("interacted", e.detail);
    });
    this.tabBar.addEventListener("MDCTabBar:activated", (e: CustomEvent) => {
      console.log("activated", e.detail);
    });
  }

  private range(
    start: number,
    end: number,
    length = end - start + 1
  ): Array<number> {
    return Array.from({ length }, (_, i) => start + i);
  }
}
