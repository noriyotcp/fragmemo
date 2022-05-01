import { initSettingsStorage } from "./initSettingsStorage";

type WindowDataType = {
  window: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
};

const keyname = "restoreWindow";
const filename = `${keyname}.json`;
const defaultWindowSettings: WindowDataType = {
  window: { width: 800, height: 600, x: 0, y: 0 },
};

let getWindowData: () => WindowDataType;
let setWindowData: (_: WindowDataType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initSettingsStorage(filename, defaultWindowSettings)
  .then((storage) => {
    getWindowData = () => {
      return <WindowDataType>storage.lib.getSync(keyname);
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
