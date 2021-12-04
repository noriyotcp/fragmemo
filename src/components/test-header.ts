import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FileData } from "index";
import { dispatch } from "../events/dispatcher";
import "@ui5/webcomponents/dist/Input.js";
import { SnippetController } from "../controllers/snippet-controller";
import { ToastController } from "../controllers/toast-controller";
import { ToastElement } from "./toast-element";

const { myAPI } = window;

@customElement("test-header")
export class TestHeader extends LitElement {
  private snippet = new SnippetController(this);
  private toast = new ToastController(this);

  @query("#btn-save") btnSave!: HTMLButtonElement;
  @query("#message") message!: HTMLSpanElement;
  @query("#snippet-title") snippetTitle!: HTMLInputElement;
  @query("toast-element") toastElement!: ToastElement;
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
      <toast-element>
        <span slot="toast-text">
          <p>
            <a
              href="https://sap.github.io/ui5-webcomponents/playground/components/Toast/"
              target="_blank"
              >UI5 Toast</a
            >
          </p>
          <p>${this.toast.text}</p>
        </span>
      </toast-element>
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
    dispatch({ type: "input-title", message: e.target.value });
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

  private _displayToast(): void {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const event = new CustomEvent("display-toast", {
      detail: {
        target: this.toastElement.shadowRoot!.querySelector("#wcToastBE"),
        message: this.snippetTitle?.value,
      },
    });

    window.dispatchEvent(event);
  }
}
