/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require("path");

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
  },
);

module.exports = {
  mode: "development",
  entry: {
    "editor": "monaco-editor/esm/vs/editor/editor.worker.js",
    "json": "monaco-editor/esm/vs/language/json/json.worker",
    "css": "monaco-editor/esm/vs/language/css/css.worker",
    "html": "monaco-editor/esm/vs/language/html/html.worker",
    "ts": "monaco-editor/esm/vs/language/typescript/ts.worker",
  },
  module: {
    rules,
  },
  output: {
    globalObject: "self",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
