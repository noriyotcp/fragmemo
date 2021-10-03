import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
} from "electron";

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

                win.webContents.send("menu-open", result.filePaths[0]);
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
