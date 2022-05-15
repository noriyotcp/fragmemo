import { initSettingsStorage } from "./initSettingsStorage";
import { EditorSettingsType } from "fragmemoSettings.d";
import { defaultEditorSettings } from "../../common/defaultEditorSettings";

const keyname = "userSettingsEditor";
const filename = `${keyname}.json`;

let getEditorSettings: () => EditorSettingsType;
let setEditorSettings: (_: EditorSettingsType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initSettingsStorage(filename, defaultEditorSettings)
  .then((storage) => {
    getEditorSettings = () => {
      const editorSettings = <EditorSettingsType>storage.lib.getSync(keyname);
      // Merge and override default settings with user settings
      return { ...defaultEditorSettings, ...editorSettings };
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
