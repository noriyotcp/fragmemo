import { EditorSettingsType } from "../main-process/fragmemoSettings.d";

export const defaultEditorSettings: EditorSettingsType = {
  editor: {
    lineNumbers: "on",
    hoge: "hoge",
  },
  files: {
    autosave: true,
    afterDelay: 1000,
  },
};
