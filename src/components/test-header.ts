import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { dispatch } from "../events/dispatcher";
import "@ui5/webcomponents/dist/Input.js";
import { Override } from "index.d";
import { Snippet } from "models.d";
import { ISnippetProps } from "props.d";

const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
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
        @input="${this._inputTitleDispatcher}"
      ></ui5-input>
    `;
  }

  private _inputTitleDispatcher(e: { target: { value: string } }) {
    dispatch({ type: "input-title", detail: { message: e.target.value } });
  }

  async firstUpdated(): Promise<void> {
    window.addEventListener(
      "select-snippet",
      this._selectSnippetListener as EventListener
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
          dispatch({
            type: "update-snippets",
            detail: {
              message: "Snippets updated",
            },
          });
          this.requestUpdate();
        })
        .catch((err) => {
          console.error(err);
          this._displayToast("Snippet update failed");
        });
    });
  }

  private _selectSnippetListener = (e: CustomEvent): void => {
    this._snippet = JSON.parse(e.detail.selectedSnippet);
    console.info(
      "previouslySelectedSnippet",
      JSON.parse(e.detail.previouslySelectedSnippet)
    );
    this.requestUpdate();
  };

  private _displayToast(msg?: string): void {
    dispatch({
      type: "display-toast",
      detail: {
        message: msg,
      },
    });
  }
}
