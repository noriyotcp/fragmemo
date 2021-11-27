import fs from "fs";
import JSONdb from "simple-json-db";

class StorageDB extends JSONdb {
  filePath: string;
  constructor(filePath: string) {
    super(filePath);
    this.doesFileExist(filePath);
    this.filePath = filePath;
  }

  doesFileExist(filePath: fs.PathLike): void {
    if (!fs.existsSync(filePath)) {
      throw new FileDoesNotExistError(`${filePath} does not exist`);
    }
  }

  public isEmpty(): boolean {
    return !Object.keys(this.JSON()).length;
  }

  public update(
    primaryKey: string,
    secondaryKey: string,
    value: unknown
  ): void {
    // If primary key is not found, create it with secondary key and value
    const clone: any =
      this.get(primaryKey) ??
      (() => {
        this.set(primaryKey, { [secondaryKey]: value });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.get(primaryKey)!;
      })();
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
