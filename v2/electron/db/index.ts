import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as schema from './schema'

// Polyfill for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(app.getPath('userData'), 'fragmemo.db')
// __dirname is out/main or out/main/chunks
// We need to find out/native
// Split by 'out/main' to get the root path
const rootDir = __dirname.split(`${path.sep}out${path.sep}main`)[0]
const bindingPath = path.join(rootDir, 'out', 'native', path.basename(import.meta.env.VITE_BETTER_SQLITE3_BINDING))

// Use nativeBinding option to specify the path to better_sqlite3.node
const sqlite = new Database(dbPath, { nativeBinding: bindingPath })

export const db = drizzle(sqlite, { schema })

console.log('Database initialized at:', dbPath)
