import * as fs from "fs";

export const storageFound = (_path: fs.PathLike): string => {
  let msg = "";

  if (!fs.existsSync(_path)) {
    createStorage(_path);
    msg = `${_path} and ${_path}/.fragmemo created.`;
  } else {
    if (canUseAsStorage(_path)) {
      msg = `${_path} found.`;
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

  fs.writeFile(`${_path}/test.ts`, value, 'utf8', (err) => {
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
