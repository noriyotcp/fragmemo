import { LitElement, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "@ui5/webcomponents/dist/Toast.js";

@customElement("toast-element")
export class ToastElement extends LitElement {
  render(): TemplateResult {
    return html`
      <ui5-toast id="wcToastBE" placement="BottomEnd">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          dapibus hendrerit turpis ac eleifend. Quisque laoreet, dui non
          efficitur convallis, nisl risus interdum erat, et aliquam tellus dui
          sed erat. Aliquam tellus metus, consequat a maximus consectetur,
          varius non orci. Aliquam felis urna, porttitor non lectus non,
          scelerisque scelerisque nibh.
        </p>
      </ui5-toast>
    `;
  }
}
