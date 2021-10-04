import path from "path";
import os from "os";
import { BrowserWindow, app, session, nativeTheme, ipcMain } from "electron";
import { searchDevtools } from "electron-search-devtools";
import { createMenu } from "./createMenu";
import { setFileSaveAs } from "./setFileSaveAs";
import { storageFound } from "./storageFound";

// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";

const isDev = process.env.NODE_ENV === "development";

/// #if DEBUG
const execPath =
  process.platform === "win32"
    ? "../node_modules/electron/dist/electron.exe"
    : "../node_modules/.bin/electron";

if (isDev) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("electron-reload")(__dirname, {
    electron: path.resolve(__dirname, execPath),
    forceHardReset: true,
    hardResetMethod: "exit",
  });
}
/// #endif

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    backgroundColor: "#1e1e1e",
    webPreferences: {
      preload: path.resolve("src", "preload.js"),
      // preload: path.join(__dirname, 'preload.js')
    },
  });

  nativeTheme.themeSource = "dark";

  createMenu(mainWindow);
  setFileSaveAs(mainWindow);

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
  mainWindow.loadFile("dist/index.html");
};

app.whenReady().then(async () => {
  if (isDev) {
    const devtools = await searchDevtools("REACT");
    if (devtools) {
      await session.defaultSession.loadExtension(devtools, {
        allowFileAccess: true,
      });
    }
  }

  createWindow();
});

app.once('browser-window-created', () => {
  console.log("browser-window-created");
  ipcMain.handle("storage-found", async () => {
    return storageFound(path.resolve(os.homedir(), "fragmemo"));
  });
})

// app.once("window-all-closed", () => app.quit());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.once("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
