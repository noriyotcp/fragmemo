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
${checkDB(_path).msg}`;
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

const checkDB = (_path: fs.PathLike): { status: boolean; msg: string } => {
  let [status, msg] = [false, ""];

  try {
    const db = new StorageDB(`${_path}/storage.json`);
    if (db.isEmpty()) {
      [status, msg] = [true, `${_path}/storage.json is empty`];
      return { status, msg };
    }
    refreshStorageDB(db, objsFromStorage(_path));
    [status, msg] = [true, `${_path}/storage.json`];
  } catch (error: unknown) {
    if (error instanceof FileDoesNotExistError) {
      console.error(error.name);
      console.error(error.message);
      [status, msg] = [false, error.message];
    } else if (error instanceof Error) {
      [status, msg] = [false, error.message];
    }
  }
  return { status, msg };
};

type objsFromStorageType = Promise<
  Promise<{
    directory: string;
    fragments: string[];
  }>[]
>;

const objsFromStorage = async (_path: fs.PathLike): objsFromStorageType => {
  const directories = await scanDirectories(`${_path}`);
  return directories.map(async (dir) => {
    return {
      directory: dir.name,
      fragments: await scanFiles(`${_path}/${dir.name}`).then((files) => {
        return files.map((file) => file.name);
      }),
    };
  });
};

const refreshStorageDB = (
  db: StorageDB,
  objsFromStorage: objsFromStorageType
) => {
  objsFromStorage.then((objs) => {
    objs.forEach((obj) => {
      // Update DB's fragments only
      // https://github.com/nmaggioni/Simple-JSONdb/issues/9#issuecomment-859535922
      obj.then((o) => {
        db.update(o.directory, "fragments", o.fragments);
      });
    });
  });
  db.sync();
};
