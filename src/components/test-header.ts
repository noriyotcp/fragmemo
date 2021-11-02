import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FileData, setupStorageResultType } from "src/@types/global";
import { dispatch } from "../events/dispatcher";

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
      --textarea-width: 50%;
    }
    textarea {
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
        <input
          type="text"
          id="snippet-title"
          name="snippet-title"
          placeholder="Two-way binding"
          value="${this.textareaValue}"
          @input="${this._inputTitleDispatcher}"
        />
      </div>
    `;
  }

  private _inputTitleDispatcher(e: { target: { value: string } }) {
    dispatch({ type: "input-title", message: e.target.value });
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.setupStorage().then(({ status, msg }: setupStorageResultType) => {
      this.message.innerText = msg;
      console.log(`status: ${status}, msg: ${msg}`);
    });
    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );
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
