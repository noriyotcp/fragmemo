import { initSettingsStorage } from "./initJsonStorage";

type EditorSettingsType = {
  editor: {
    autosave: boolean;
    afterDelay: number;
  };
};

const keyname = "userSettingsEditor";
const filename = `${keyname}.json`;
const defaultEditorSettings = {
  editor: { autosave: true, afterDelay: 1000 },
};

let getEditorSettings: () => EditorSettingsType;
let setEditorSettings: (_: EditorSettingsType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initSettingsStorage(filename, defaultEditorSettings)
  .then((storage) => {
    getEditorSettings = () => {
      return <EditorSettingsType>storage.lib.getSync(keyname);
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
