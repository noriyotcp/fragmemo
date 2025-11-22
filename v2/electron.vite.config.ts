import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import type { Plugin, UserConfig } from 'vite'

const require = createRequire(import.meta.url)

// Custom plugin to handle better-sqlite3 native binding
function bindingSqlite3(options: {
  output?: string
  better_sqlite3_node?: string
} = {}): Plugin {
  const TAG = '[vite-plugin-binding-sqlite3]'
  options.output ??= 'out/native'
  options.better_sqlite3_node ??= 'better_sqlite3.node'

  return {
    name: 'vite-plugin-binding-sqlite3',
    config(config: UserConfig) {
      const resolvedRoot = path.resolve(config.root || process.cwd())
      const output = path.resolve(resolvedRoot, options.output!)
      const better_sqlite3 = require.resolve('better-sqlite3')
      const better_sqlite3_root = path.join(
        better_sqlite3.slice(0, better_sqlite3.lastIndexOf('node_modules')),
        'node_modules/better-sqlite3'
      )
      const better_sqlite3_node = path.join(
        better_sqlite3_root,
        'build/Release',
        options.better_sqlite3_node!
      )
      const better_sqlite3_copy = path.join(output, options.better_sqlite3_node!)

      if (!fs.existsSync(better_sqlite3_node)) {
        throw new Error(`${TAG} Cannot find "${better_sqlite3_node}".`)
      }
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true })
      }
      fs.copyFileSync(better_sqlite3_node, better_sqlite3_copy)

      // Store binding path in env
      const BETTER_SQLITE3_BINDING = better_sqlite3_copy.replace(resolvedRoot + '/', '')
      fs.writeFileSync(
        path.join(resolvedRoot, '.env'),
        `VITE_BETTER_SQLITE3_BINDING=${BETTER_SQLITE3_BINDING}\n`
      )

      console.log(TAG, `binding to ${BETTER_SQLITE3_BINDING}`)
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bindingSqlite3()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer')
      }
    },
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    plugins: [react()]
  }
})
