import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { customers } from './customers.entity';

export const conversations = sqliteTable('conversations', {
	id: integer('id').primaryKey(),
	customerId: integer('customer_id')
		.notNull()
		.references(() => customers.id),
	state: text('state').notNull(), // greeting, selecting_type, awaiting_address, selecting_items, etc.
	temporaryData: text('temporary_data'), // JSON string for storing temporary conversation data
	lastMessageAt: integer('last_message_at', { mode: 'timestamp' }).notNull(),
	cartId: text('cart_id'), // Reference to frontend cart
});
