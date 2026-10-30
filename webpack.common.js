const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

// Where the XBlock server runs (see server/). The server answers CORS for the extension's
// origin, so the manifest needs no host_permissions (adding one would disable the extension
// for existing users until they approve the new permission).
const API_URL = new URL(process.env.XBLOCK_API_URL || 'http://localhost:3000');


module.exports = {
  // Note: 
  // Chrome MV3 no longer allowed remote hosted code
  // Using module bundlers we can add the required code for your extension
  // Any modular script should be added as entry point
  entry: {
    popup: './src/popup/popup.js',
    options: './src/options/options.js',
    background: './src/background/background.js',
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new DefinePlugin({
      __XBLOCK_API_URL__: JSON.stringify(API_URL.origin),
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"] // This is script from entry point
    }),
    // Note: you can add as many new HtmlWebpackPlugin objects  
    // filename: being the html filename
    // chunks: being the script src
    // if the script src is modular then add it as the entry point above
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "options", "options.html"),
      filename: "options.html",
      chunks: ["options"] // This is script from entry point
    }),
    // Note: This is to copy any remaining files to bundler
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/_locales', to: '_locales' },
        { from: './src/background/background.js' },
        { from: './src/content/xdata.js' },
        { from: './src/content/xapi.js' },
        { from: './src/content/content.js' },
        { from: './src/content/samurai.js' },
        { from: './src/content/observer.js' },
        { from: './src/content/batch.js' },
        { from: './src/icons/*' },
        { from: './src/media/*' },
        { from: './src/css/*' }
      ],
    }),
  ],
  output: {
    // chrome load uppacked extension looks for files under dist/* folder
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
};