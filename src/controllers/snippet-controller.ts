import { ReactiveController, ReactiveControllerHost } from "lit";

export class SnippetController implements ReactiveController {
  private host: ReactiveControllerHost;

  selectedSnippet: Record<string, unknown> = {};

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hostConnected(): void {}
}
