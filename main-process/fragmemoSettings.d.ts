export type EditorSettingsType = {
  editor: {
    lineNumbers: "on" | "off" | "relative" | "interval";
  };
  files: {
    autosave: boolean;
    afterDelay: number;
  };
};
