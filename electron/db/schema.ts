import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const snippets = sqliteTable('snippets', {
  id: text('id').primaryKey(),
  title: text('title'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  activeFragmentId: text('active_fragment_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const fragments = sqliteTable('fragments', {
  id: text('id').primaryKey(),
  snippetId: text('snippet_id').notNull().references(() => snippets.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content').notNull().default(''),
  language: text('language').notNull().default('plaintext'),
  order: integer('order').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const fragmentStates = sqliteTable('fragment_states', {
  fragmentId: text('fragment_id').primaryKey().references(() => fragments.id, { onDelete: 'cascade' }),
  viewState: text('view_state', { mode: 'json' }).$type<Record<string, unknown>>(), // JSON object of ICodeEditorViewState
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().default('default'),
  theme: text('theme').notNull().default('system'),
  editorFontSize: integer('editor_font_size').notNull().default(14),
  editorFontFamily: text('editor_font_family').notNull().default('monospace'),
  autosave: integer('autosave', { mode: 'boolean' }).notNull().default(true),
  exportPath: text('export_path'),
})

export const appState = sqliteTable('app_state', {
  id: text('id').primaryKey().default('default'),
  activeSnippetId: text('active_snippet_id'),
  activeFragmentId: text('active_fragment_id'),
  sidebarWidth: integer('sidebar_width').notNull().default(300),
  windowBounds: text('window_bounds', { mode: 'json' }).$type<{ x: number; y: number; width: number; height: number }>(),
})
