import { dispatch } from "../events/dispatcher";
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

const { myAPI } = window;
const { createStore, Store } = TinyBase;

@customElement("editor-element")
export class EditorElement extends LitElement {
  contentStore: typeof Store;
  editingStatesSchema = {
    editingStates: {
      content: { type: "string", default: "" },
      isEditing: { type: "boolean", default: false },
    },
  };

  constructor() {
    super();
    this.contentStore = createStore().setSchema(this.editingStatesSchema);
  }

  @property() _textareaValue = "";
  @state() private _activeFragmentId?: number;
  @state() private _content = "";

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

  fragmentContent(e: CustomEvent): void {
    console.log(e.type, e.detail.activeFragmentId);
    // activeFragmentId can be undefined
    if (isNaN(Number(e.detail.activeFragmentId))) return;

    this._activeFragmentId = e.detail.activeFragmentId;
    // if the record for active fragment, set content of editingStates to _content state
    // if not, get fragment from Realm DB, set content of editingStates to _content state
    if (
      !this.contentStore.hasRow("editingStates", `${this._activeFragmentId}`)
    ) {
      myAPI.getFragment(Number(this._activeFragmentId)).then((fragment) => {
        this.contentStore.setCell(
          "editingStates",
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

  changeText(e: CustomEvent) {
    // compare the previous and current text
    if (this._activeFragmentId === undefined) return;

    const isChanged =
      this.contentStore.getCell(
        "editingStates",
        `${this._activeFragmentId}`,
        "content"
      ) !== e.detail.text;
    this.contentStore.setCell(
      "editingStates",
      `${this._activeFragmentId}`,
      "isEditing",
      isChanged
    );
    this.contentStore.setRow("editingStates", `${this._activeFragmentId}`, {
      content: e.detail.text,
      isEditing: isChanged,
    });

    if (isChanged) {
      dispatch({
        type: "content-editing-state-changed",
        detail: {
          contentStore: this.contentStore,
        },
      });
    }
    console.info("Is text changed?:", isChanged);
  }

  render(): TemplateResult {
    return html`
      <header>
        <test-header textareaValue="${this._textareaValue}"></test-header>
        <fragment-tab-list
          @fragment-activated=${this.fragmentContent}
        ></fragment-tab-list>
        <code-editor
          code="${this._content}"
          language="typescript"
          @change-text=${this.changeText}
          @save-text=${this._saveText}
        ></code-editor>
      </header>
      <footer>
        <div>Language</div>
        <div>Item</div>
      </footer>
    `;
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
          this.contentStore.setRow(
            "editingStates",
            `${this._activeFragmentId}`,
            { content: e.detail.text, isEditing: false }
          );
          dispatch({
            type: "content-editing-state-changed",
            detail: {
              contentStore: this.contentStore,
            },
          });
        }
      });
  }

  private _setContent(): void {
    if (this._activeFragmentId === undefined) return;

    this._content = this.contentStore.getCell(
      "editingStates",
      `${this._activeFragmentId}`,
      "content"
    );
  }
}
