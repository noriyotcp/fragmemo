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

import { ViewStateStore } from "../stores";
import { ViewStatesController } from "../controllers/view-states-controller";

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
  viewStateStore: ViewStateStore;
  private viewStatesController = new ViewStatesController(this);

  private container: Ref<HTMLElement> = createRef();
  editor!: monaco.editor.IStandaloneCodeEditor;
  @property({ type: Boolean, attribute: "readonly" }) readOnly?: boolean;
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
    this.viewStateStore = new ViewStateStore();
  }

  private getCode(): string {
    return this.code;
  }

  private getLang() {
    return this.language;
  }

  private getTheme() {
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
    this.editor.setValue(value);
  }

  getValue(): string {
    const value = this.editor.getValue();
    return value || "";
  }

  setReadOnly(value: boolean): void {
    this.readOnly = value;
    this.setOptions({ readOnly: value });
  }

  setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions): void {
    this.editor.updateOptions(value);
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
    console.log(this._langaugesMap());
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
    // switch snippets
    if (this.viewStatesController.isSnippetSwitched) {
      // reset the all view states
      this.viewStateStore.store.forEachRow("states", (rowId: string): void => {
        this.viewStateStore.store.delRow("states", `${rowId}`);
      });
    } else {
      // if switched to a new fragment, save the previous view state
      if (this.viewStatesController.previousFragmentId) {
        this._saveCurrentViewState(
          this.viewStatesController.previousFragmentId
        );
      }
    }

    if (!this.editor) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    monaco.editor.setModelLanguage(this.editor.getModel()!, this.getLang());
    console.log(
      `model language was changed to ${this.editor.getModel()?.getLanguageId()}`
    );
    this.setValue(this.code);

    console.info("updated", this.viewStateStore.store.getTable("states"));
    if (
      this.viewStateStore.hasRow(
        `${this.viewStatesController.currentFragmentId}`
      )
    ) {
      this._restoreCurrentViewState();
    }
  }

  private _saveCurrentViewState(fragmentId: number) {
    const viewState = this.editor.saveViewState();
    this.viewStateStore.setPartialRow(`${fragmentId}`, {
      viewState: JSON.stringify(viewState),
    });
  }

  private _restoreCurrentViewState() {
    const viewState = this.viewStateStore.getCell(
      `${this.viewStatesController.currentFragmentId}`,
      "viewState"
    );
    this.editor.restoreViewState(JSON.parse(viewState));
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
    this._saveCurrentViewState(this.viewStatesController.currentFragmentId);
    this.viewStatesController.previousFragmentId = null;

    this.dispatchEvent(
      new CustomEvent("save-text", {
        detail: { text: this.getValue() },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _langaugesMap(): object {
    return monaco.languages.getLanguages().map((lang) => {
      return { id: lang.id, alias: lang.aliases ? lang.aliases[0] : lang.id };
    });
  }
}
