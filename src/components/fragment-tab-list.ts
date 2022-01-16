import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { FragmentsController } from "../controllers/fragments-controller";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  private fragmentsController = new FragmentsController(this);

  @query("sl-tab-group") tabGroup!: HTMLElement;
  @queryAll(".tab-item") tabs!: Array<HTMLElement>;

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
    .tab-item[active="true"] {
      background-color: #808080b5;
      color: ghostwhite;
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
      <section activeIndex="${this.fragmentsController.activeFragmentId}">
        ${map(fragments, (fragment, index) => {
          return html`
            <div
              label="${fragment.title || `fragment  ${fragment._id}`}"
              id="fragment-${fragment._id}"
              class="tab-item"
              fragmentId="${fragment._id}"
              tabindex="${index}"
              active="${fragment._id ===
              this.fragmentsController.activeFragmentId}"
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
  }

  private _onClickListener(e: MouseEvent) {
    if (!e.currentTarget) return;

    this.tabs.forEach((tab, _) => {
      tab.removeAttribute("active");
    });

    dispatch({
      type: "active-fragment",
      detail: {
        activeFragmentId: Number(
          (<HTMLDivElement>e.currentTarget).getAttribute("fragmentId")
        ),
      },
    });

    this.requestUpdate();
  }

  private range(
    start: number,
    end: number,
    length = end - start + 1
  ): Array<number> {
    return Array.from({ length }, (_, i) => start + i);
  }
}
