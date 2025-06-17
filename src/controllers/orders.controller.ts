import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { orders, orderItems } from '../entities/orders.entity';
import { eq } from 'drizzle-orm';
import { Database } from '../db';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/orders.schema';

type Variables = {
	db: Database;
};

const ordersController = new Hono<{ Variables: Variables }>();

// Create order
ordersController.post('/', zValidator('json', createOrderSchema), async (c) => {
	const data = c.req.valid('json');
	const db = c.get('db');

	const now = new Date();
	const orderData = {
		...data,
		status: 'pending',
		paymentStatus: 'pending',
		createdAt: now,
		updatedAt: now,
	};

	const order = await db.insert(orders).values(orderData).returning();

	// Create order items
	const orderItemsData = data.items.map((item) => ({
		orderId: order[0].id,
		menuItemId: item.menuItemId,
		quantity: item.quantity,
		notes: item.notes,
		price: 0, // TODO: Get price from menu items
	}));

	await db.insert(orderItems).values(orderItemsData);

	return c.json(order[0], 201);
});

// Get order by ID
ordersController.get('/:id', async (c) => {
	const id = parseInt(c.req.param('id'));
	const db = c.get('db');

	const order = await db.query.orders.findFirst({
		where: (orders, { eq }) => eq(orders.id, id),
		with: {
			items: true,
		},
	});

	if (!order) {
		return c.json({ error: 'Order not found' }, 404);
	}

	return c.json(order);
});

// Get all orders
ordersController.get('/', async (c) => {
	const db = c.get('db');
	const allOrders = await db.query.orders.findMany({
		with: {
			items: true,
		},
	});
	return c.json(allOrders);
});

// Update order status
ordersController.patch('/:id/status', zValidator('json', updateOrderStatusSchema), async (c) => {
	const id = parseInt(c.req.param('id'));
	const { status } = c.req.valid('json');
	const db = c.get('db');

	const updatedOrder = await db
		.update(orders)
		.set({
			status,
			updatedAt: new Date(),
		})
		.where(eq(orders.id, id))
		.returning();

	if (!updatedOrder[0]) {
		return c.json({ error: 'Order not found' }, 404);
	}

	return c.json(updatedOrder[0]);
});

export { ordersController };
