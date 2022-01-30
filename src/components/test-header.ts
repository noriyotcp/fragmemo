import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FileData, Override } from "index";
import { dispatch } from "../events/dispatcher";
import { SnippetController } from "../controllers/snippet-controller";
import "@ui5/webcomponents/dist/Input.js";

const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  private snippet = new SnippetController(this);

  @query("#btn-save") btnSave!: HTMLButtonElement;
  @query("#snippet-title") snippetTitle!: HTMLInputElement;
  @property({ type: String })
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
        value="${this.snippet.selectedSnippet.title}"
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

    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );

    // Fired when the input operation has finished by pressing Enter or on focusout
    this.snippetTitle.addEventListener("change", (e: Event) => {
      const { highlightValue } = e.currentTarget as Override<
        EventTarget,
        { highlightValue: string }
      >;

      this.snippet.selectedSnippet.title = highlightValue;
      dispatch({
        type: "snippet-changed",
        detail: {
          _id: this.snippet.selectedSnippet._id,
          properties: {
            title: this.snippet.selectedSnippet.title,
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
