import fs from "fs";
import path from "path";
import os from "os";
import {
  JsonStorage,
  DatapathDoesNotExistError,
} from "../main-process/jsonStorage";

describe("JsonStorage", () => {
  let tmpDir: string;
  beforeEach(() => {
    try {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-"));
    } catch (err) {
      throw new Error("Could not create tmp dir");
    }
  });
  afterEach(() => {
    try {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true });
      }
    } catch (e) {
      console.error(
        `An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. Error: ${e}`
      );
    }
  });

  describe("datapath does not exists", () => {
    jest
      .spyOn(fs, "existsSync")
      .mockImplementationOnce(() => false) as jest.SpyInstance;
    it("should throw an error", () => {
      expect(() => {
        new JsonStorage(`${tmpDir}`);
      }).toThrowError(DatapathDoesNotExistError);
    });
  });

  describe("new JsonStorage()", () => {
    it("should an instance of JsonStorage", () => {
      const jsonStorage = new JsonStorage(`${tmpDir}`);
      expect(jsonStorage).toBeInstanceOf(JsonStorage);
    });
  });
});
