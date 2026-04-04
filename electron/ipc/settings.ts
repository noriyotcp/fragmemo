import { ipcMain, nativeTheme } from 'electron'
import { db } from '../db'
import { settings } from '../db/schema'
import { eq } from 'drizzle-orm'

export function registerSettingsHandlers() {
  ipcMain.handle('get-settings', async () => {
    const result = await db.select().from(settings).where(eq(settings.id, 'default')).get()

    if (!result) {
      // Create default settings if not exists
      const defaultSettings = {
        id: 'default',
        theme: 'system',
        editorFontSize: 14,
        editorFontFamily: 'monospace',
        autosave: true
      }
      await db.insert(settings).values(defaultSettings)
      return defaultSettings
    }

    return result
  })

  ipcMain.handle('update-settings', async (_, data: Partial<typeof settings.$inferInsert>) => {
    await db.update(settings).set(data).where(eq(settings.id, 'default'))

    // Apply theme change immediately
    if (data.theme) {
      nativeTheme.themeSource = data.theme as 'system' | 'light' | 'dark'
    }

    return db.select().from(settings).where(eq(settings.id, 'default')).get()
  })
}
