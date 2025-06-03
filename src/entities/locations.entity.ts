import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const locations = sqliteTable('locations', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	address: text('address').notNull(),
	latitude: real('latitude').notNull(),
	longitude: real('longitude').notNull(),
	cashierPhone: text('cashier_phone').notNull(), // WhatsApp number for the cashier
	deliveryRadius: real('delivery_radius').notNull(), // in kilometers
	minimumOrder: real('minimum_order').notNull(),
	estimatedDeliveryTime: integer('estimated_delivery_time').notNull(), // in minutes
});
