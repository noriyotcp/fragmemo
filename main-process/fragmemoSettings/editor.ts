import { initSettingsStorage } from "./initSettingsStorage";
import { EditorSettingsType } from "fragmemoSettings.d";

const keyname = "userSettingsEditor";
const filename = `${keyname}.json`;
const defaultSettings: EditorSettingsType = {
  editor: {
    lineNumbers: "on",
  },
  files: {
    autosave: true,
    afterDelay: 1000,
  },
};

let getEditorSettings: () => EditorSettingsType;
let setEditorSettings: (_: EditorSettingsType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initSettingsStorage(filename, defaultSettings)
  .then((storage) => {
    getEditorSettings = () => {
      const editorSettings = <EditorSettingsType>storage.lib.getSync(keyname);
      // Merge and override default settings with user settings
      return { ...defaultSettings, ...editorSettings };
    };
    setEditorSettings = (data) => {
      storage.lib.set(
        keyname,
        data,
        { prettyPrinting: true },
        function (error) {
          if (error) {
            console.error(error);
            throw error;
          }
        }
      );
    };
  })
  .catch((error) => {
    throw error;
  });

export { getEditorSettings, setEditorSettings };
