import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { customers } from '../entities/customers.entity';
import { eq } from 'drizzle-orm';
import { Database } from '../db';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customers.schema';

type Variables = {
	db: Database;
};

const customersController = new Hono<{ Variables: Variables }>();

// Create customer
customersController.post('/', zValidator('json', createCustomerSchema), async (c) => {
	const data = c.req.valid('json');
	const db = c.get('db');
	const customer = await db.insert(customers).values(data).returning();
	return c.json(customer[0], 201);
});

// Get customer by ID
customersController.get('/:id', async (c) => {
	const id = parseInt(c.req.param('id'));
	const db = c.get('db');
	const customer = await db.query.customers.findFirst({
		where: (customers, { eq }) => eq(customers.id, id),
	});

	if (!customer) {
		return c.json({ error: 'Customer not found' }, 404);
	}

	return c.json(customer);
});

// Get customer by phone number
customersController.get('/phone/:phoneNumber', async (c) => {
	const phoneNumber = c.req.param('phoneNumber');
	const db = c.get('db');
	const customer = await db.query.customers.findFirst({
		where: (customers, { eq }) => eq(customers.phoneNumber, phoneNumber),
	});

	if (!customer) {
		return c.json({ error: 'Customer not found' }, 404);
	}

	return c.json(customer);
});

// Get all customers
customersController.get('/', async (c) => {
	const db = c.get('db');
	const allCustomers = await db.query.customers.findMany();
	return c.json(allCustomers);
});

// Update customer
customersController.patch('/:id', zValidator('json', updateCustomerSchema), async (c) => {
	const id = parseInt(c.req.param('id'));
	const data = c.req.valid('json');
	const db = c.get('db');

	const updatedCustomer = await db
		.update(customers)
		.set({
			...data,
			lastOrderDate: data.phoneNumber ? new Date() : undefined,
		})
		.where(eq(customers.id, id))
		.returning();

	if (!updatedCustomer[0]) {
		return c.json({ error: 'Customer not found' }, 404);
	}

	return c.json(updatedCustomer[0]);
});

export { customersController };
