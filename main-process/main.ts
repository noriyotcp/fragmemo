import path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { setFileSaveAs } from "./setFileSaveAs";
import { createMenu } from "./createMenu";
import { setupStorage } from "./setupStorage";
import { JsonStorage, DatapathDoesNotExistError } from "./jsonStorage";
import { setTimeout } from "timers/promises";
import DB from "./db/db";
import { createHash } from "node:crypto";
import fs from "fs";

const isDev = process.env.IS_DEV == "true" ? true : false;
let db: DB;
let jsonStorage: JsonStorage;

function windowSettingsReady(): void {
  try {
    jsonStorage = new JsonStorage(
      path.resolve(`${app.getPath("userData")}/fragmemoSettings/restore`)
    );
  } catch (error) {
    if (error instanceof DatapathDoesNotExistError) {
      fs.mkdirSync(
        path.resolve(`${app.getPath("userData")}/fragmemoSettings/restore`),
        { recursive: true }
      );
      const defaultWindowSettings = {
        window: { width: 800, height: 600, x: 0, y: 0 },
      };
      jsonStorage = new JsonStorage(
        path.resolve(`${app.getPath("userData")}/fragmemoSettings/restore`)
      );
      jsonStorage.lib.set("window", defaultWindowSettings, function (err) {
        if (err) {
          console.log(err);
        }
      });
    } else {
      throw error;
    }
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
  setFileSaveAs(mainWindow);

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

  mainWindow.on("close", () => {
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
    windowSettingsReady();
    await setTimeout(100);
    createWindow();
    app.on("activate", function () {
      // To avoid attempting to register the same handler due to re-create a window
      ipcMain.removeHandler("file-save-as");
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })().catch((err) => {
    console.info(err);
  });
});

app.once("browser-window-created", () => {
  console.log("browser-window-created");
  ipcMain.handle("setup-storage", async () => {
    await setTimeout(5000); // wait 5 seconds for testing

    db = new DB(`${app.getPath("userData")}/fragmemoDB/fragmemo.realm`);

    db.createSnippet(
      createHash("md5").update(String(Date.now())).digest("hex")
    );
    return setupStorage(db);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  db.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
