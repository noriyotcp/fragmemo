import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FileData } from "index";
import { dispatch } from "../events/dispatcher";
import "@ui5/webcomponents/dist/Input.js";
import { SnippetController } from "../controllers/snippet-controller";

const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  private snippet = new SnippetController(this);

  @query("#btn-save") btnSave!: HTMLButtonElement;
  @query("#message") message!: HTMLSpanElement;
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
      height: 100px;
      width: 100%;
      z-index: 9999;
      --textarea-width: 67%;
    }
    #snippet-title {
      width: var(--textarea-width);
      background-color: inherit;
      border: none;
      color: ghostwhite;
      font-size: 1.5em;
    }
  `;

  render(): TemplateResult {
    return html`
      <toast-element></toast-element>
      <div id="textarea">
        <form>
          <button type="button" id="btn-save" @click="${this._displayToast}">
            Toast
          </button>
          <div id="message"></div>
        </form>
        <ui5-input
          id="snippet-title"
          type="text"
          placeholder="Snippet title..."
          value="${this.snippet.selectedSnippet.title}"
          @input="${this._inputTitleDispatcher}"
        ></ui5-input>
      </div>
    `;
  }

  private _inputTitleDispatcher(e: { target: { value: string } }) {
    dispatch({ type: "input-title", detail: { message: e.target.value } });
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );
    // Fired when the input operation has finished by pressing Enter or on focusout
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const textField = this.shadowRoot!.getElementById("snippet-title")!;
    textField.addEventListener("change", (e: Event) => {
      console.log("Input has finished", e);
    });
  }

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
