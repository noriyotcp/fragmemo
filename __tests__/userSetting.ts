import fs from "fs";
import path from "path";
import os from "os";
import UserSetting from "../main-process/userSetting";
import { StorageDB } from "../main-process/storageDb";

describe("UserSetting", () => {
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

  describe("new UserSetting()", () => {
    it("should an instance of UserSetting and returns appPath", () => {
      fs.writeFileSync(
        `${tmpDir}/settings.json`,
        JSON.stringify({
          window: {
            width: 1200,
            height: 900,
            x: 100,
            y: 100,
          },
          storagePath: "path/to/storage",
        })
      );

      const userSetting = new UserSetting(`${tmpDir}/settings.json`);
      expect(userSetting).toBeInstanceOf(UserSetting);
      expect(userSetting.jsonDbHandler).toBeInstanceOf(StorageDB);
      expect(userSetting.settingsPath).toBe(`${tmpDir}/settings.json`);
    });
  });

  describe("readSettings()", () => {
    it("should return the settings", () => {
      fs.writeFileSync(
        `${tmpDir}/settings.json`,
        JSON.stringify({
          window: {
            width: 1200,
            height: 900,
            x: 100,
            y: 100,
          },
          storagePath: "path/to/storage",
        })
      );
      expect(new UserSetting(`${tmpDir}/settings.json`).readSettings()).toEqual(
        {
          window: {
            width: 1200,
            height: 900,
            x: 100,
            y: 100,
          },
          storagePath: "path/to/storage",
        }
      );
    });
  });

  // TODO: test settings file is empty
  xdescribe("Settings file is empty", () => {
    it("", () => {});
  });
});
