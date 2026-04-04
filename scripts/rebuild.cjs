const path = require('path');
const child = require('child_process');
const fs = require('fs');

// Rebuild better-sqlite3 for Electron
// https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/docs/troubleshooting.md#electron

// Get Electron version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
const electronVersion = packageJson.devDependencies.electron.replace(/^\^|~/, '');

const better_sqlite3 = require.resolve('better-sqlite3');
const better_sqlite3_root = path.posix.join(
  better_sqlite3.slice(0, better_sqlite3.lastIndexOf('node_modules')),
  'node_modules/better-sqlite3'
);

const cp = child.spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  [
    'run',
    'build-release',
    `--target=${electronVersion}`,
    '--dist-url=https://electronjs.org/headers',
  ],
  {
    cwd: better_sqlite3_root,
    stdio: 'inherit',
  }
);

cp.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Rebuild better-sqlite3 success.');
  } else {
    console.error('❌ Rebuild better-sqlite3 failed.');
  }
  process.exit(code);
});
