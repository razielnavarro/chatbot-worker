import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { locations } from '../entities/locations.entity';
import { eq } from 'drizzle-orm';
import { Database } from '../db';
import { createLocationSchema, updateLocationSchema } from '../schemas/locations.schema';

type Variables = {
	db: Database;
};

const locationsController = new Hono<{ Variables: Variables }>();

// Create location
locationsController.post('/', zValidator('json', createLocationSchema), async (c) => {
	const data = c.req.valid('json');
	const db = c.get('db');
	const location = await db.insert(locations).values(data).returning();
	return c.json(location[0], 201);
});

// Get location by ID
locationsController.get('/:id', async (c) => {
	const id = parseInt(c.req.param('id'));
	const db = c.get('db');
	const location = await db.query.locations.findFirst({
		where: (locations, { eq }) => eq(locations.id, id),
	});

	if (!location) {
		return c.json({ error: 'Location not found' }, 404);
	}

	return c.json(location);
});

// Get all locations
locationsController.get('/', async (c) => {
	const db = c.get('db');
	const allLocations = await db.query.locations.findMany();
	return c.json(allLocations);
});

// Update location
locationsController.patch('/:id', zValidator('json', updateLocationSchema), async (c) => {
	const id = parseInt(c.req.param('id'));
	const data = c.req.valid('json');
	const db = c.get('db');

	const updatedLocation = await db.update(locations).set(data).where(eq(locations.id, id)).returning();

	if (!updatedLocation[0]) {
		return c.json({ error: 'Location not found' }, 404);
	}

	return c.json(updatedLocation[0]);
});

export { locationsController };
