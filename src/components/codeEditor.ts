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

import { createViewStateStore, Store } from "../stores";
import { ViewStatesController } from "../controllers/view-states-controller";

const { myAPI } = window;

window.MonacoEnvironment = {
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
  viewStateStore: typeof Store;
  private viewStatesController = new ViewStatesController(this);

  private container: Ref<HTMLElement> = createRef();
  editor!: monaco.editor.IStandaloneCodeEditor;
  @property({ type: Boolean, attribute: "readonly" }) readOnly?: boolean;
  @property() language!: string;
  @property() code!: string;
  @property({ type: Object }) editorOptions!: object;

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
    this.viewStateStore = createViewStateStore();
    this.viewStateStore.addCellListener(
      null,
      null,
      null,
      (store, tableId, rowId, cellId) => {
        console.log(
          `${cellId} cell in ${rowId} row in ${tableId} table changed`
        );
        console.info(
          "viewStateStore status:",
          this.viewStateStore.getTable("states")
        );
      }
    );
  }

  private getTheme() {
    return "vs-dark";
    // Builtin themes: "vs", "vs-dark", "hc-black"
    // https://github.com/microsoft/monaco-editor/blob/db5039b702941f2b75bdb367251ec3c8d00a7488/website/typedoc/monaco.d.ts#L1019
  }

  setValue(value: string): void {
    this.editor.setValue(value);
  }

  getValue(): string {
    return this.editor.getValue();
  }

  setReadOnly(value: boolean): void {
    this.readOnly = value;
    this.setOptions({ readOnly: value });
  }

  setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions): void {
    this.editor.updateOptions(value);
  }

  get model(): monaco.editor.IModel {
    const model = this.editor?.getModel();
    if (model) return model;
    return monaco.editor.createModel(this.code, this.language);
  }

  firstUpdated(): void {
    const editorOptions = {
      model: this.model,
      theme: this.getTheme(),
      automaticLayout: true,
      readOnly: this.readOnly ?? false,
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.editor = monaco.editor.create(this.container.value!, editorOptions);
    this.editor.createContextKey(
      /*key name*/ "selectLanguageContext",
      /*default value*/ true
    );
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyL,
      () => {
        this._selectLanguage();
      },
      "selectLanguageContext"
    );

    this.editor.onKeyUp((e) => {
      this._changeText(e.browserEvent.isComposing);
    });
    console.log(this.editor.hasTextFocus());
    this.editor.onDidFocusEditorText(() => {
      console.log("focus");
    });
    this.editor.onDidBlurEditorText((e) => {
      this.dispatchEvent(new CustomEvent("blur-editor"));
    });
    // When Command or Control + S is pressed
    myAPI.saveFragment((_e: Event) => this._saveContent());
  }

  disconnectedCallback() {
    myAPI.removeAllListeners("save-fragment");

    super.disconnectedCallback();
  }

  updated() {
    // switch snippets
    if (this.viewStatesController.isSnippetSwitched) {
      // reset the all view states
      this.viewStateStore.forEachRow("states", (rowId: string): void => {
        this.viewStateStore.delRow("states", `${rowId}`);
      });
    } else {
      // if switched to a new fragment, save the previous view state
      if (this.viewStatesController.previousFragmentId) {
        this._saveCurrentViewState(
          this.viewStatesController.previousFragmentId
        );
      } else {
        this._saveCurrentViewState(this.viewStatesController.currentFragmentId);
      }
    }

    monaco.editor.setModelLanguage(this.model, this.language);
    console.log(`model language was changed to ${this.model.getLanguageId()}`);
    this.setValue(this.code);

    if (!this._ObjectIsEmpty(this.editorOptions)) {
      this.setOptions(this.editorOptions);
    }

    console.info("updated", this.viewStateStore.getTable("states"));
    if (
      this.viewStateStore.hasRow(
        "states",
        `${this.viewStatesController.currentFragmentId}`
      )
    ) {
      this._restoreCurrentViewState();
    }
  }

  private _ObjectIsEmpty = (obj: object) =>
    Object.keys(obj).length === 0 && obj.constructor === Object;

  private _selectLanguage(): void {
    this.dispatchEvent(new CustomEvent("select-language"));
  }

  private _saveCurrentViewState(fragmentId: number) {
    if (!fragmentId) return;

    const viewState = this.editor.saveViewState();
    this.viewStateStore.setPartialRow("states", `${fragmentId}`, {
      viewState: JSON.stringify(viewState),
    });
  }

  private _restoreCurrentViewState() {
    const viewState = this.viewStateStore.getCell(
      "states",
      `${this.viewStatesController.currentFragmentId}`,
      "viewState"
    );
    this.editor.restoreViewState(JSON.parse(viewState));
  }

  private _changeText(isComposing: boolean) {
    this.dispatchEvent(
      new CustomEvent("change-text", {
        detail: { text: this.getValue(), isComposing },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _saveContent() {
    this._saveCurrentViewState(this.viewStatesController.currentFragmentId);
    this.viewStatesController.previousFragmentId = null;

    this.dispatchEvent(
      new CustomEvent("save-content", {
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
