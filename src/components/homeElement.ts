import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
const { myAPI } = window;

@customElement("home-element")
export class HomeElement extends LitElement {
  @query("#text") textarea!: HTMLTextAreaElement;
  @query("#btn-save") btnSave!: HTMLButtonElement;

  static styles = css`
    :host {
      --textarea-width: 30%;
    }
    textarea {
      width: var(--textarea-width);
    }
  `;

  render(): TemplateResult {
    return html`
      <div id="textarea" rows="4">
        <form>
          <button type="button" id="btn-save">保存</button>
          <span id="message"></span>
        </form>
        <textarea id="text"></textarea>
      </div>
      <code-editor code="console.log('Hello World');" language="typescript">
      </code-editor>
    `;
  }

  async firstUpdated(): Promise<void> {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    myAPI.setupStorage().then((msg: string) => {
      this.textarea.value = msg;
    });

    this.btnSave.addEventListener("click", () => {
      myAPI.fileSaveAs(this.textarea.value);
    });
  }
}
