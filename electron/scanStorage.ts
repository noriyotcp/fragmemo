import { readdir } from "fs/promises";

const scanDirectories = async (
  path: string
): Promise<import("fs").Dirent[]> => {
  const allDirents = await readdir(path, {
    withFileTypes: true,
  });
  return allDirents.filter((dirent) => dirent.isDirectory());
};

const scanFiles = async (path: string): Promise<import("fs").Dirent[]> => {
  const allDirents = await readdir(path, {
    withFileTypes: true,
  });
  // reject hidden files
  return allDirents.filter(
    (dirent) => dirent.isFile() && !/^\.+/.test(dirent.name)
  );
};

export { scanDirectories, scanFiles };
