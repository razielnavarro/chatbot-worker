import { getDb } from '../db';
import { sessions } from '../entities/sessions.entity';
import { generateToken, generateExpiryTime } from '../utils/token';
import { createSessionSchema, updateSessionSchema } from '../schemas/sessions.schema';
import { eq } from 'drizzle-orm';

export async function createSession(phone: string) {
	const db = getDb();
	const token = generateToken();
	const expiresAt = generateExpiryTime();

	const [session] = await db
		.insert(sessions)
		.values({
			token,
			phone,
			state: 'started',
			expiresAt,
		})
		.returning();

	return session;
}

export async function getSessionByToken(token: string) {
	const db = getDb();
	return db.select().from(sessions).where(eq(sessions.token, token)).get();
}

export async function updateSession(token: string, data: typeof updateSessionSchema._type) {
	const db = getDb();
	const [session] = await db
		.update(sessions)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(sessions.token, token))
		.returning();

	return session;
}

export async function deleteSession(token: string) {
	const db = getDb();
	await db.delete(sessions).where(eq(sessions.token, token));
}

export async function cleanupExpiredSessions() {
	const db = getDb();
	const now = new Date();
	await db.delete(sessions).where(eq(sessions.expiresAt, now));
}
