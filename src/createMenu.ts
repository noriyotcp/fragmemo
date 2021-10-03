import {
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import * as fs from "fs";

export const createMenu = (win: BrowserWindow): void => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            dialog
              .showOpenDialog(win, {
                properties: ["openFile", "showHiddenFiles"],
                title: "ファイルを選択する",
                filters: [
                  {
                    name: "All Files",
                    extensions: ["*"],
                  },
                ],
              })
              .then((result) => {
                if (result.canceled) {
                  return;
                }

                const path = result.filePaths[0];
                const buff = fs.readFileSync(path);
                const fileData = {
                  status: true,
                  path: path,
                  text: buff.toString()
                }
                win.webContents.send("open-by-menu", fileData);
              })
              .catch((err) => console.log(`Error: ${err}`));
          },
        },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    { role: "help", submenu: [{ role: "about" }] },
  ];

  if (process.platform === "darwin") template.unshift({ role: "appMenu" });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

export const setFileSaveAs = (win: BrowserWindow): void => {
  ipcMain.handle("file-save-as", async (event, fileData) => {
    return dialog
      .showSaveDialog(win, {
        properties: [
          "showHiddenFiles",
          "createDirectory",
          "treatPackageAsDirectory",
          "showOverwriteConfirmation",
        ],
        title: "ファイルを保存する",
        filters: [
          {
            name: "Text",
            extensions: ["txt", "text"],
          },
        ],
      })
      .then((result) => {
        if (result.canceled) return;
        const path = <fs.PathOrFileDescriptor>result.filePath;
        fs.writeFileSync(path, fileData);
      })
      .catch((err) => console.log(`Error: ${err}`));
  });
};
