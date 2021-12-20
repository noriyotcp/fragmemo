import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("fragment-tab-list")
export class FragmentTabList extends LitElement {
  @query("#tab-container") tabContainer!: HTMLElement;

  static styles = css`
    :host {
    }
  `;

  render(): TemplateResult {
    return html`
      <sl-tab-group>
        <sl-tab slot="nav" panel="tab-1">Tab 1</sl-tab>
        <sl-tab slot="nav" panel="tab-2">Tab 2</sl-tab>
        <sl-tab slot="nav" panel="tab-3">Tab 3</sl-tab>
        <sl-tab slot="nav" panel="tab-4">Tab 4</sl-tab>
        <sl-tab slot="nav" panel="tab-5">Tab 5</sl-tab>
        <sl-tab slot="nav" panel="tab-6">Tab 6</sl-tab>
        <sl-tab slot="nav" panel="tab-7">Tab 7</sl-tab>
        <sl-tab slot="nav" panel="tab-8">Tab 8</sl-tab>
        <sl-tab slot="nav" panel="tab-9">Tab 9</sl-tab>
        <sl-tab slot="nav" panel="tab-10">Tab 10</sl-tab>
        <sl-tab slot="nav" panel="tab-11">Tab 11</sl-tab>
        <sl-tab slot="nav" panel="tab-12">Tab 12</sl-tab>
        <sl-tab slot="nav" panel="tab-13">Tab 13</sl-tab>
        <sl-tab slot="nav" panel="tab-14">Tab 14</sl-tab>
        <sl-tab slot="nav" panel="tab-15">Tab 15</sl-tab>
        <sl-tab slot="nav" panel="tab-16">Tab 16</sl-tab>
        <sl-tab slot="nav" panel="tab-17">Tab 17</sl-tab>
        <sl-tab slot="nav" panel="tab-18">Tab 18</sl-tab>
        <sl-tab slot="nav" panel="tab-19">Tab 19</sl-tab>
        <sl-tab slot="nav" panel="tab-20">Tab 20</sl-tab>
      </sl-tab-group>
    `;
  }

  firstUpdated() {
    console.log("FragmentTabList firstUpdated");
  }
}
