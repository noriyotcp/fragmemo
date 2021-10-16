import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FileData } from "../@types/global";
const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  @query("#btn-save") btnSave!: HTMLButtonElement;
  @query("#message") message!: HTMLSpanElement;
  @property({ type: String }) textareaValue!: string;

  static styles = css`
    :host {
      color: ghostwhite;
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
          <span id="message"></span>
        </form>
        <textarea rows="4" placeholder="Two-way binding">
${this.textareaValue}</textarea
        >
      </div>
    `;
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.setupStorage().then((msg: string) => {
      this.message.textContent = msg;
    });
    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );
  }

  private _fileSaveAs(_e: Event): void {
    myAPI.fileSaveAs(this.textareaValue);
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
