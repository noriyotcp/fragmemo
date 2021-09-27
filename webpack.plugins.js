/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = [
  new CleanWebpackPlugin({
    verbose: true,
    cleanOnceBeforeBuildPatterns: [
      path.join(process.cwd(), ".webpack/**/*"),
      path.join(process.cwd(), "dist/**/*"),
    ],
  }),
  new ForkTsCheckerWebpackPlugin(),
  new MonacoWebpackPlugin(),
];

