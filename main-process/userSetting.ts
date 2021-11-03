import fs from "fs";
export default class UserSetting {
  settingsPath: string;
  defaultSettings: any = {
    window: { width: 800, height: 600, x: 0, y: 0 },
    theme: "light",
  };

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
  }

  readSettings(): any {
    // if settings file doesn't exist, create it
    if (fs.existsSync(this.settingsPath)) {
      return JSON.parse(fs.readFileSync(this.settingsPath, "utf8"));
    } else {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.defaultSettings));
      return JSON.parse(fs.readFileSync(this.settingsPath, "utf8"));
    }
  }
}
