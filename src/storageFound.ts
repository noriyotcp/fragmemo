import * as fs from "fs";

export const storageFound = (_path: fs.PathLike): string => {
  let msg = "";
  if (fs.existsSync(_path)) {
    msg = `${_path} found.`;
  } else {
    msg = `${_path} not found.`;
  }
  return msg;
};
