import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { getDb, createDb } from './db';
import { ordersController } from './controllers/orders.controller';
import { menuController } from './controllers/menu.controller';
import { locationsController } from './controllers/locations.controller';
import { customersController } from './controllers/customers.controller';
import { whatsappController } from './controllers/whatsapp.controller';
import sessions from './routes/sessions';

type Variables = {
	db: ReturnType<typeof getDb>;
};

const app = new Hono<{ Variables: Variables; Bindings: { DB: D1Database } }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());

// Database middleware
app.use('*', async (c, next) => {
	c.set('db', createDb(c.env.DB));
	await next();
});

// Routes
app.route('/api/orders', ordersController);
app.route('/api/menu', menuController);
app.route('/api/locations', locationsController);
app.route('/api/customers', customersController);
app.route('/api/whatsapp', whatsappController);
app.route('/api/sessions', sessions);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
