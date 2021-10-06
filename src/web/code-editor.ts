import * as monaco from "monaco-editor";

const value = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

export const initMonaco = (): void => {
  const model = monaco.editor.createModel(value, "typescript");

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  monaco.editor.create(document.getElementById("monaco-container")!, {
    model: model,
    theme: "vs-dark",
    automaticLayout: true,
  });
}
