import { Override } from "index";
import { LitElement, html, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

const { myAPI } = window;

@customElement("settings-element")
export class SettingsElement extends LitElement {
  constructor() {
    super();
    myAPI.toggleSettings((_e: Event) => {
      this._toggleSettings();
    });
  }

  @query(".settings") drawer!: Override<
    HTMLElement,
    { show: () => void; hide: () => void; open: boolean }
  >;

  render(): TemplateResult {
    return html`
      <sl-drawer label="Settings" class="settings" style="--size: 100vw">
        <settings-group></settings-group>
        <sl-button slot="footer" variant="primary" @click=${this._closeSettings}
          >Close</sl-button
        >
      </sl-drawer>
    `;
  }

  disconnectedCallback() {
    myAPI.removeAllListeners("toggle-settings");

    super.disconnectedCallback();
  }

  private _toggleSettings(): void {
    if (this.drawer.open) {
      this._closeSettings();
    } else {
      this._openSettings();
    }
  }

  private _openSettings() {
    this.drawer.show();
  }

  private _closeSettings() {
    this.drawer.hide();
  }
}
