import { ipcMain } from 'electron'
import { db } from '../db'
import { appState } from '../db/schema'
import { eq } from 'drizzle-orm'

export function registerAppStateHandlers() {
  ipcMain.handle('get-app-state', async () => {
    const result = await db.select().from(appState).where(eq(appState.id, 'default')).get()

    if (!result) {
      // Create default app state if not exists
      const defaultState = {
        id: 'default',
        sidebarWidth: 300
      }
      await db.insert(appState).values(defaultState)
      return defaultState
    }

    return result
  })

  ipcMain.handle('update-app-state', async (_, data: Partial<typeof appState.$inferInsert>) => {
    // We use onConflictDoUpdate to handle both insert (if missing for some reason) and update
    // But since we control the ID 'default', upsert is easiest.
    // Actually, get-app-state ensures it exists. But safe to use upsert pattern or update.
    // Let's use simple update since we assume it exists after load, or insert if not.

    // Check if exists first to be safe, or just use insert on conflict update
    await db.insert(appState)
      .values({ id: 'default', ...data })
      .onConflictDoUpdate({
        target: appState.id,
        set: data
      })

    return db.select().from(appState).where(eq(appState.id, 'default')).get()
  })
}
