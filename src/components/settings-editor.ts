import { EditorSettingsType } from "index.d";
import { LitElement, html, TemplateResult, css } from "lit";
import { customElement, query, queryAll, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import {
  userSettingsUpdated,
  displayToast,
} from "../events/global-dispatchers";
import * as monaco from "monaco-editor";

const { myAPI } = window;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const lineNumbersList = monaco.editor.EditorOptions.lineNumbers.schema.enum;

@customElement("settings-editor")
export class SettingsEditor extends LitElement {
  @query("#autosave") autosave!: HTMLInputElement;
  @query("sl-input[name='after-delay']") afterDelay!: HTMLInputElement;
  @query("sl-select[name='editor-line-numbers']")
  editorLineNumbers!: HTMLInputElement;
  @queryAll("sl-input") inputs!: HTMLInputElement[];
  @query("form") form!: HTMLFormElement;
  @query("#reload-page") reloadPage!: HTMLButtonElement;

  @state() settings!: EditorSettingsType;
  monacoDefaultEditorOptions: Partial<EditorSettingsType["editor"]>;
  defaultEditorSettings: EditorSettingsType = {
    editor: {
      lineNumbers: "on",
    },
    files: {
      autosave: true,
      afterDelay: 1000,
    },
  };

  constructor() {
    super();
    const options = Object.entries(monaco.editor.EditorOptions).map(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ([_, value]) => [value.name, value.schema?.default ?? value.defaultValue]
    );
    console.log("object fromEntries", Object.fromEntries(options));
    this.monacoDefaultEditorOptions = Object.fromEntries(options);

    myAPI.getEditorSettings().then((settings) => {
      // override default settings with user settings
      this.settings = settings;
      // Not updated at this time, but nofify the current settings to the other components
      this._settingsUpdated();
    });
  }

  static styles = [
    css`
      .content-container {
        max-width: 50%;
      }
      form {
        display: grid;
        row-gap: 1rem;
      }
      .btn-group {
        display: inline-flex;
        justify-content: space-between;
      }
      sl-switch::part(base) {
        color: var(--sl-input-label-color);
      }
      h3 {
        margin-block: 0;
      }
      .form-group {
        padding-left: 0.5rem;
      }
      .form-group[customized] {
        padding-left: 0.5rem;
        border-left: 1px solid var(--sl-color-primary-600);
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <div class="content-container">
        <form>
          <h3>Editor</h3>
          <div
            class="form-group"
            ?customized="${this._isCustomized("lineNumbers")}"
          >
            <sl-select
              size="small"
              label="Line Numbers"
              name="editor-line-numbers"
              value=${this.settings?.editor?.lineNumbers}
            >
              ${map(
                lineNumbersList,
                (i) => html`<sl-menu-item value=${i}>${i}</sl-menu-item>`
              )}
            </sl-select>
          </div>

          <h3>Files</h3>
          <div
            class="form-group"
            ?customized="${!this.settings?.files?.autosave}"
          >
            <sl-switch
              id="autosave"
              name="autosave"
              ?checked="${this.settings?.files?.autosave}"
              >Auto save</sl-switch
            >
          </div>
          <div
            class="form-group"
            ?customized="${this.settings?.files?.afterDelay !== 1000}"
          >
            <sl-input
              label="Auto Save Delay"
              type="number"
              placeholder="after delay (milliseconds)"
              size="small"
              value=${this.settings?.files?.afterDelay}
              min="1"
              name="after-delay"
              class="input"
              required
            ></sl-input>
          </div>
          <div class="btn-group">
            <sl-button type="submit" variant="primary">Submit</sl-button>
            <sl-tooltip placement="left">
              <div slot="content">
                Restore settings<br />before submitting changes
              </div>
              <sl-button id="reload-page">
                <sl-icon name="arrow-clockwise" label="Reload"></sl-icon>
              </sl-button>
            </sl-tooltip>
          </div>
        </form>
      </div>
    `;
  }

  firstUpdated() {
    this.form.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      const isAllValid = Array.from(this.inputs).every(
        (input) => input.reportValidity() // Shoelace's method
      );
      if (isAllValid) {
        this._setSettings();
        this._settingsUpdated();
        displayToast("Editor settings updated", {
          variant: "primary",
          icon: "check2-circle",
        });
      }
    });

    this.reloadPage.addEventListener("click", () => {
      this.requestUpdate();
    });
  }

  updated() {
    if (!this.settings) return;

    // ensure to update the UI state of the inputs
    this.autosave.checked = this.settings.files.autosave;
    this.afterDelay.valueAsNumber = this.settings.files.afterDelay;
    this.editorLineNumbers.value = <string>this.settings.editor.lineNumbers;
  }

  private _setSettings() {
    const updatedSettings: EditorSettingsType = {
      editor: {
        lineNumbers: this.editorLineNumbers
          .value as monaco.editor.LineNumbersType,
      },
      files: {
        autosave: this.autosave.checked,
        afterDelay: this.afterDelay.valueAsNumber,
      },
    };
    myAPI.setEditorSettings(updatedSettings);
    this.settings = updatedSettings;
  }

  private _settingsUpdated() {
    userSettingsUpdated("editor", this.settings);
  }

  private _isCustomized(editorOptionName: keyof EditorSettingsType["editor"]) {
    return (
      this.defaultEditorSettings.editor[`${editorOptionName}`] !==
      this.settings?.editor[`${editorOptionName}`]
    );
  }
}
