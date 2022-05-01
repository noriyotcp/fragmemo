import { setTimeout } from "timers/promises";
import path from "node:path";
import fs from "node:fs";
import {
  initJsonStorage,
  pathToRestore,
  JsonStorage,
  DatapathDoesNotExistError,
} from "./initJsonStorage";

const initRestoreWindowStorage = async (): Promise<JsonStorage> => {
  return initJsonStorage("window.json")
    .then((storage) => {
      return Promise.resolve(storage);
    })
    .catch(async (error) => {
      if (error instanceof DatapathDoesNotExistError) {
        await createDefaultWindowSettings();
        return initJsonStorage("window.json");
      } else {
        return Promise.reject(error);
      }
    });
};

const createDefaultWindowSettings = async (): Promise<void> => {
  try {
    fs.mkdirSync(pathToRestore, { recursive: true });
    const defaultWindowSettings = {
      window: { width: 800, height: 600, x: 0, y: 0 },
    };
    // Use fs.writeFileSync instead of electron-json-storage set()
    // electron-json-storage set() is async, so we need to wait for it to finish
    // github.dev/electron-userland/electron-json-storage/blob/df4edce1e643e7343d962721fe2eacfeda094870/lib/storage.js#L419-L439
    fs.writeFileSync(
      path.resolve(pathToRestore, "window.json"),
      JSON.stringify(defaultWindowSettings, null, 2)
    );
  } catch (error) {
    console.error(error);
    throw error;
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

let getWindowData: () => WindowDataType;
let setWindowData: (_: WindowDataType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initRestoreWindowStorage()
  .then((storage) => {
    getWindowData = () => {
      return <WindowDataType>storage.lib.getSync("window");
    };
    setWindowData = (data) => {
      storage.lib.set(
        "window",
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

export { getWindowData, setWindowData };
