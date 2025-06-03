import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const customers = sqliteTable('customers', {
	id: integer('id').primaryKey(),
	phoneNumber: text('phone_number').notNull().unique(),
	name: text('name'),
	lastOrderDate: integer('last_order_date', { mode: 'timestamp' }),
});
