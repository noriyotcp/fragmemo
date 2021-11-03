import fs from "fs";
import path from "path";
import os from "os";
import UserSetting from "../main-process/userSetting";
import { StorageDB } from "../main-process/storageDb";

describe("new UserSetting()", () => {
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

  it("should an instance of UserSetting and returns appPath", () => {
    fs.writeFileSync(
      `${tmpDir}/settings.json`,
      JSON.stringify({
        theme: "custom",
        window: {
          width: 1200,
          height: 900,
          x: 100,
          y: 100,
        },
      })
    );

    const userSetting = new UserSetting(`${tmpDir}/settings.json`);
    expect(userSetting).toBeInstanceOf(UserSetting);
    expect(userSetting.jsonDbHandler).toBeInstanceOf(StorageDB);
    expect(userSetting.settingsPath).toBe(`${tmpDir}/settings.json`);
  });
});

describe("readSettings()", () => {
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

  describe("Settings file exists", () => {
    it("should return the settings", () => {
      fs.writeFileSync(
        `${tmpDir}/settings.json`,
        JSON.stringify({
          theme: "custom",
          window: {
            width: 1200,
            height: 900,
            x: 100,
            y: 100,
          },
        })
      );
      expect(new UserSetting(`${tmpDir}/settings.json`).readSettings()).toEqual(
        {
          theme: "custom",
          window: {
            width: 1200,
            height: 900,
            x: 100,
            y: 100,
          },
        }
      );
    });
  });

  describe("Settings file does not exists", () => {
    it("should return the default settings", () => {
      expect(new UserSetting(`${tmpDir}/settings.json`).readSettings()).toEqual(
        {
          theme: "light",
          window: {
            width: 800,
            height: 600,
            x: 0,
            y: 0,
          },
        }
      );
    });
  });
});

// TODO: test settings file is empty
xdescribe("Settings file is empty", () => {
  it("", () => {});
});
