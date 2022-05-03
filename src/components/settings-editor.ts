import { EditorSettingsType } from "index.d";
import { LitElement, html, TemplateResult, css } from "lit";
import { customElement, query, queryAll, state } from "lit/decorators.js";
import {
  userSettingsUpdated,
  displayToast,
} from "../events/global-dispatchers";

const { myAPI } = window;

@customElement("settings-editor")
export class SettingsEditor extends LitElement {
  @query("#autosave") autosave!: HTMLInputElement;
  @query("sl-input[name='after-delay']") afterDelay!: HTMLInputElement;
  @queryAll("sl-input") inputs!: HTMLInputElement[];
  @query("form") form!: HTMLFormElement;
  @query("#reload-page") reloadPage!: HTMLButtonElement;

  @state() settings!: EditorSettingsType;

  constructor() {
    super();
    myAPI.getEditorSettings().then((settings) => {
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
      }
      .btn-group {
        display: inline-flex;
        justify-content: space-between;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <div class="content-container">
        <form>
          <sl-switch id="autosave" name="autosave">Auto save</sl-switch>
          <br />
          <sl-input
            type="number"
            placeholder="after delay (milliseconds)"
            size="small"
            value=${this.settings?.afterDelay}
            min="1"
            name="after-delay"
            class="input"
            required
          ></sl-input>
          <br />
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

    // ensure to update the state of the inputs
    this.autosave.checked = this.settings.autosave;
    this.afterDelay.valueAsNumber = this.settings.afterDelay;
  }

  private _setSettings() {
    const updatedSettings = {
      autosave: this.autosave.checked,
      afterDelay: this.afterDelay.valueAsNumber,
    };
    myAPI.setEditorSettings(updatedSettings);
    this.settings = updatedSettings;
  }

  private _settingsUpdated() {
    userSettingsUpdated("editor", this.settings);
  }
}
