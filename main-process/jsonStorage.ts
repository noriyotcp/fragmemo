import fs from "fs";
import storage from "electron-json-storage";

export default class JsonStorage {
  lib: typeof storage;
  datapath: string;

  constructor(datapath: string) {
    JsonStorage.doesDatapathExist(datapath);
    this.lib = storage;
    this.lib.setDataPath(datapath);
    this.datapath = this.lib.getDataPath();
  }

  static doesDatapathExist(filePath: fs.PathLike): void {
    if (!fs.existsSync(filePath)) {
      throw new DatapathDoesNotExistError(`${filePath} does not exist`);
    }
  }
}

class DatapathDoesNotExistError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export { JsonStorage, DatapathDoesNotExistError };
