import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const orders = sqliteTable('orders', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name'),
	status: text('status').default('pending'),
	createdAt: text('createdAt'),
});
