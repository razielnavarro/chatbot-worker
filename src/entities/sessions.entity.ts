import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	token: text('token').notNull().unique(),
	phone: text('phone').notNull(),
	state: text('state').notNull(),
	orderId: integer('order_id'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});
