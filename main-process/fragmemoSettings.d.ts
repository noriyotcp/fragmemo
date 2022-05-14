import * as monaco from "monaco-editor";

export type EditorSettingsType = {
  editor: monaco.editor.IEditorOptions;
  files: {
    autosave: boolean;
    afterDelay: number;
  };
};
