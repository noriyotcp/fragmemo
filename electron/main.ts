import { app, BrowserWindow, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db'
import { appState } from './db/schema'
import { eq } from 'drizzle-orm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../renderer')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['ELECTRON_RENDERER_URL']

function createApplicationMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu:open-settings')
          }
        },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Snippet',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu:new-snippet')
          }
        },
        { type: 'separator' as const },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send('menu:close-tab')
          }
        },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+Shift+W',
          role: 'close' as const
        },
        ...(!isMac ? [
          { type: 'separator' as const },
          { role: 'quit' as const }
        ] : [])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const }
      ]
    },
    {
      label: 'View',
      submenu: [
        ...(!isMac ? [{
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu:open-settings')
          }
        }, { type: 'separator' as const }] : []),
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function loadWindowBounds(): { x: number; y: number; width: number; height: number } | undefined {
  const row = db.select().from(appState).where(eq(appState.id, 'default')).get()
  return row?.windowBounds ?? undefined
}

function saveWindowBounds(bounds: { x: number; y: number; width: number; height: number }) {
  db.insert(appState)
    .values({ id: 'default', windowBounds: bounds })
    .onConflictDoUpdate({
      target: appState.id,
      set: { windowBounds: bounds },
    })
    .run()
}

function createWindow() {
  const savedBounds = loadWindowBounds()

  win = new BrowserWindow({
    ...(savedBounds ?? { width: 800, height: 600 }),
    icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  })

  // Save window bounds on resize and move
  let boundsTimer: ReturnType<typeof setTimeout> | null = null
  const persistBounds = () => {
    if (boundsTimer) clearTimeout(boundsTimer)
    boundsTimer = setTimeout(() => {
      if (win && !win.isDestroyed()) {
        saveWindowBounds(win.getBounds())
      }
    }, 300)
  }
  win.on('resize', persistBounds)
  win.on('move', persistBounds)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST || '', 'index.html'))
  }

  // Create application menu
  createApplicationMenu(win)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  // Run database migrations
  const { runMigrations } = await import('./db/migrate')
  runMigrations()

  // Register IPC handlers
  const { registerSnippetHandlers } = await import('./ipc/snippets')
  registerSnippetHandlers()
  const { registerSettingsHandlers } = await import('./ipc/settings')
  registerSettingsHandlers()
  const { registerAppStateHandlers } = await import('./ipc/app_state')
  registerAppStateHandlers()

  createWindow()
})
