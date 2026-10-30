const { merge } = require('webpack-merge');

// Release builds talk to the deployed server unless told otherwise
process.env.XBLOCK_API_URL = process.env.XBLOCK_API_URL || 'https://xblock.nactio.com';

// Never ship a release that talks to the server over plain HTTP
if (!process.env.XBLOCK_API_URL.startsWith('https://')) {
  throw new Error('XBLOCK_API_URL must be an https:// URL for a release build');
}

const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

// Minified but not obfuscated: the Chrome Web Store rejects obfuscated code
module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: true,
        mangle: true,
        output: {
          comments: false,
        },
      },
      extractComments: false,
    })],
  },
});
