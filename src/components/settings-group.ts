import { LitElement, html, TemplateResult } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";

@customElement("settings-group")
export class SettingsGroup extends LitElement {
  @query("#autosave") autosave!: HTMLInputElement;
  @query("sl-input[name='after-delay']") afterDelay!: HTMLInputElement;
  @queryAll("sl-input") inputs!: HTMLInputElement[];
  @query("form") form!: HTMLFormElement;
  settings = {
    autosave: true,
    afterDelay: 1000,
  };

  render(): TemplateResult {
    return html`
      <sl-tab-group placement="start">
        <sl-tab slot="nav" panel="editor">Editor</sl-tab>
        <sl-tab slot="nav" panel="custom">Custom</sl-tab>
        <sl-tab slot="nav" panel="advanced">Advanced</sl-tab>

        <sl-tab-panel name="editor">
          <form>
            <sl-switch
              id="autosave"
              name="autosave"
              checked=${this.settings.autosave}
              >Auto save</sl-switch
            >
            <sl-input
              type="number"
              placeholder="after delay (milliseconds)"
              size="small"
              value=${this.settings.afterDelay}
              min="1"
              name="after-delay"
              required
            ></sl-input>
            <br />
            <sl-button type="submit" variant="primary">Submit</sl-button>
          </form>
        </sl-tab-panel>
        <sl-tab-panel name="custom">This is the custom tab panel.</sl-tab-panel>
        <sl-tab-panel name="advanced"
          >This is the advanced tab panel.</sl-tab-panel
        >
      </sl-tab-group>
    `;
  }

  firstUpdated() {
    this.form.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      const isAllValid = Array.from(this.inputs).every((i) =>
        this._checkValidity(i)
      );
      if (isAllValid) {
        this._setSettings();
      }
    });
  }

  private _setSettings() {
    this.settings.autosave = this.autosave.checked;
    this.settings.afterDelay = this.afterDelay.valueAsNumber;
    console.log("settings", this.settings);
  }

  private _checkValidity(input: HTMLInputElement) {
    if (input.reportValidity()) {
      // Shoelace's method
      return true;
    } else {
      return false;
    }
  }
}
