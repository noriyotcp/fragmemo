import storage from "electron-json-storage";

export default class JsonStorage {
  lib: typeof storage;
  datapath: string;

  constructor(datapath: string) {
    this.lib = storage;
    this.lib.setDataPath(datapath);
    this.datapath = this.lib.getDataPath();
  }
}
