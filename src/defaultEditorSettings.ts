import { EditorSettingsType } from "../main-process/fragmemoSettings.d";

export const defaultEditorSettings: EditorSettingsType = {
  editor: {
    lineNumbers: "on",
    stickyScroll: {
      enabled: false,
      maxLineCount: 5,
    },
  },
  files: {
    autosave: true,
    afterDelay: 1000,
  },
};
