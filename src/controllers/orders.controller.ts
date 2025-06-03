import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { orders } from '../entities';
import { Env } from '../common/types';
import { orderSchema } from '../schemas/orders.schema';
import { apiKeyMiddleware } from '../middleware';
import { eq } from 'drizzle-orm';

export const orderController = new Hono<Env>();

// Create new order
orderController.post('/', apiKeyMiddleware, async (c) => {
	const db = drizzle(c.env.DB);
	const data = await c.req.json();
	const parsed = orderSchema.safeParse(data);

	if (!parsed.success) {
		return c.json({ error: parsed.error }, 400);
	}

	const createdAt = new Date().toISOString();
	const [record] = await db
		.insert(orders)
		.values({ ...parsed.data, createdAt })
		.returning();

	return c.json({ record });
});

// Get all orders
orderController.get('/', apiKeyMiddleware, async (c) => {
	const db = drizzle(c.env.DB);
	const allOrders = await db.select().from(orders);
	return c.json({ orders: allOrders });
});

// Update order status
orderController.patch('/:id', apiKeyMiddleware, async (c) => {
	const db = drizzle(c.env.DB);
	const id = Number(c.req.param('id'));
	const { status } = await c.req.json();

	if (!status) {
		return c.json({ error: 'Missing status' }, 400);
	}

	const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();

	return c.json({ updated });
});

export default orderController;
