import {
  initJsonStorage,
  createDefaultSettings,
  JsonStorage,
  DatapathDoesNotExistError,
} from "./initJsonStorage";

const keyname = "restoreWindow";
const filename = `${keyname}.json`;

const initRestoreWindowStorage = async (): Promise<JsonStorage> => {
  return initJsonStorage(filename)
    .then((storage) => {
      return Promise.resolve(storage);
    })
    .catch(async (error) => {
      if (error instanceof DatapathDoesNotExistError) {
        const defaultWindowSettings = {
          window: { width: 800, height: 600, x: 0, y: 0 },
        };
        await createDefaultSettings(defaultWindowSettings, filename);
        return initJsonStorage(filename);
      } else {
        return Promise.reject(error);
      }
    });
};

type WindowDataType = {
  window: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
};

let getWindowData: () => WindowDataType;
let setWindowData: (_: WindowDataType) => void;

// top-level await requires Compiler option 'module' of value 'nodenext' is unstable.
initRestoreWindowStorage()
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
