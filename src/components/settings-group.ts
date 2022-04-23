import { LitElement, html, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("settings-group")
export class SettingsGroup extends LitElement {
  @query("#autosave") autosave!: HTMLInputElement;
  settings = {
    autosave: true,
  };

  render(): TemplateResult {
    return html`
      <sl-tab-group placement="start">
        <sl-tab slot="nav" panel="editor">Editor</sl-tab>
        <sl-tab slot="nav" panel="custom">Custom</sl-tab>
        <sl-tab slot="nav" panel="advanced">Advanced</sl-tab>

        <sl-tab-panel name="editor">
          <form>
            <sl-switch id="autosave" checked=${this.settings.autosave}
              >Auto save</sl-switch
            >
            <sl-input
              type="number"
              placeholder="after delay (milliseconds)"
              size="small"
              value="1000"
              min="1"
            ></sl-input>
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
    this.autosave.addEventListener("sl-change", (e: Event) => {
      this.settings.autosave = this.autosave.checked;
      console.log("autosave", this.settings.autosave);
    });
  }
}
