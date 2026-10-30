const { merge } = require('webpack-merge');

// dist/ is for local work only: it never talks to a deployed server. Store builds come
// from `npm run package` (webpack.production.js), which builds into release/build/.
const apiUrl = new URL(process.env.XBLOCK_API_URL || 'http://localhost:3000');
if (!['localhost', '127.0.0.1', '[::1]'].includes(apiUrl.hostname)) {
  throw new Error(`dist/ only talks to a local server, not ${apiUrl.origin}. Use npm run package for a release build.`);
}

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
});
