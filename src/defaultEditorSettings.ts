import { EditorSettingsType } from "../main-process/fragmemoSettings.d";

export const defaultEditorSettings: EditorSettingsType = {
  editor: {
    lineNumbers: "on",
  },
  files: {
    autosave: true,
    afterDelay: 1000,
  },
};
