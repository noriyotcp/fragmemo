import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";

// -- Monaco Editor Imports --
import * as monaco from "monaco-editor";
import styles from "monaco-editor/min/vs/editor/editor.main.css";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { FileData } from "index";

const { myAPI } = window;

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

@customElement("code-editor")
export class CodeEditor extends LitElement {
  private container: Ref<HTMLElement> = createRef();
  editor?: monaco.editor.IStandaloneCodeEditor;
  @property({ type: Boolean, attribute: "readonly" }) readOnly?: boolean;
  @property() theme?: string;
  @property() language!: string;
  @property() code!: string;

  static styles = css`
    :host {
      --header-height: 100px;
      --editor-width: 100%;
      --editor-height: calc(100vh - var(--header-height));
    }
    main {
      width: var(--editor-width);
      height: var(--editor-height);
    }
  `;

  render(): TemplateResult {
    return html`
      <style>
        ${styles}
      </style>
      <main ${ref(this.container)}></main>
    `;
  }

  constructor() {
    super();
    window.addEventListener("file-save-as", ((e: CustomEvent) => {
      myAPI.fileSaveAs(this.getValue());
    }) as EventListener);
  }

  private getFile() {
    if (this.children.length > 0) return this.children[0];
    return null;
  }

  private getCode(): string {
    if (this.code) return this.code;
    const file = this.getFile();
    if (!file) return "";
    return file.innerHTML.trim();
  }

  private getLang() {
    return this.language;
    // TODO: get rid of this
    // const file = this.getFile();
    // if (!file) return;
    // const type = <string>file.getAttribute("type");
    // return type.split("/").pop();
  }

  private getTheme() {
    if (this.theme) return this.theme;
    if (this.isDark()) return "vs-dark";
    return "vs-light";
  }

  private isDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  setValue(value: string): void {
    this.editor?.setValue(value);
  }

  getValue(): string {
    const value = this.editor?.getValue();
    return value || "";
  }

  setReadOnly(value: boolean): void {
    this.readOnly = value;
    this.setOptions({ readOnly: value });
  }

  setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions): void {
    this.editor?.updateOptions(value);
  }

  firstUpdated(): void {
    const model = monaco.editor.createModel(this.getCode(), this.getLang());
    const editorOptions = {
      model,
      theme: this.getTheme(),
      automaticLayout: true,
      readOnly: this.readOnly ?? false,
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.editor = monaco.editor.create(this.container.value!, editorOptions);
    // monaco.editor.setModelLanguage(this.editor.getModel()!, "html");
    console.log(this.editor.getModel()?.getLanguageId());
    console.log(monaco.languages.getLanguages());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // monaco.editor.setModelLanguage(this.editor.getModel()!, "c");
    this.editor.getModel()?.onDidChangeContent((e) => {
      console.info(e);
      this._changeText();
    });
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        monaco.editor.setTheme(this.getTheme());
      });

    myAPI.openByMenu((_e: Event, fileData: FileData) =>
      this._openByMenuListener(fileData)
    );

    console.log(this.editor.hasTextFocus());
    this.editor.onDidFocusEditorText(() => {
      console.log("focus");
    });
    this.editor.onDidBlurEditorText(() => {
      console.log("blur");
    });
    // When Command or Control + S is pressed
    myAPI.saveFragment((_e: Event) => this._saveText());
  }

  updated() {
    if (!this.editor) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    monaco.editor.setModelLanguage(this.editor.getModel()!, this.getLang());
    console.log(
      `model language was changed to ${this.editor.getModel()?.getLanguageId()}`
    );
    this.setValue(this.code);
  }

  private _openByMenuListener(fileData: FileData): boolean | void {
    // Give the browser a chance to paint
    // await new Promise((r) => setTimeout(r, 0));

    if (fileData.status === undefined) {
      return false;
    }

    if (!fileData.status) {
      alert(`ファイルが開けませんでした\n${fileData.path}`);
      return false;
    }

    this.setValue(fileData.text);
  }

  private _changeText() {
    this.dispatchEvent(
      new CustomEvent("change-text", {
        detail: { text: this.getValue() },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _saveText() {
    this.dispatchEvent(
      new CustomEvent("save-text", {
        detail: { text: this.getValue() },
        bubbles: true,
        composed: true,
      })
    );
  }
}
