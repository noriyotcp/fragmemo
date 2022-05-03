import { LitElement, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("settings-group")
export class SettingsGroup extends LitElement {
  render(): TemplateResult {
    return html`
      <sl-tab-group placement="start">
        <sl-tab slot="nav" panel="editor">Editor</sl-tab>
        <sl-tab slot="nav" panel="custom">Custom</sl-tab>
        <sl-tab slot="nav" panel="advanced">Advanced</sl-tab>

        <sl-tab-panel name="editor">
          <settings-editor></settings-editor>
        </sl-tab-panel>
        <sl-tab-panel name="custom">This is the custom tab panel.</sl-tab-panel>
        <sl-tab-panel name="advanced"
          >This is the advanced tab panel.</sl-tab-panel
        >
      </sl-tab-group>
    `;
  }
}
