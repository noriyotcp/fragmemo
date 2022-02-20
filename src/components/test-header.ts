import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { FileData, Override } from "index";
import { dispatch } from "../events/dispatcher";
import "@ui5/webcomponents/dist/Input.js";
import { Snippet } from "models";

const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  @query("#btn-save") btnSave!: HTMLButtonElement;
  @query("#snippet-title") snippetTitle!: HTMLInputElement;
  @property({ type: String })
  @state()
  private _snippet?: Snippet;
  textareaValue!: string;

  constructor() {
    super();
  }

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      height: 41px;
      width: 100%;
      z-index: 9999;
      --textarea-width: 67%;
    }
    #snippet-title {
      width: var(--textarea-width);
      background-color: inherit;
      border: none;
      color: var(--text-color);
      font-size: 1.5em;
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
      <button type="button" id="btn-save" @click="${this._displayToast}">
        Toast
      </button>
    `;
  }

  private _inputTitleDispatcher(e: { target: { value: string } }) {
    dispatch({ type: "input-title", detail: { message: e.target.value } });
  }

  async firstUpdated(): Promise<void> {
    window.addEventListener(
      "snippet-changed",
      this._snippetChangedListener as EventListener
    );

    window.addEventListener(
      "select-snippet",
      this._selectSnippetListener as EventListener
    );

    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );

    // Fired when the input operation has finished by pressing Enter or on focusout
    this.snippetTitle.addEventListener("change", (e: Event) => {
      if (!this._snippet) return;

      const { highlightValue } = e.currentTarget as Override<
        EventTarget,
        { highlightValue: string }
      >;

      this._snippet.title = highlightValue;
      dispatch({
        type: "snippet-changed",
        detail: {
          _id: this._snippet._id,
          properties: {
            title: this._snippet.title,
          },
        },
      });
      console.log("Input has finished", highlightValue);
    });
  }

  private _snippetChangedListener = (e: CustomEvent): void => {
    console.info("Changed Data: ", e.detail.properties);
    myAPI.updateSnippet(e.detail).then(({ status }) => {
      console.log("myAPI.updateSnippet", status);
      // dispatch event to update the list
      dispatch({
        type: "update-snippets",
        detail: {
          message: "Snippets updated",
        },
      });
      this.requestUpdate();
    });
  };

  private _selectSnippetListener = (e: CustomEvent): void => {
    this._snippet = JSON.parse(e.detail.selectedSnippet);
    console.info(
      "previouslySelectedSnippet",
      JSON.parse(e.detail.previouslySelectedSnippet)
    );
    this.requestUpdate();
  };

  private _fileSaveAs(_e: Event): void {
    dispatch({ type: "file-save-as", detail: { message: "" } });
  }

  private async _openByMenuListener(
    fileData: FileData
  ): Promise<boolean | void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));

    if (fileData.status === undefined) {
      return false;
    }

    if (!fileData.status) {
      alert(`ファイルが開けませんでした\n${fileData.path}`);
      return false;
    }

    this.textareaValue = fileData.text;
  }

  private _displayToast(): void {
    dispatch({
      type: "display-toast",
      detail: {
        message: this.snippetTitle?.value,
      },
    });
  }
}
