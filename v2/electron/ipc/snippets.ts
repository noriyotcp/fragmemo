import { ipcMain } from 'electron'
import { db } from '../db'
import { snippets, fragments } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export function registerSnippetHandlers() {
  // Snippets
  ipcMain.handle('get-snippets', async () => {
    return db.select().from(snippets).orderBy(desc(snippets.updatedAt))
  })

  ipcMain.handle('create-snippet', async (_, title: string) => {
    const id = randomUUID()
    const fragmentId = randomUUID()

    const newSnippet = {
      id,
      title: title || 'Untitled Snippet',
      activeFragmentId: fragmentId,
      updatedAt: new Date(),
      createdAt: new Date(),
    }
    await db.insert(snippets).values(newSnippet)

    // Create default fragment
    await db.insert(fragments).values({
      id: fragmentId,
      snippetId: id,
      title: '',
      content: '',
      language: 'plaintext',
      order: 0
    })

    return newSnippet
  })

  ipcMain.handle('update-snippet', async (_, id: string, data: Partial<typeof snippets.$inferInsert>) => {
    await db.update(snippets).set({ ...data, updatedAt: new Date() }).where(eq(snippets.id, id))
    return db.select().from(snippets).where(eq(snippets.id, id)).get()
  })

  ipcMain.handle('delete-snippet', async (_, id: string) => {
    await db.delete(snippets).where(eq(snippets.id, id))
    return id
  })

  // Fragments
  ipcMain.handle('get-fragments', async (_, snippetId: string) => {
    return db.select().from(fragments).where(eq(fragments.snippetId, snippetId)).orderBy(fragments.order)
  })

  ipcMain.handle('save-fragment', async (_, fragment: typeof fragments.$inferInsert) => {
    const now = new Date()

    // Upsert fragment
    await db.insert(fragments).values(fragment).onConflictDoUpdate({
      target: fragments.id,
      set: {
        content: fragment.content,
        title: fragment.title,
        language: fragment.language,
        order: fragment.order,
        viewState: fragment.viewState
      }
    })

    // Update parent snippet's updatedAt
    await db.update(snippets).set({ updatedAt: now }).where(eq(snippets.id, fragment.snippetId))

    return fragment
  })

  ipcMain.handle('delete-fragment', async (_, id: string) => {
    await db.delete(fragments).where(eq(fragments.id, id))
    return id
  })
}
