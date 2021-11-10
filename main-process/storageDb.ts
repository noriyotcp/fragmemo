import fs from "fs";
import path from "path";
import JSONdb from "simple-json-db";
import { scanDirectories, scanFiles } from "./scanStorage";

type dbDataType = {
  directory: string;
  fragments: string[];
};

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

  public async scanStorage(): Promise<dbDataType[]> {
    const directories = await scanDirectories(path.dirname(`${this.filePath}`));
    return await this.composeDbData(
      path.dirname(`${this.filePath}`),
      directories
    );
  }

  composeDbData = async (
    _path: fs.PathLike,
    directories: fs.Dirent[]
  ): Promise<dbDataType[]> => {
    return await Promise.all(
      directories.map(async (dir) => {
        return {
          directory: dir.name,
          fragments: await scanFiles(`${_path}/${dir.name}`).then((files) => {
            return files.map((file) => file.name);
          }),
        };
      })
    );
  };
}

class FileDoesNotExistError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export { StorageDB, FileDoesNotExistError };
