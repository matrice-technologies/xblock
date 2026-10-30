// Zips dist/ into release/xblock-<version>.zip for the Chrome Web Store.
// Run through `npm run package`, which makes a release build first.
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const manifestPath = path.join(dist, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('dist/manifest.json not found, run the release build first');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const releaseDir = path.join(root, 'release');
const zipPath = path.join(releaseDir, `xblock-${manifest.version}.zip`);

// Source maps don't belong in the store package
const files = [];
(function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    else if (!entry.name.endsWith('.map')) files.push(fullPath);
  }
})(dist);

const zip = new AdmZip();
for (const file of files) {
  // manifest.json must sit at the root of the zip, with forward-slash paths
  const zipDir = path.relative(dist, path.dirname(file)).split(path.sep).join('/');
  zip.addLocalFile(file, zipDir);
}

fs.mkdirSync(releaseDir, { recursive: true });
zip.writeZip(zipPath);
console.log(`Packaged ${files.length} files, version ${manifest.version} -> ${path.relative(root, zipPath)}`);
