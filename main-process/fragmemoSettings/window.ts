import { initSettingsStorage } from "./initSettingsStorage";

type WindowDataType = {
  width: number;
  height: number;
  x: number;
  y: number;
};

const keyname = "restoreWindow";
const filename = `${keyname}.json`;
const defaultSettings: WindowDataType = {
  width: 800,
  height: 600,
  x: 0,
  y: 0,
};

let getWindowData: () => WindowDataType;
let setWindowData: (_: WindowDataType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initSettingsStorage(filename, defaultSettings)
  .then((storage) => {
    getWindowData = () => {
      const windowSettings = <WindowDataType>storage.lib.getSync(keyname);
      // Merge and override default settings with the stored settings
      return { ...defaultSettings, ...windowSettings };
    };
    setWindowData = (data) => {
      storage.lib.set(
        keyname,
        data,
        { prettyPrinting: true },
        function (error) {
          if (error) {
            console.error(error);
            throw error;
          }
        }
      );
    };
  })
  .catch((error) => {
    throw error;
  });

export { getWindowData, setWindowData };
