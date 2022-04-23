import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  PopupOptions,
} from "electron";
import { createMenu } from "./createMenu";
import { JsonStorage, DatapathDoesNotExistError } from "./jsonStorage";
import { setTimeout } from "timers/promises";
import DB from "./db/db";
import * as dbHandlers from "./dbHandlers";
// import { createHash } from "node:crypto";
import fs from "fs";

import { Fragment, Snippet } from "./db/realm";
import { Results } from "realm";

const isDev = process.env.IS_DEV == "true" ? true : false;
let db: DB;
let jsonStorage: JsonStorage;

async function createWindowSettings(): Promise<void> {
  const pathToRestore = `${app.getPath("userData")}/fragmemoSettings/restore`;

  try {
    jsonStorage = new JsonStorage(pathToRestore);
  } catch (error) {
    if (error instanceof DatapathDoesNotExistError) {
      fs.mkdirSync(pathToRestore, { recursive: true });
      jsonStorage = new JsonStorage(pathToRestore);
      const defaultWindowSettings = {
        window: { width: 800, height: 600, x: 0, y: 0 },
      };
      // Use fs.writeFileSync instead of electron-json-storage set()
      // electron-json-storage set() is async, so we need to wait for it to finish
      // github.dev/electron-userland/electron-json-storage/blob/df4edce1e643e7343d962721fe2eacfeda094870/lib/storage.js#L419-L439
      fs.writeFileSync(
        path.resolve(pathToRestore, "window.json"),
        JSON.stringify(defaultWindowSettings)
      );
    } else {
      throw error;
    }
  } finally {
    // But, just in case, we'll wait for 1 millisecond :)
    await setTimeout(1);
  }
}

function createWindow() {
  type settingsDataType = {
    window: {
      width: number;
      height: number;
      x: number;
      y: number;
    };
  };

  const data = <settingsDataType>jsonStorage.lib.getSync("window");
  const { width, height, x, y } = data.window;
  console.log("window created", data.window);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: x,
    y: y,
    backgroundColor: "#1e1e1e",
    webPreferences: {
      // preload: path.resolve("electron", "preload.js"),
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
    },
  });

  createMenu(mainWindow);

  // and load the index.html of the app.
  // win.loadFile("index.html");
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: "detach",
      activate: false,
    });
  }

  mainWindow.on("resize", () => {
    const updatedWindowSettings = {
      window: {
        width: mainWindow.getSize()[0],
        height: mainWindow.getSize()[1],
        x: mainWindow.getPosition()[0],
        y: mainWindow.getPosition()[1],
      },
    };

    jsonStorage.lib.set("window", updatedWindowSettings, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });

  mainWindow.on("move", () => {
    const updatedWindowSettings = {
      window: {
        width: mainWindow.getSize()[0],
        height: mainWindow.getSize()[1],
        x: mainWindow.getPosition()[0],
        y: mainWindow.getPosition()[1],
      },
    };

    jsonStorage.lib.set("window", updatedWindowSettings, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  (async () => {
    await createWindowSettings();
    createWindow();
    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })().catch((err) => {
    console.info(err);
  });
});

app.once("browser-window-created", () => {
  ipcMain.handle("update-snippet", (event, props) => {
    dbHandlers.updateSnippet(props);
  });

  ipcMain.handle("update-fragment", async (event, props) => {
    return dbHandlers.updateFragment(props);
  });

  ipcMain.handle("update-active-fragment", async (event, props) => {
    return dbHandlers.updateActiveFragment(props);
  });

  ipcMain.handle("get-snippet", async (event, snippetId) => {
    return dbHandlers.getSnippet(snippetId);
  });

  ipcMain.handle("get-fragment", (event, fragmentId) => {
    return dbHandlers.getFragment(fragmentId);
  });

  ipcMain.handle("get-active-fragment", (event, snippetId) => {
    return dbHandlers.getActiveFragment(snippetId);
  });

  ipcMain.handle("show-context-menu-on-fragment-tab", (event) => {
    const template: MenuItemConstructorOptions[] = [
      {
        label: "Delete fragment",
        type: "normal",
        id: "delete-fragment",
        click: () => {
          event.sender.send(
            "context-menu-command-fragment-tab",
            "delete-fragment"
          );
        },
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(<PopupOptions>BrowserWindow.fromWebContents(event.sender));
  });

  ipcMain.handle("show-context-menu-on-snippet-item", (event) => {
    const template: MenuItemConstructorOptions[] = [
      {
        label: "Delete snippet",
        type: "normal",
        id: "delete-snippet",
        click: () => {
          event.sender.send(
            "context-menu-command-snippet-item",
            "delete-snippet"
          );
        },
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(<PopupOptions>BrowserWindow.fromWebContents(event.sender));
  });

  ipcMain.handle("delete-fragment", (event, ids) => {
    dbHandlers.deleteFragment(ids);
  });

  ipcMain.handle("delete-snippet", (event, snippetId) => {
    dbHandlers.deleteSnippet(snippetId);
  });

  ipcMain.handle("init-snippet", (event) => {
    return dbHandlers.initSnippet();
  });

  ipcMain.handle("init-fragment", (event, snippetId) => {
    dbHandlers.initFragment(snippetId);
  });

  ipcMain.handle("setup-storage", async () => {
    // await setTimeout(1000); // wait 1 seconds for testing
    db = dbHandlers.setupStorage();
  });

  ipcMain.handle("load-snippets", (event) => {
    return dbHandlers.loadSnippets();
  });

  ipcMain.handle("load-languages", (event) => {
    return dbHandlers.loadLanguages();
  });

  ipcMain.handle("load-fragments", (event, snippetId) => {
    return dbHandlers.loadFragments(snippetId);
  });

  ipcMain.handle("new-active-snippet-history", (event, snippetId) => {
    dbHandlers.newActiveSnippetHistory(snippetId);
  });

  ipcMain.handle("get-latest-active-snippet-history", (event) => {
    return dbHandlers.getLatestActiveSnippetHistory();
  });
});

app.on("will-quit", () => {
  dbHandlers.onWillQuit();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
