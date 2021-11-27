import fs from "fs";
import storage from "electron-json-storage";
import os from "os";

export default class JsonStorage {
  lib: typeof storage;
  datapath: string;

  constructor(datapath: string) {
    this.doesFileExist(datapath);
    this.lib = storage;
    this.lib.setDataPath(datapath);
    this.datapath = this.lib.getDataPath();
  }

  doesFileExist(filePath: fs.PathLike): void {
    if (!fs.existsSync(filePath)) {
      throw new FileDoesNotExistError(`${filePath} does not exist`);
    }
  }
}

class FileDoesNotExistError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export { JsonStorage, FileDoesNotExistError };
