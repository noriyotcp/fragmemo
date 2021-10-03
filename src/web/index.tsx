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
const { myAPI } = window;

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();

import * as monaco from "monaco-editor";

const value = `var num: number = 123;
function identity(num: number): number {
    return num;
}`;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
monaco.editor.create(document.getElementById("monaco-container")!, {
  theme: "vs-dark",
  value: value,
  language: "typescript",
  automaticLayout: true,
});

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

const text = document.getElementById("text");

const listener = (filepath: string) => {
  if (text) text.textContent = filepath;
  console.log(filepath)
};

myAPI.openByMenu((_e: Event, filepath: string) => listener(filepath));
