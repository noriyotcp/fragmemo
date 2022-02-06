import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Fragment } from "models";

const { myAPI } = window;

@customElement("editor-element")
export class EditorElement extends LitElement {
  @property() _textareaValue = "";
  @state() private _activeFragment?: Fragment;

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
    myAPI.getFragment(Number(e.detail.activeFragmentId)).then((fragment) => {
      this._activeFragment = fragment;
    });
  }

  changeText(e: CustomEvent) {
    // compare the previous and current text
    const isChanged = this._activeFragment?.content !== e.detail.text;
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
          code="${this._activeFragment?.content}"
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
        _id: this._activeFragment?._id,
        properties: { content: e.detail.text },
      })
      .then(({ status }) => {
        console.log("myAPI.updateFragment", status);
        if (status) {
          if (this._activeFragment) {
            this._activeFragment.content = e.detail.text;
          }
        }
      });
  }
}
