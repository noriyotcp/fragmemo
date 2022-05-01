import {
  initJsonStorage,
  createDefaultSettings,
  JsonStorage,
  DatapathDoesNotExistError,
} from "./initJsonStorage";

const initRestoreWindowStorage = async (): Promise<JsonStorage> => {
  return initJsonStorage("window.json")
    .then((storage) => {
      return Promise.resolve(storage);
    })
    .catch(async (error) => {
      if (error instanceof DatapathDoesNotExistError) {
        const defaultWindowSettings = {
          window: { width: 800, height: 600, x: 0, y: 0 },
        };
        await createDefaultSettings(defaultWindowSettings, "window.json");
        return initJsonStorage("window.json");
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
      return <WindowDataType>storage.lib.getSync("window");
    };
    setWindowData = (data) => {
      storage.lib.set(
        "window",
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
