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

export const scanFiles = async (
  path: string
): Promise<import("fs").Dirent[]> => {
  const allDirents = await readdir(path, {
    withFileTypes: true,
  });
  // reject hidden files
  return allDirents.filter(
    (dirent) => dirent.isFile() && !/^\.+/.test(dirent.name)
  );
};

console.log(scanFiles(resolve(__dirname, "../test-fragmemo", "snippet-1")));
