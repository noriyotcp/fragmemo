import fs from "fs";
export default class UserSetting {
  appPath: string;
  defaultSettings: any = {
    theme: "light",
  };
  settingsFile = `settings.json`;
  settingsFilePath: string;

  constructor(appPath: string) {
    this.appPath = appPath;
    this.settingsFilePath = `${this.appPath}/${this.settingsFile}`;
  }

  readSettings(): any {
    // if settings file doesn't exist, create it
    if (fs.existsSync(this.settingsFilePath)) {
      return JSON.parse(fs.readFileSync(this.settingsFilePath, "utf8"));
    } else {
      fs.writeFileSync(
        this.settingsFilePath,
        JSON.stringify(this.defaultSettings)
      );
      return JSON.parse(fs.readFileSync(this.settingsFilePath, "utf8"));
    }
  }
}
