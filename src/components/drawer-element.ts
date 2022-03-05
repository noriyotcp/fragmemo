import { Override } from "index";
import { LitElement, html, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";

const { myAPI } = window;

@customElement("drawer-element")
export class DrawerElement extends LitElement {
  constructor() {
    super();
    myAPI.openSettings((_e: Event, elementName: string) => {
      this._openSettings(elementName);
    });
  }

  @query(".settings") drawer!: Override<
    HTMLElement,
    { show: () => void; hide: () => void }
  >;

  render(): TemplateResult {
    return html`
      <sl-drawer label="Settings" class="settings" style="--size: 100vw">
        This drawer width is always 100% of the viewport.
        <div
          style="height: 150vh; border: dashed 2px var(--sl-color-neutral-200); padding: 0 1rem;"
        >
          <p>Scroll down and give it a try! 👇</p>
        </div>
        <sl-button slot="footer" variant="primary" @click=${this._closeSettings}
          >Close</sl-button
        >
      </sl-drawer>
    `;
  }

  private async _openSettings(elementName: string): Promise<void> {
    this.drawer.show();
    console.log(elementName);
  }

  private _closeSettings() {
    this.drawer.hide();
  }
}
