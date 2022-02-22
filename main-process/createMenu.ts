import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import * as fs from "fs";

export const createMenu = (win: BrowserWindow): void => {
  const switchTab = [
    {
      label: "Switch Tab",
      submenu: [
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Shift+]",
          click: async () => {
            console.log("Next Tab");
          },
        },
        {
          label: "Previous Tab",
          accelerator: "CmdOrCtrl+Shift+[",
          click: async () => {
            console.log("Previous Tab");
          },
        },
      ],
    },
  ];

  const template: MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "New Snippet",
          accelerator: "CmdOrCtrl+N",
          click: async () => {
            win.webContents.send("new-snippet");
          },
        },
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
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: async () => {
            win.webContents.send("save-fragment");
            console.log("save");
          },
        },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { label: "Go", submenu: [...switchTab] },
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
            const elementName = "settings-element";
            win.webContents.send("open-settings", elementName);
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
