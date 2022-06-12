import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { createFragmentStore, Store } from "../stores";
import { Language } from "models.d";
import { saveContentAsync, saveContent } from "../saveContent";
import {
  contentEditingStateChanged,
  updateSnippets,
} from "../events/global-dispatchers";

const { myAPI } = window;

@customElement("editor-element")
export class EditorElement extends LitElement {
  fragmentStore: typeof Store;

  constructor() {
    super();
    this.fragmentStore = createFragmentStore();
    this.fragmentStore.addCellListener(
      null,
      null,
      null,
      (store, tableId, rowId, cellId) => {
        console.log(
          `${cellId} cell in ${rowId} row in ${tableId} table changed`
        );
        console.info(
          "FragmentStore status:",
          this.fragmentStore.getTable("states")
        );
      }
    );

    myAPI.loadLanguages().then((languages) => {
      this._languages = languages;
    });
    myAPI.getEditorSettings().then((settings) => {
      this._editorOptions = { ...settings.editor };
    });
  }

  @query("#lang-select") select?: HTMLSelectElement;
  @state()
  private _activeFragmentId?: number;
  @state() private _content = "";
  @state() private _language = "plaintext";
  @state() private _editorOptions = {};
  private _languages!: Language[];
  @state() private _autosave!: boolean;
  private _afterDelay!: number;

  static styles = [
    css`
      :host {
        display: block;
        margin-top: var(--header-height);
      }

      footer {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: var(--dark-gray);
        height: calc(var(--header-height) - var(--header-height-offset));
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      footer > select {
        background: var(--dark-gray);
        border: none;
        color: var(--text-color);
        padding-left: 1em;
        height: 100%;
        width: 8rem;
      }

      .no-snippet {
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(100vh - var(--header-height));
        color: var(--gray);
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <section>
        <snippet-title></snippet-title>
        <fragment-tab-list
          @fragment-activated=${this._onFragmentActivated}
        ></fragment-tab-list>
        <code-editor
          code="${this._content}"
          language="${this._language}"
          editorOptions="${JSON.stringify(this._editorOptions)}"
          @change-text=${this._changeText}
          @save-content=${this._saveContent}
          @blur-editor=${this._onBlurEditor}
          @select-language=${this._selectLanguage}
        ></code-editor>
      </section>
      <footer>
        <select
          name="languages"
          id="lang-select"
          @change=${this._selectionChange}
        >
          ${map(this._languages, (l) => {
            return html`<option _idx=${l._idx} value=${l.name}>
              ${l.alias}
            </option>`;
          })}
        </select>
        ${this._autosave
          ? html`<editing-state-icon></editing-state-icon>`
          : html``}
      </footer>
    `;
  }

  firstUpdated(): void {
    window.addEventListener(
      "user-settings-editor-updated",
      this._onEditorSettingsUpdated as EventListener
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      "user-settings-editor-updated",
      this._onEditorSettingsUpdated as EventListener
    );
    super.disconnectedCallback();
  }

  private _onEditorSettingsUpdated = (e: CustomEvent) => {
    this._autosave = e.detail.userSettings.files.autosave;
    this._afterDelay = e.detail.userSettings.files.afterDelay;
    this._editorOptions = { ...e.detail.userSettings.editor };
  };

  private _selectLanguage() {
    this.select?.focus();
  }

  private _selectionChange(e: CustomEvent): void {
    if (!e.currentTarget) return;

    const target = <HTMLSelectElement>e.currentTarget;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._language = target.selectedOptions[0].getAttribute("value")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const _idx = target.selectedOptions[0].getAttribute("_idx")!;

    if (this._activeFragmentId) {
      myAPI.updateFragment({
        _id: this._activeFragmentId,
        properties: { language: { _idx: Number(_idx) } },
      });
      this.fragmentStore.setPartialRow("states", `${this._activeFragmentId}`, {
        langIdx: Number(_idx),
      });
    }

    this._setContent();
  }

  private _onFragmentActivated(e: CustomEvent): void {
    console.log(e.type, e.detail.activeFragmentId);
    // activeFragmentId can be undefined
    if (isNaN(Number(e.detail.activeFragmentId))) return;

    this._activeFragmentId = e.detail.activeFragmentId;
    // if no records for the active fragment, it fetches a fragment from Realm DB
    if (!this.fragmentStore.hasRow("states", `${this._activeFragmentId}`)) {
      myAPI.getFragment(Number(this._activeFragmentId)).then((fragment) => {
        this.fragmentStore.setPartialRow("states", `${fragment._id}`, {
          content: fragment.content,
          langIdx: fragment.language._idx,
        });
        this._selectOption(fragment.language._idx);
        this._setContent();
      });
    } else {
      this._selectOption(
        this.fragmentStore.getCell(
          "states",
          `${this._activeFragmentId}`,
          "langIdx"
        )
      );
      this._setContent();
    }
  }

  private _selectOption(idx: number): void {
    if (!this.select) return;

    this.select.options[idx].selected = true;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._language = this.select.selectedOptions[0].getAttribute("value")!;
  }

  private _changeText(e: CustomEvent) {
    if (this._activeFragmentId === undefined) return;

    // compare the previous and current text
    myAPI.getFragment(this._activeFragmentId).then((fragment) => {
      if (fragment.content !== e.detail.text) {
        this.fragmentStore.setCell("states", `${this._activeFragmentId}`, {
          content: e.detail.text,
        });
        this.fragmentStore.setPartialRow(
          "states",
          `${this._activeFragmentId}`,
          {
            content: e.detail.text,
            isEditing: true,
          }
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        contentEditingStateChanged(this._activeFragmentId!, this.fragmentStore);

        // auto save
        if (this._autosave && !e.detail.isComposing) {
          const params = {
            fragmentId: this._activeFragmentId as number,
            content: e.detail.text,
            fragmentStore: this.fragmentStore,
            afterDelay: this._afterDelay,
          };
          saveContentAsync(params);
        }
      }
    });
  }

  private _saveContent(e: CustomEvent): void {
    if (this._activeFragmentId === undefined) return;

    saveContent(this._activeFragmentId, e.detail.text, this.fragmentStore);
  }

  private _onBlurEditor(e: CustomEvent): void {
    updateSnippets();
  }

  private _setContent(): void {
    if (this._activeFragmentId === undefined) return;
    this._content = this.fragmentStore.getCell(
      "states",
      `${this._activeFragmentId}`,
      "content"
    );
  }
}
