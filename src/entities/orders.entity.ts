import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { customers } from './customers.entity';
import { locations } from './locations.entity';
import { menuItems } from './menu.entity';

export const orders = sqliteTable('orders', {
	id: integer('id').primaryKey(),
	customerId: integer('customer_id')
		.notNull()
		.references(() => customers.id),
	locationId: integer('location_id')
		.notNull()
		.references(() => locations.id),
	status: text('status').notNull(), // pending, confirmed, preparing, delivering, completed, cancelled
	orderType: text('order_type').notNull(), // delivery, pickup
	deliveryAddress: text('delivery_address'),
	deliveryLatitude: real('delivery_latitude'),
	deliveryLongitude: real('delivery_longitude'),
	deliveryDetails: text('delivery_details'), // apartment number, instructions, etc.
	deliveryFee: real('delivery_fee'),
	subtotal: real('subtotal').notNull(),
	total: real('total').notNull(),
	paymentMethod: text('payment_method'), // cash, card, yappy
	paymentStatus: text('payment_status').notNull(), // pending, paid
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const orderItems = sqliteTable('order_items', {
	id: integer('id').primaryKey(),
	orderId: integer('order_id')
		.notNull()
		.references(() => orders.id),
	menuItemId: integer('menu_item_id')
		.notNull()
		.references(() => menuItems.id),
	quantity: integer('quantity').notNull(),
	price: real('price').notNull(), // price at time of order
	notes: text('notes'),
});
