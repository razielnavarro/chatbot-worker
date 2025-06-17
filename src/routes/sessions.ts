import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createSessionSchema, updateSessionSchema } from '../schemas/sessions.schema';
import { createSession, getSessionByToken, updateSession, deleteSession, cleanupExpiredSessions } from '../controllers/session.controller';
import { Database } from '../db';

type Variables = {
	db: Database;
};

const sessions = new Hono<{ Variables: Variables }>();

// Create a new session
sessions.post('/', zValidator('json', createSessionSchema), async (c) => {
	try {
		const { phone } = c.req.valid('json');
		const db = c.get('db');
		const session = await createSession(db, phone);
		return c.json(session, 201);
	} catch (error) {
		console.error('Error creating session:', error);
		return c.json({ error: 'Failed to create session' }, 500);
	}
});

// Get session by token
sessions.get('/:token', async (c) => {
	try {
		const token = c.req.param('token');
		const db = c.get('db');
		const session = await getSessionByToken(db, token);

		if (!session) {
			return c.json({ error: 'Session not found' }, 404);
		}

		return c.json(session);
	} catch (error) {
		console.error('Error getting session:', error);
		return c.json({ error: 'Failed to get session' }, 500);
	}
});

// Update session
sessions.patch('/:token', zValidator('json', updateSessionSchema), async (c) => {
	try {
		const token = c.req.param('token');
		const data = c.req.valid('json');
		const db = c.get('db');

		const session = await getSessionByToken(db, token);
		if (!session) {
			return c.json({ error: 'Session not found' }, 404);
		}

		const updatedSession = await updateSession(db, session.phone, data);
		return c.json(updatedSession);
	} catch (error) {
		console.error('Error updating session:', error);
		return c.json({ error: 'Failed to update session' }, 500);
	}
});

// Delete session
sessions.delete('/:token', async (c) => {
	try {
		const token = c.req.param('token');
		const db = c.get('db');
		const session = await getSessionByToken(db, token);

		if (!session) {
			return c.json({ error: 'Session not found' }, 404);
		}

		await deleteSession(db, token);
		return c.json({ message: 'Session deleted successfully' });
	} catch (error) {
		console.error('Error deleting session:', error);
		return c.json({ error: 'Failed to delete session' }, 500);
	}
});

// Cleanup expired sessions (admin route)
sessions.post('/cleanup', async (c) => {
	try {
		const db = c.get('db');
		await cleanupExpiredSessions(db);
		return c.json({ message: 'Expired sessions cleaned up successfully' });
	} catch (error) {
		console.error('Error cleaning up sessions:', error);
		return c.json({ error: 'Failed to cleanup sessions' }, 500);
	}
});

export default sessions;
