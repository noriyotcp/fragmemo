import { LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("no-snippets-element")
export class NoSnippetsElement extends LitElement {
  constructor() {
    super();
  }

  static styles = [
    css`
      :host {
        position: absolute;
        z-index: 10000;
        width: 100%;
        height: 100vh;
        background-color: var(--dark-gray);
      }

      .no-snippet {
        color: var(--gray);
        padding: calc(50vh) 0px;
        text-align: center;
      }
    `,
  ];

  render(): TemplateResult {
    return html`<section class="no-snippet">No Snippets Selected</section>`;
  }
}
