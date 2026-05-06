import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(), // e.g., 'bkash_number', 'nagad_number'
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});
