import { ipcMain } from 'electron'
import { db } from '../db'
import { snippets, fragments, fragmentStates } from '../db/schema'
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
    const result = await db.select({
      id: fragments.id,
      snippetId: fragments.snippetId,
      title: fragments.title,
      content: fragments.content,
      language: fragments.language,
      order: fragments.order,
      viewState: fragmentStates.viewState
    })
    .from(fragments)
    .leftJoin(fragmentStates, eq(fragments.id, fragmentStates.fragmentId))
    .where(eq(fragments.snippetId, snippetId))
    .orderBy(fragments.order)

    return result
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
        updatedAt: now
      }
    })

    // Update parent snippet's updatedAt to sync
    await db.update(snippets).set({ updatedAt: now }).where(eq(snippets.id, fragment.snippetId))

    return fragment
  })

  ipcMain.handle('update-fragment-state', async (_, fragmentId: string, viewState: any) => {
    await db.insert(fragmentStates)
      .values({ fragmentId, viewState, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: fragmentStates.fragmentId,
        set: { viewState, updatedAt: new Date() }
      })
  })

  ipcMain.handle('delete-fragment', async (_, id: string) => {
    await db.delete(fragments).where(eq(fragments.id, id))
    return id
  })
}
