import path from "path";
import os from "os";
import { app, BrowserWindow, ipcMain } from "electron";
import { setFileSaveAs } from "./setFileSaveAs";
import { createMenu } from "./createMenu";
import { setupStorage } from "./setupStorage";
import UserSetting from "./userSetting";
import { setTimeout } from "timers/promises";

const isDev = process.env.IS_DEV == "true" ? true : false;

function createWindow() {
  const userSetting = new UserSetting(app.getPath("userData"));
  console.log(userSetting.readSettings());

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: userSetting.readSettings().window.width,
    height: userSetting.readSettings().window.height,
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    // To avoid attempting to register the same handler due to re-create a window
    ipcMain.removeHandler("file-save-as");
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.once("browser-window-created", () => {
  console.log("browser-window-created");
  ipcMain.handle("setup-storage", async () => {
    await setTimeout(5000); // wait 5 seconds for testing

    return setupStorage(path.resolve(os.homedir(), "fragmemo"));
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
