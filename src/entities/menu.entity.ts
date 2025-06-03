import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const menuCategories = sqliteTable('menu_categories', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	imageUrl: text('image_url'),
});

export const menuItems = sqliteTable('menu_items', {
	id: integer('id').primaryKey(),
	categoryId: integer('category_id')
		.notNull()
		.references(() => menuCategories.id),
	name: text('name').notNull(),
	description: text('description'),
	price: real('price').notNull(),
	imageUrl: text('image_url'),
	available: integer('available').notNull().default(1), // SQLite boolean
});
