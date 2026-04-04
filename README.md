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

If you see a `dlopen` architecture mismatch error (e.g. after running a cross-arch build like `npm run app:build:mac:x64` on an ARM Mac), rebuild the native module:

```bash
npm run rebuild
```

## License

MIT
