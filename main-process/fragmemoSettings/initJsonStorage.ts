import { app } from "electron";
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

export { initJsonStorage, pathToRestore };
export { JsonStorage, DatapathDoesNotExistError } from "../jsonStorage";
