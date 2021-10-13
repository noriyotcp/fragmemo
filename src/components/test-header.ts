import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  @query("#text") textarea!: HTMLTextAreaElement;
  @query("#btn-save") btnSave!: HTMLButtonElement;

  static styles = css`
    :host {
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
        <textarea id="text" rows="4"></textarea>
      </div>
    `;
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.setupStorage().then((msg: string) => {
      this.textarea.value = msg;
    });
  }

  private _fileSaveAs(_e: Event): void {
    myAPI.fileSaveAs(this.textarea.value);
  }
}
