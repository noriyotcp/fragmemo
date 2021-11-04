import { BrowserWindow, dialog, ipcMain } from "electron";
import * as fs from "fs";

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
        title: "Save file as...",
        filters: [
          {
            name: "All Files",
            extensions: ["*"],
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
