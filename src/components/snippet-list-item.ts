import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ListItem } from "@material/mwc-list/mwc-list-item.js";
import { dispatch } from "../events/dispatcher";

@customElement("snippet-list-item")
export class SnippetListItem extends LitElement {
  static styles = [
    css`
      :host {
        --mdc-theme-text-primary-on-background: ghostwhite;
        --mdc-theme-text-secondary-on-background: ghostwhite;
        --mdc-list-side-padding: 8px;
        border-bottom: 1px solid rgba(248, 248, 255, 0.12);
      }
      mwc-list-item {
        flex-shrink: 0;
        width: 100%;
      }
      [mwc-list-item]:active {
        background-color: rgba(33, 33, 33, 0.4);
      }
    `,
    ListItem.styles,
  ];

  render(): TemplateResult {
    return html`
      <mwc-list-item twoline @click="${this._selected}">
        <span><slot name="title"></slot></span>
        <span slot="secondary"><slot name="date"></slot></span>
      </mwc-list-item>
      <li divider role="separator"></li>
    `;
  }

  private _selected(e: MouseEvent): void {
    dispatch({
      type: "select-snippet",
      message: "click an item",
    });
  }
}
