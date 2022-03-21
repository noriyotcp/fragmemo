import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { createFragmentStore, Store } from "../stores";
import { Language } from "models.d";
import { saveContentAsync } from "../saveContent";

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
    myAPI.selectLanguage((_e: Event) => {
      this._selectLanguage();
    });
  }

  @query("#lang-select") select!: HTMLSelectElement;
  @state()
  private _activeFragmentId?: number;
  @state() private _content = "";
  @state() private _language = "plaintext";
  private _languages!: Language[];

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
    `,
  ];

  render(): TemplateResult {
    return html`
      <section>
        <test-header></test-header>
        <fragment-tab-list
          @fragment-activated=${this._onFragmentActivated}
        ></fragment-tab-list>
        <code-editor
          code="${this._content}"
          language="${this._language}"
          @change-text=${this._changeText}
          @save-text=${this._saveText}
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
        <editing-state-icon></editing-state-icon>
      </footer>
    `;
  }

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
    myAPI.updateFragment({
      _id: this._activeFragmentId,
      properties: { language: { _idx: Number(_idx) } },
    });
    this.fragmentStore.setPartialRow("states", `${this._activeFragmentId}`, {
      langIdx: Number(_idx),
    });
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

        saveContentAsync(
          this._activeFragmentId,
          e.detail.text,
          this.fragmentStore
        );

        dispatch({
          type: "content-editing-state-changed",
          detail: {
            _id: this._activeFragmentId,
            fragmentStore: this.fragmentStore,
          },
        });
      }
    });
  }

  private _saveText(e: CustomEvent): void {
    myAPI
      .updateFragment({
        _id: this._activeFragmentId,
        properties: { content: e.detail.text as string },
      })
      .then(({ status }) => {
        console.log("myAPI.updateFragment", status);
        if (status) {
          this.fragmentStore.setPartialRow(
            "states",
            `${this._activeFragmentId}`,
            {
              content: e.detail.text,
              isEditing: false,
            }
          );
          dispatch({
            type: "content-editing-state-changed",
            detail: {
              _id: this._activeFragmentId,
              fragmentStore: this.fragmentStore,
            },
          });
          // change the order of snippets list
          dispatch({
            type: "update-snippets",
            detail: {
              message: "Snippets updated",
            },
          });
        }
      });
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
