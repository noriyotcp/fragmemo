import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";

export const createMenu = (win: BrowserWindow): void => {
  const switchTab = [
    {
      label: "Switch Tab",
      submenu: [
        {
          label: "Next Tab",
          accelerator: "CmdOrCtrl+Shift+]",
          click: async () => {
            win.webContents.send("next-tab");
          },
        },
        {
          label: "Previous Tab",
          accelerator: "CmdOrCtrl+Shift+[",
          click: async () => {
            win.webContents.send("previous-tab");
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
          label: "New Fragment",
          accelerator: "CmdOrCtrl+T",
          click: async () => {
            win.webContents.send("new-fragment");
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
    {
      label: "Go",
      submenu: [
        {
          label: "Languages",
          accelerator: "CmdOrCtrl+L",
          click: async () => {
            win.webContents.send("select-language");
          },
        },
        { type: "separator" },
        ...switchTab,
      ],
    },
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
          click: async () => {
            win.webContents.send("toggle-settings");
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
