import { ToastStackController } from "../controllers/toast-stack-controller";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("home-element")
export class HomeElement extends LitElement {
  @state() private _noSnippets = true;

  constructor() {
    super();
    new ToastStackController(this);
  }

  static styles = [
    css`
      :host {
        display: block;
        height: 100vh;
        position: fixed;
        top: 0;
        right: 0;
        overflow: hidden;
        border-left: 1px solid var(--dark-gray);
      }
    `,
  ];

  renderNoSnippets(): TemplateResult {
    return this._noSnippets ? html`<slot name="no-snippets"></slot>` : html``;
  }

  render(): TemplateResult {
    return html`${this.renderNoSnippets()}
      <editor-element></editor-element> `;
  }

  firstUpdated() {
    window.addEventListener(
      "snippets-loaded",
      this._setSnippets as EventListener
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      "snippets-loaded",
      this._setSnippets as EventListener
    );

    super.disconnectedCallback();
  }

  private _setSnippets = (e: CustomEvent): void => {
    this._noSnippets = e.detail.noSnippets;
    this.requestUpdate();
  };
}
