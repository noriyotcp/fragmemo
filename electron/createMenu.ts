import {
  app,
  BrowserWindow,
  dialog,
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
                  text: buff.toString(),
                };
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

  const preferences = [
    {
      label: "Preferences…",
      submenu: [
        {
          label: "Settings",
          accelerator: "Command+,",
          click() {
            const message = "Preferences clicked";
            console.log(message);
            win.webContents.send("open-settings", message);
          },
        },
      ],
    },
  ];

  const appMenu: MenuItemConstructorOptions = {
    label: app.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      ...preferences,
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  };

  if (process.platform === "darwin") template.unshift(appMenu);

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
