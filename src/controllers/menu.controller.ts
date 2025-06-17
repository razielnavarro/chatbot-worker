import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { menuItems, menuCategories } from '../entities/menu.entity';
import { eq } from 'drizzle-orm';
import { Database } from '../db';
import { createCategorySchema, createMenuItemSchema, updateMenuItemSchema } from '../schemas/menu.schema';

type Variables = {
	db: Database;
};

const menuController = new Hono<{ Variables: Variables }>();

// Create menu category
menuController.post('/categories', zValidator('json', createCategorySchema), async (c) => {
	const data = c.req.valid('json');
	const db = c.get('db');
	const category = await db.insert(menuCategories).values(data).returning();
	return c.json(category[0], 201);
});

// Create menu item
menuController.post('/items', zValidator('json', createMenuItemSchema), async (c) => {
	const data = c.req.valid('json');
	const db = c.get('db');
	const menuItem = await db
		.insert(menuItems)
		.values({
			...data,
			available: data.available ? 1 : 0,
		})
		.returning();
	return c.json(menuItem[0], 201);
});

// Get menu item by ID
menuController.get('/items/:id', async (c) => {
	const id = parseInt(c.req.param('id'));
	const db = c.get('db');
	const menuItem = await db.query.menuItems.findFirst({
		where: (menuItems, { eq }) => eq(menuItems.id, id),
		with: {
			category: true,
		},
	});

	if (!menuItem) {
		return c.json({ error: 'Menu item not found' }, 404);
	}

	return c.json({
		...menuItem,
		available: Boolean(menuItem.available),
	});
});

// Get all menu items
menuController.get('/items', async (c) => {
	const db = c.get('db');
	const allMenuItems = await db.query.menuItems.findMany({
		with: {
			category: true,
		},
	});
	return c.json(
		allMenuItems.map((item) => ({
			...item,
			available: Boolean(item.available),
		}))
	);
});

// Get all categories
menuController.get('/categories', async (c) => {
	const db = c.get('db');
	const allCategories = await db.query.menuCategories.findMany({
		with: {
			items: true,
		},
	});
	return c.json(
		allCategories.map((category) => ({
			...category,
			items: category.items.map((item) => ({
				...item,
				available: Boolean(item.available),
			})),
		}))
	);
});

// Update menu item
menuController.patch('/items/:id', zValidator('json', updateMenuItemSchema), async (c) => {
	const id = parseInt(c.req.param('id'));
	const data = c.req.valid('json');
	const db = c.get('db');

	const updateData = {
		...data,
		available: data.available !== undefined ? (data.available ? 1 : 0) : undefined,
	};

	const updatedMenuItem = await db.update(menuItems).set(updateData).where(eq(menuItems.id, id)).returning();

	if (!updatedMenuItem[0]) {
		return c.json({ error: 'Menu item not found' }, 404);
	}

	return c.json({
		...updatedMenuItem[0],
		available: Boolean(updatedMenuItem[0].available),
	});
});

export { menuController };
