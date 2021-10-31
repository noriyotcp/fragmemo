import * as fs from "fs";
import { StorageDB, FileDoesNotExistError } from "./storageDb";
import { scanDirectories, scanFiles } from "./scanStorage";

export const setupStorage = (_path: fs.PathLike): string => {
  let msg = "";

  if (!fs.existsSync(_path)) {
    createStorage(_path);
    msg = `${_path} and ${_path}/.fragmemo created.`;
  } else {
    if (canUseAsStorage(_path)) {
      msg = `${_path} found.
${messageOnDbCheck(_path)}
`;
    } else {
      msg = `${_path} found but cannot be as storage.`;
    }
  }

  return msg;
};

const canUseAsStorage = (_path: fs.PathLike): boolean => {
  const dotfile = `${_path}/.fragmemo`;

  if (fs.existsSync(dotfile)) {
    return true;
  } else {
    return false;
  }
};

const createTestFile = (_path: fs.PathLike) => {
  const value = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

  fs.writeFile(`${_path}/test.ts`, value, "utf8", (err) => {
    if (err) return err;

    // msg = `${_path} and ${_path}/.fragmemo created.`;
    console.log(`${_path} and ${_path}/test.ts created.`);
  });
};

const createStorage = async (_path: fs.PathLike) => {
  fs.mkdir(_path, (err) => {
    if (err) return err;

    fs.writeFile(`${_path}/.fragmemo`, "", "utf8", (err) => {
      if (err) return err;
    });
    createTestFile(_path);
  });
};

const messageOnDbCheck = (_path: fs.PathLike): string => {
  try {
    const db = new StorageDB(`${_path}/storage.json`);
    if (db.isEmpty()) {
      return `${_path}/storage.json is empty`;
    }
    refreshStorageDB(db, _path);
    db.sync();
    return `${_path}/storage.json`;
  } catch (error: unknown) {
    if (error instanceof FileDoesNotExistError) {
      console.error(error.name);
      console.error(error.message);
      return error.message;
    } else {
      return "Error: somethig is wrong";
    }
  }
};

const refreshStorageDB = async (db: StorageDB, _path: fs.PathLike) => {
  const directories = await scanDirectories(`${_path}`);
  const objsFromStorage = directories.map(async (dir) => {
    return {
      directory: dir.name,
      fragments: await scanFiles(`${_path}/${dir.name}`).then((files) => {
        return files.map((file) => file.name);
      }),
    };
  });
  objsFromStorage.forEach((obj) => {
    // Update DB's fragments only
    // https://github.com/nmaggioni/Simple-JSONdb/issues/9#issuecomment-859535922
    obj.then((o) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const clone: any = db.get(o.directory)!;
      clone.fragments = o.fragments;
      db.set(o.directory, clone);
    });
  });
};
