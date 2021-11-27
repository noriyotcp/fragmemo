import fs from "fs";
import path from "path";
import os from "os";
import JsonStorage from "../main-process/jsonStorage";

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

  describe("new JsonStorage()", () => {
    it("should an instance of JsonStorage", () => {
      fs.writeFileSync(
        `${tmpDir}/window.json`,
        JSON.stringify({
          window: {
            width: 1200,
            height: 900,
            x: 100,
            y: 100,
          },
        })
      );

      const jsonStorage = new JsonStorage(`${tmpDir}`);
      expect(jsonStorage).toBeInstanceOf(JsonStorage);
    });
  });

  // TODO: test settings file is empty
  xdescribe("Settings file is empty", () => {
    it("", () => {});
  });
});
