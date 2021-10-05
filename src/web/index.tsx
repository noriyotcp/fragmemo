/* eslint-disable @typescript-eslint/ban-types */
/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";
import { App } from "./App";
import { initMonaco } from "./code-editor";
const { myAPI } = window;

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();

initMonaco();

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

const listener = (fileData: any) => {
    if (fileData.status === undefined) {
      return false;
    }

    if (!fileData.status) {
      alert(`ファイルが開けませんでした\n${fileData.message}`);
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const textarea = document.querySelector<HTMLTextAreaElement>("#text")!;
    textarea.value = fileData.text;
};

document.addEventListener("DOMContentLoaded", (): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const textarea = document.querySelector<HTMLTextAreaElement>("#text")!;
  myAPI.storageFound().then((msg: string) => {
    textarea.value = msg;
  });
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
document.querySelector<HTMLButtonElement>("#btn-save")!.addEventListener('click', () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const textarea = document.querySelector<HTMLTextAreaElement>("#text")!;
  myAPI.fileSaveAs(textarea.value);
});

myAPI.openByMenu((_e: Event, fileData: object) => listener(fileData));
