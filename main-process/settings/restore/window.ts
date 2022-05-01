import { app } from "electron";
import { setTimeout } from "timers/promises";
import path from "node:path";
import fs from "node:fs";
import { JsonStorage, DatapathDoesNotExistError } from "../../jsonStorage";

const pathToRestore = `${app.getPath("userData")}/fragmemoSettings/restore`;

const initRestoreWindow = async (): Promise<JsonStorage> => {
  try {
    return new JsonStorage(pathToRestore);
  } catch (error) {
    if (error instanceof DatapathDoesNotExistError) {
      fs.mkdirSync(pathToRestore, { recursive: true });
      const defaultWindowSettings = {
        window: { width: 800, height: 600, x: 0, y: 0 },
      };
      // Use fs.writeFileSync instead of electron-json-storage set()
      // electron-json-storage set() is async, so we need to wait for it to finish
      // github.dev/electron-userland/electron-json-storage/blob/df4edce1e643e7343d962721fe2eacfeda094870/lib/storage.js#L419-L439
      fs.writeFileSync(
        path.resolve(pathToRestore, "window.json"),
        JSON.stringify(defaultWindowSettings)
      );
      return new JsonStorage(pathToRestore);
    } else {
      throw error;
    }
  } finally {
    // But, just in case, we'll wait for 1 millisecond :)
    await setTimeout(1);
  }
};

type WindowDataType = {
  window: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
};

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
let getWindowData: () => WindowDataType;
let setWindowData: (_: WindowDataType) => void;

initRestoreWindow().then((storage) => {
  getWindowData = () => {
    return <WindowDataType>storage.lib.getSync("window");
  };
  setWindowData = (data) => {
    storage.lib.set("window", data, function (err) {
      if (err) {
        console.log(err);
      }
    });
  };
});

export { getWindowData, setWindowData };
