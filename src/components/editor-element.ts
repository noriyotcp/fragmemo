import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import FragmentStore from "../stores";
import { Language } from "models";

const { myAPI } = window;

@customElement("editor-element")
export class EditorElement extends LitElement {
  fragmentStore: FragmentStore;

  constructor() {
    super();
    this.fragmentStore = new FragmentStore();
    myAPI.loadLanguages().then((languages) => {
      this._languages = languages;
    });
  }

  @property() _textareaValue = "";
  @state() private _activeFragmentId?: number;
  @state() private _content = "";
  @state() private _language = "plaintext";
  @state() private _languages!: Language[];

  static styles = [
    css`
      :host {
        display: block;
        margin-top: 41px;
      }

      header {
        max-height: 59px;
      }

      footer {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: var(--dark-gray);
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      footer > select {
        background: var(--dark-gray);
        border: none;
        color: var(--text-color);
        height: 100%;
        width: 8rem;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <header>
        <test-header textareaValue="${this._textareaValue}"></test-header>
        <fragment-tab-list
          @fragment-activated=${this._onFragmentActivated}
        ></fragment-tab-list>
        <code-editor
          code="${this._content}"
          language="${this._language}"
          @change-text=${this._changeText}
          @save-text=${this._saveText}
        ></code-editor>
      </header>
      <footer>
        <select
          name="languages"
          id="lang-select"
          @change=${this._selectionChange}
        >
          ${map(this._languages, (l) => {
            return html`<option value=${l.name}>${l.alias}</option>`;
          })}
        </select>
      </footer>
    `;
  }

  private _selectionChange(e: CustomEvent): void {
    if (!e.currentTarget) return;

    const target = <HTMLSelectElement>e.currentTarget;
    this._language = target.value;
    this._setContent();
  }

  private _onFragmentActivated(e: CustomEvent): void {
    console.log(e.type, e.detail.activeFragmentId);
    // activeFragmentId can be undefined
    if (isNaN(Number(e.detail.activeFragmentId))) return;

    this._activeFragmentId = e.detail.activeFragmentId;
    // if no records for the active fragment, it fetches a fragment from Realm DB
    if (!this.fragmentStore.hasRow(`${this._activeFragmentId}`)) {
      myAPI.getFragment(Number(this._activeFragmentId)).then((fragment) => {
        this.fragmentStore.setCell(
          `${fragment._id}`,
          "content",
          fragment.content
        );
        this._setContent();
      });
    } else {
      this._setContent();
    }
  }

  private _changeText(e: CustomEvent) {
    if (this._activeFragmentId === undefined) return;

    // compare the previous and current text
    const isChanged =
      this.fragmentStore.getCell(`${this._activeFragmentId}`, "content") !==
      e.detail.text;
    this.fragmentStore.setCell(
      `${this._activeFragmentId}`,
      "isEditing",
      isChanged
    );
    this.fragmentStore.setRow(`${this._activeFragmentId}`, {
      content: e.detail.text,
      isEditing: isChanged,
    });

    if (isChanged) {
      dispatch({
        type: "content-editing-state-changed",
        detail: {
          fragmentStore: this.fragmentStore,
        },
      });
    }
    console.info("Is text changed?:", isChanged);
  }

  private _saveText(e: CustomEvent): void {
    myAPI
      .updateFragment({
        _id: this._activeFragmentId,
        properties: { content: e.detail.text },
      })
      .then(({ status }) => {
        console.log("myAPI.updateFragment", status);
        if (status) {
          this.fragmentStore.setRow(`${this._activeFragmentId}`, {
            content: e.detail.text,
            isEditing: false,
          });
          dispatch({
            type: "content-editing-state-changed",
            detail: {
              fragmentStore: this.fragmentStore,
            },
          });
        }
      });
  }

  private _setContent(): void {
    if (this._activeFragmentId === undefined) return;
    this._content = this.fragmentStore.getCell(
      `${this._activeFragmentId}`,
      "content"
    );
  }
}
