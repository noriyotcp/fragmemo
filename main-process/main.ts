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
  console.log("browser-window-created");
  ipcMain.handle("update-snippet", async (event, props) => {
    console.info("Main process: update-snippet", {
      className: "Snippet",
      props,
    });
    await db.updateSnippet(props);
    return { status: true };
  });

  ipcMain.handle("update-fragment", async (event, data) => {
    console.info("Main process: update-fragment", {
      className: "Fragment",
      data,
    });
    await db.updateFragment(data);
    return { status: true };
  });

  ipcMain.handle("update-active-fragment", async (event, data) => {
    console.info("Main process: update-active-fragment", {
      className: "ActiveFragment",
      data,
    });
    await db.updateActiveFragment(data);
    return { status: true };
  });

  ipcMain.handle("get-snippet", async (event, snippetId) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snippet = db.objectForPrimaryKey("Snippet", snippetId)!;
    console.log("Main process: get-snippet", snippet.toJSON());
    return snippet.toJSON();
  });

  ipcMain.handle("get-fragment", (event, fragmentId) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fragment = db.objectForPrimaryKey("Fragment", fragmentId)!;
    console.log("Main process: get-fragment", fragment.toJSON());
    return fragment.toJSON();
  });

  ipcMain.handle("get-active-fragment", async (event, snippetId) => {
    const activeFragment = db
      .objects("ActiveFragment")
      .filtered(`snippetId = ${snippetId}`)[0];
    console.log("Main process: get-active-fragment", activeFragment.toJSON());
    return activeFragment.toJSON();
  });

  ipcMain.handle("show-context-menu", (event) => {
    const template: MenuItemConstructorOptions[] = [
      {
        label: "Delete fragment",
        type: "normal",
        id: "delete-fragment",
        click: () => {
          event.sender.send("context-menu-command", "delete-fragment");
        },
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(<PopupOptions>BrowserWindow.fromWebContents(event.sender));
  });

  ipcMain.handle(
    "delete-fragment",
    (event, ids: { fragmentId: number; nextActiveFragmentId: number }) => {
      db.deleteFragment(ids.fragmentId, ids.nextActiveFragmentId);
    }
  );

  ipcMain.handle("init-snippet", (event) => {
    db.initSnippet("");
  });

  ipcMain.handle("init-fragment", (event, snippetId) => {
    db.initFragment(snippetId);
  });

  ipcMain.handle("setup-storage", async () => {
    // await setTimeout(1000); // wait 1 seconds for testing

    db = new DB(`${app.getPath("userData")}/fragmemoDB/fragmemo.realm`);
    try {
      if (db.empty) {
        db.initLanguage();
        db.initSnippet("");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  ipcMain.handle("load-snippets", (event) => {
    if (!db) return;

    try {
      return loadSnippets(db);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  const loadSnippets = (db: DB): Snippet[] => {
    const snippets = db.reverseSortBy(
      "Snippet",
      "snippetUpdate.updatedAt"
    ) as unknown as Results<Snippet>;
    return snippets.toJSON();
  };

  ipcMain.handle("load-languages", (event) => {
    if (!db) return;

    return db.sortBy("Language", "_idx").toJSON();
  });

  ipcMain.handle("fetch-fragments", (event, snippetId) => {
    const fragments = db
      .objects("Fragment")
      .filtered(`snippet._id == ${snippetId}`) as unknown as Results<Fragment>;
    return fragments.toJSON();
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
