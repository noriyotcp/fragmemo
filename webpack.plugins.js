const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = [new ForkTsCheckerWebpackPlugin(), new MonacoWebpackPlugin()];
