import * as fs from "fs";
import { StorageDB, FileDoesNotExistError } from "./storageDb";
import { createHash } from "crypto";
import { setupStorageResultType } from "src/@types/global";

const storageFile = "storage.json";

export const setupStorage = (_path: fs.PathLike): setupStorageResultType => {
  let setupStorageResult: setupStorageResultType;

  if (!fs.existsSync(_path)) {
    setupStorageResult = createStorage(_path);
  } else {
    setupStorageResult = refreshDB(_path);
  }

  return setupStorageResult;
};

const createTestFile = (_path: fs.PathLike) => {
  const value = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

  fs.writeFileSync(`${_path}/test.ts`, value, "utf8");
  console.log(`${_path} and ${_path}/test.ts created.`);
};

const createStorage = (_path: fs.PathLike): setupStorageResultType => {
  let [status, msg, snippets] = [false, "", {}];

  // create first snippet (directory)
  const createdDB = (): StorageDB => {
    const chars32 = createHash("md5").update(String(Date.now())).digest("hex");
    const chars40 = createHash("sha1").update(String(Date.now())).digest("hex");
    const snippetName = `${chars32}-${chars40}`;

    fs.mkdirSync(`${_path}/${snippetName}`);
    createTestFile(`${_path}/${snippetName}`);

    const db = new StorageDB(`${_path}/${storageFile}`);
    const obj = {
      [`${snippetName}`]: {
        fragments: ["test.ts"],
      },
    };
    db.JSON(obj);
    db.sync();
    return db;
  };

  fs.mkdirSync(_path);
  fs.writeFileSync(`${_path}/${storageFile}`, "", "utf8");

  [status, msg, snippets] = [true, `${_path} created.`, createdDB().JSON()];
  return { status, msg, snippets };
};

const refreshDB = (_path: fs.PathLike): setupStorageResultType => {
  let [status, msg, snippets] = [false, "", {}];

  try {
    const db = new StorageDB(`${_path}/${storageFile}`);
    const storageFound = `${_path} found.
${_path}/${storageFile}`;
    [status, msg, snippets] = [true, storageFound, refreshStorageDB(db).JSON()];
  } catch (error: unknown) {
    if (error instanceof FileDoesNotExistError) {
      console.error(error.name);
      console.error(error.message);
      [status, msg, snippets] = [false, error.message, {}];
    } else if (error instanceof Error) {
      [status, msg, snippets] = [false, error.message, {}];
    }
  }
  return { status, msg, snippets };
};

const refreshStorageDB = (db: StorageDB) => {
  db.scanStorage().then((objs) => {
    objs.forEach((obj) => {
      // Update DB's fragments only
      // https://github.com/nmaggioni/Simple-JSONdb/issues/9#issuecomment-859535922
      db.update(obj.directory, "fragments", obj.fragments);
    });
  });
  db.sync();
  return db;
};
