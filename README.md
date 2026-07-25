# fragmemo

> **⚠️ WIP** — This project is in active development and is not yet ready for general use.

A snippet management tool built with Electron.

## Tech Stack

- Electron 39 + React 19 + TypeScript
- Monaco Editor
- SQLite (better-sqlite3 + Drizzle ORM)
- electron-vite + Tailwind CSS

## Development

```bash
npm install
npm run dev
```

### Native module rebuild

This project uses `better-sqlite3`, which includes a native Node addon. `npm install` automatically rebuilds it for Electron via the `postinstall` hook.

Rebuild the native module explicitly when either of these happens:

```bash
npm run rebuild
```

- A `dlopen` architecture mismatch error, e.g. after a cross-arch build like `npm run app:build:mac:x64` on an ARM Mac. Pass `-- --arch x64` (or `arm64`) to build for a specific architecture; without it the host architecture is used.
- `npm run build` fails with `[vite-plugin-binding-sqlite3] Cannot find .../build/Release/better_sqlite3.node`. The `postinstall` hook does not always leave that file behind — better-sqlite3 v13 ships `prebuilds/` instead — and only `npm run rebuild` produces it. The Build workflow runs this step for the same reason.

## License

MIT
