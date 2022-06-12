import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { displayToast, updateSnippets } from "../events/global-dispatchers";
import "@ui5/webcomponents/dist/Input.js";
import { Override } from "index.d";
import { Snippet } from "models.d";
import { ISnippetProps } from "props.d";

const { myAPI } = window;

@customElement("snippet-title")
export class SnippetTitle extends LitElement {
  @query("#snippet-title") snippetTitle!: HTMLInputElement;
  @state() private _snippet?: Snippet;

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      height: var(--header-height);
      width: 100%;
      z-index: 9999;
      --textarea-width: 67%;
    }
    #snippet-title {
      height: 100%;
      width: var(--textarea-width);
      background-color: inherit;
      border: none;
      color: var(--text-color);
      font-size: 1.3em;
    }
  `;

  render(): TemplateResult {
    return html`
      <ui5-input
        id="snippet-title"
        type="text"
        placeholder="Snippet title..."
        value="${this._snippet?.title}"
      ></ui5-input>
    `;
  }

  async firstUpdated(): Promise<void> {
    window.addEventListener(
      "select-snippet",
      this._onSnippetSelected as EventListener
    );

    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));

    // Fired when the input operation has finished by pressing Enter or on focusout
    this.snippetTitle.addEventListener("change", (e: Event) => {
      if (!this._snippet) return;

      const { highlightValue } = e.currentTarget as Override<
        EventTarget,
        { highlightValue: string }
      >;
      this._snippet.title = highlightValue;

      const snippetProps: ISnippetProps = {
        _id: this._snippet._id,
        properties: {
          title: this._snippet.title,
        },
      };

      myAPI
        .updateSnippet(snippetProps)
        .then(() => {
          // dispatch event to update the list
          updateSnippets();
          displayToast("Snippet updated", {
            variant: "primary",
            icon: "check2-circle",
          });
          this.requestUpdate();
        })
        .catch((err) => {
          console.error(err);
          displayToast("Snippet update failed", {
            variant: "danger",
            icon: "exclamation-octagon",
            duration: 5000,
          });
        });
    });
  }

  disconnectedCallback() {
    window.removeEventListener(
      "select-snippet",
      this._onSnippetSelected as EventListener
    );

    super.disconnectedCallback();
  }

  private _onSnippetSelected = (e: CustomEvent): void => {
    this._snippet = JSON.parse(e.detail.selectedSnippet);
    this.requestUpdate();
  };
}
