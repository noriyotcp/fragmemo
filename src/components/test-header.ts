import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FileData } from "src/@types/global";
import { dispatch } from "../events/dispatcher";
import "@ui5/webcomponents/dist/Input.js";

const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  @query("#btn-save") btnSave!: HTMLButtonElement;
  @query("#message") message!: HTMLSpanElement;
  @property({ type: String }) textareaValue!: string;

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      height: 100px;
      width: 100%;
      z-index: 9999;
      --textarea-width: 100%;
    }
    #snippet-title {
      width: var(--textarea-width);
    }
  `;

  render(): TemplateResult {
    return html`
      <div id="textarea">
        <form>
          <button type="button" id="btn-save" @click="${this._fileSaveAs}">
            保存
          </button>
          <div id="message"></div>
        </form>
        <ui5-input
          id="snippet-title"
          type="text"
          placeholder="Snippet title..."
          value="${this.textareaValue}"
          @input="${this._inputTitleDispatcher}"
        ></ui5-input>
      </div>
    `;
  }

  private _inputTitleDispatcher(e: { target: { value: string } }) {
    dispatch({ type: "input-title", message: e.target.value });
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );
    window.addEventListener("select-snippet", ((e: CustomEvent) => {
      this.textareaValue = e.detail.message;
    }) as EventListener);
    // Fired when the input operation has finished by pressing Enter or on focusout
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const textField = this.shadowRoot!.getElementById("snippet-title")!;
    textField.addEventListener("change", (e: Event) => {
      console.log("Input has finished", e);
    });
  }

  private _fileSaveAs(_e: Event): void {
    dispatch({ type: "file-save-as", message: "" });
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
}
