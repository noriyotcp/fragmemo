import fs from "fs";
import JSONdb from "simple-json-db";

class StorageDB extends JSONdb {
  constructor(filePath: string) {
    super(filePath);
    this.doesFileExist(filePath);
  }

  doesFileExist(filePath: fs.PathLike): void {
    if (!fs.existsSync(filePath)) {
      throw new FileDoesNotExistError(`${filePath} does not exist`);
    }
  }

  public isEmpty(): boolean {
    return !Object.keys(this.JSON()).length;
  }

  public update(primaryKey: string, secondaryKey: string, value: any): void {
    const clone: any = this.get(primaryKey);
    clone[secondaryKey] = value;
    this.set(primaryKey, clone);
  }
}

class FileDoesNotExistError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export { StorageDB, FileDoesNotExistError };
