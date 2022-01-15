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
  @queryAll(".tab-item") tabs!: Array<HTMLElement>;
  @query("mwc-tab-bar") tabBar!: HTMLElement;

  static styles = css`
    :host {
    }
    section {
      display: flex;
      flex-wrap: nowrap;
    }
    .tab-item {
      width: 100%;
      text-align: center;
    }
    .tab-item[active] {
      background-color: #808080b5;
      color: ghostwhite;
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

  tabBarTemplate(): TemplateResult {
    const fragments = this.fragmentsController.fragments;
    return html`
      <section activeIndex="${this.fragmentsController.activeIndex}">
        ${map(fragments, (fragment, _) => {
          return html`
            <div
              label="${fragment.title || `fragment  ${fragment._id}`}"
              id="mdc-tab-${fragment._id}"
              class="tab-item"
              @click="${this._onClickListener}"
            >
              ${fragment.title || `fragment ${fragment._id}`}
            </div>
          `;
        })}
      </section>
    `;
  }

  render(): TemplateResult {
    return html`${this.tabBarTemplate()}`;
  }

  updated() {
    console.info("fragments updated", this.fragmentsController.fragments);
    this.tabs[0]?.setAttribute("active", "true");
  }

  private _onClickListener(e: MouseEvent) {
    this.tabs.forEach((tab, _) => {
      tab.removeAttribute("active");
    });
    e.currentTarget.setAttribute("active", "true");
  }

  private range(
    start: number,
    end: number,
    length = end - start + 1
  ): Array<number> {
    return Array.from({ length }, (_, i) => start + i);
  }
}
