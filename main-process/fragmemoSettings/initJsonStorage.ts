import { app } from "electron";
import { setTimeout } from "timers/promises";
import fs from "node:fs";
import path from "node:path";
import { JsonStorage, DatapathDoesNotExistError } from "../jsonStorage";

const pathToRestore = `${app.getPath("userData")}/fragmemoSettings`;

const initJsonStorage = async (filename: string): Promise<JsonStorage> => {
  try {
    // Check whether a JSON file for settings exists or not
    JsonStorage.doesDatapathExist(path.resolve(pathToRestore, filename));
    return Promise.resolve(new JsonStorage(pathToRestore));
  } catch (error) {
    if (error instanceof DatapathDoesNotExistError) {
      return Promise.reject(error);
    } else {
      return Promise.reject(error);
    }
  }
};

const createDefaultSettings = async (
  settings: object,
  filename: string
): Promise<void> => {
  try {
    fs.mkdirSync(pathToRestore, { recursive: true });
    // Use fs.writeFileSync instead of electron-json-storage set()
    // electron-json-storage set() is async, so we need to wait for it to finish
    // github.dev/electron-userland/electron-json-storage/blob/df4edce1e643e7343d962721fe2eacfeda094870/lib/storage.js#L419-L439
    fs.writeFileSync(
      path.resolve(pathToRestore, filename),
      JSON.stringify(settings, null, 2)
    );
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    // But, just in case, we'll wait for 1 millisecond :)
    await setTimeout(1);
  }
};

export { initJsonStorage, pathToRestore, createDefaultSettings };
export { JsonStorage, DatapathDoesNotExistError } from "../jsonStorage";
