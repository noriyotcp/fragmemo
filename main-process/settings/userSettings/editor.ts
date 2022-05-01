import { app } from "electron";
import { setTimeout } from "timers/promises";
import path from "node:path";
import fs from "node:fs";
import { JsonStorage, DatapathDoesNotExistError } from "../../jsonStorage";

const pathToRestore = `${app.getPath(
  "userData"
)}/fragmemoSettings/userSettings`;

const initEditorSettingsStorage = async (): Promise<JsonStorage> => {
  try {
    // Check whether editor.json exists or not
    JsonStorage.doesDatapathExist(path.resolve(pathToRestore, "editor.json"));
    return Promise.resolve(new JsonStorage(pathToRestore));
  } catch (error) {
    if (error instanceof DatapathDoesNotExistError) {
      await createDefaultEditorSettings();
      return Promise.resolve(new JsonStorage(pathToRestore));
    } else {
      return Promise.reject(error);
    }
  }
};

const createDefaultEditorSettings = async (): Promise<void> => {
  try {
    fs.mkdirSync(pathToRestore, { recursive: true });
    const defaultEditorSettings = {
      editor: { autosave: true, afterDelay: 1000 },
    };
    // Use fs.writeFileSync instead of electron-json-storage set()
    // electron-json-storage set() is async, so we need to wait for it to finish
    // github.dev/electron-userland/electron-json-storage/blob/df4edce1e643e7343d962721fe2eacfeda094870/lib/storage.js#L419-L439
    fs.writeFileSync(
      path.resolve(pathToRestore, "editor.json"),
      JSON.stringify(defaultEditorSettings, null, 2)
    );
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    // But, just in case, we'll wait for 1 millisecond :)
    await setTimeout(1);
  }
};

type EditorSettingsType = {
  editor: {
    autosave: boolean;
    afterDelay: number;
  };
};

let getEditorSettings: () => EditorSettingsType;
let setEditorSettings: (_: EditorSettingsType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initEditorSettingsStorage()
  .then((storage) => {
    getEditorSettings = () => {
      return <EditorSettingsType>storage.lib.getSync("editor");
    };
    setEditorSettings = (data) => {
      storage.lib.set(
        "editor",
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
