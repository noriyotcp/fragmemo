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
import { getWindowData, setWindowData } from "./settings/userSettings/window";
import {
  getEditorSettings,
  setEditorSettings,
} from "./settings/userSettings/editor";
import * as dbHandlers from "./dbHandlers";

const isDev = process.env.IS_DEV == "true" ? true : false;

function createWindow() {
  const { width, height, x, y } = getWindowData().window;
  console.log("window created", { width, height, x, y });
  const { autosave, afterDelay } = getEditorSettings().editor;
  console.log("editor settings", { autosave, afterDelay });
  setEditorSettings({
    editor: {
      autosave: false,
      afterDelay: 10000,
    },
  });

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
    const updatedWindowData = {
      window: {
        width: mainWindow.getSize()[0],
        height: mainWindow.getSize()[1],
        x: mainWindow.getPosition()[0],
        y: mainWindow.getPosition()[1],
      },
    };

    setWindowData(updatedWindowData);
  });

  mainWindow.on("move", () => {
    const updatedWindowData = {
      window: {
        width: mainWindow.getSize()[0],
        height: mainWindow.getSize()[1],
        x: mainWindow.getPosition()[0],
        y: mainWindow.getPosition()[1],
      },
    };

    setWindowData(updatedWindowData);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  (async () => {
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
    dbHandlers.setupStorage();
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
  // it takes a few seconds to load the new editor settings
  // so we'll call it at the end
  const { autosave, afterDelay } = getEditorSettings().editor;
  console.log("new editor settings", { autosave, afterDelay });

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
