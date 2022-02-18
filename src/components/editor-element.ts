import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import FragmentStore from "../stores";
import "@ui5/webcomponents/dist/Select";
import "@ui5/webcomponents/dist/Option";

const { myAPI } = window;

@customElement("editor-element")
export class EditorElement extends LitElement {
  fragmentStore: FragmentStore;

  constructor() {
    super();
    this.fragmentStore = new FragmentStore();
  }

  @property() _textareaValue = "";
  @state() private _activeFragmentId?: number;
  @state() private _content = "";
  @state() private _language = "plaintext";

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
        <ui5-select class="select" @change=${this._selectionChange}>
          <ui5-option value="plaintext" selected>Plain Text</ui5-option>
          <ui5-option value="typescript">TypeScript</ui5-option>
          <ui5-option value="ruby">Ruby</ui5-option>
        </ui5-select>
        <div>Item</div>
      </footer>
    `;
  }

  private _selectionChange(e: CustomEvent): void {
    this._setContent();
    this._language = e.detail.selectedOption.value;
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
