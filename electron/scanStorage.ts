import { readdir } from "fs/promises";
import { resolve } from "path";

export const scanDirectories = async (
  path: string
): Promise<import("fs").Dirent[]> => {
  const allDirents = await readdir(path, {
    withFileTypes: true,
  });
  return allDirents.filter((dirent) => dirent.isDirectory());
};

console.log(scanDirectories(resolve(__dirname)));
