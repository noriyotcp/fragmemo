import fs from "fs";
import { StorageDB, FileDoesNotExistError } from "../main-process/storageDb";
import path from "path";
import os from "os";

describe("new StorageDB()", () => {
  const filePath = path.resolve(os.homedir(), "fragmemo", "storage.json");

  describe("Storage file does not exists", () => {
    jest
      .spyOn(fs, "existsSync")
      .mockImplementationOnce(() => false) as jest.SpyInstance;
    it("should throw an error", () => {
      expect(() => {
        new StorageDB(filePath);
      }).toThrowError(FileDoesNotExistError);
    });
  });

  describe("Storage file is empty", () => {
    jest
      .spyOn(fs, "existsSync")
      .mockImplementationOnce(() => true) as jest.SpyInstance;
    jest
      .spyOn(StorageDB.prototype, "JSON")
      .mockImplementationOnce((): Record<string, unknown> => {
        return {};
      });

    it("StorageDB.isEmpty() returns true", () => {
      const db = new StorageDB(filePath);
      expect(db.isEmpty()).toBe(true);
    });
  });

  describe("Storage file is NOT empty", () => {
    type JsonType = {
      posts: [];
    };
    jest
      .spyOn(fs, "existsSync")
      .mockImplementationOnce(() => true) as jest.SpyInstance;
    jest
      .spyOn(StorageDB.prototype, "JSON")
      .mockImplementationOnce((): JsonType => {
        return JSON.parse(`{"posts": []}`) as JsonType;
      });

    it("StorageDB.isEmpty() returns true", () => {
      const db = new StorageDB(filePath);
      expect(db.isEmpty()).toBe(false);
    });
  });
});
