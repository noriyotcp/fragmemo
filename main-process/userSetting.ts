import fs from "fs";
import { StorageDB, FileDoesNotExistError } from "./storageDb";
export default class UserSetting {
  settingsPath: string;
  defaultSettings: any = {
    window: { width: 800, height: 600, x: 0, y: 0 },
    theme: "light",
  };
  jsonDbHandler!: StorageDB;

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    try {
      this.jsonDbHandler = new StorageDB(this.settingsPath);
    } catch (error) {
      if (error instanceof FileDoesNotExistError) {
        this.writeSettings(this.defaultSettings);
      }
    }
  }

  readSettings(): any {
    return JSON.parse(fs.readFileSync(this.settingsPath, "utf8"));
  }

  writeSettings(settings: any): void {
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings));
  }
}
