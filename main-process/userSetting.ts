import fs from "fs";
import { StorageDB } from "./storageDb";
type SettingsType = {
  window: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  theme: string;
};

export default class UserSetting {
  settingsPath: string;
  defaultSettings: SettingsType = {
    window: { width: 800, height: 600, x: 0, y: 0 },
    theme: "light",
  };
  jsonDbHandler!: StorageDB;

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    if (!fs.existsSync(settingsPath)) {
      this.writeSettings(this.defaultSettings);
    }
    this.jsonDbHandler = new StorageDB(this.settingsPath);
  }

  readSettings(): SettingsType {
    return JSON.parse(fs.readFileSync(this.settingsPath, "utf8"));
  }

  writeSettings(settings: SettingsType): void {
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings));
  }
}
