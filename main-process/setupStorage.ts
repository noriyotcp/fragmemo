import * as fs from "fs";
import { StorageDB, FileDoesNotExistError } from "./storageDb";
import { createHash } from "crypto";
import { setupStorageResultType } from "src/@types/global";

export const setupStorage = (_path: fs.PathLike): setupStorageResultType => {
  let setupStorageResult: { status: boolean; msg: string };

  if (!fs.existsSync(_path)) {
    setupStorageResult = createStorage(_path);
  } else {
    if (canUseAsStorage(_path)) {
      setupStorageResult = refreshDB(_path);
    } else {
      setupStorageResult = {
        status: false,
        msg: `${_path} found but cannot be as storage.`,
      };
    }
  }

  return setupStorageResult;
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

const createStorage = (
  _path: fs.PathLike
): { status: boolean; msg: string } => {
  let [status, msg] = [false, ""];

  const returnError = (err: NodeJS.ErrnoException) => {
    [status, msg] = [false, err.message];
    return err;
  };

  fs.mkdir(_path, (err) => {
    if (err) returnError(err);

    fs.writeFile(`${_path}/.fragmemo`, "", "utf8", (err) => {
      if (err) returnError(err);
    });
    // create an emptry storage.json
    fs.writeFile(`${_path}/storage.json`, "", "utf8", (err) => {
      if (err) returnError(err);
    });
    // create first snippet (directory)
    const chars32 = createHash("md5").update(String(Date.now())).digest("hex");
    const chars40 = createHash("sha1").update(String(Date.now())).digest("hex");
    const snippetName = `${chars32}-${chars40}`;
    fs.mkdir(`${_path}/${snippetName}`, (err) => {
      if (err) returnError(err);
      createTestFile(`${_path}/${snippetName}`);

      const db = new StorageDB(`${_path}/storage.json`);
      const obj = {
        [`${snippetName}`]: {
          fragments: ["test.ts"],
        },
      };
      db.JSON(obj);
      db.sync();
    });
  });
  [status, msg] = [true, `${_path} and ${_path}/.fragmemo created.`];
  return { status, msg };
};

const refreshDB = (_path: fs.PathLike): { status: boolean; msg: string } => {
  let [status, msg] = [false, ""];

  try {
    const db = new StorageDB(`${_path}/storage.json`);
    refreshStorageDB(db);
    const storageFound = `${_path} found.
${_path}/storage.json`;
    [status, msg] = [true, storageFound];
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

const refreshStorageDB = (db: StorageDB) => {
  db.dataForDB().then((objs) => {
    objs.forEach((obj) => {
      // Update DB's fragments only
      // https://github.com/nmaggioni/Simple-JSONdb/issues/9#issuecomment-859535922
      db.update(obj.directory, "fragments", obj.fragments);
    });
  });
  db.sync();
};
