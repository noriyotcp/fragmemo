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

  public update(primaryKey: string, secondaryKey: string, value: any): void {
    const clone: any = this.get(primaryKey);
    clone[secondaryKey] = value;
    this.set(primaryKey, clone);
  }

  scanStorage = async (): Promise<dbDataType[]> => {
    const directories = await scanDirectories(path.dirname(`${this.filePath}`));
    return await this.composeDbData(
      path.dirname(`${this.filePath}`),
      directories
    );
  };

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
