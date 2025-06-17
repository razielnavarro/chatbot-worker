import { Database } from '../db';
import { sessions } from '../entities/sessions.entity';
import { eq } from 'drizzle-orm';
import { generateToken, generateExpiryTime } from '../utils/token';

export async function createSession(db: Database, phone: string) {
	const token = generateToken();
	const expiresAt = generateExpiryTime();

	const session = await db
		.insert(sessions)
		.values({
			token,
			phone,
			state: 'active',
			expiresAt,
		})
		.returning();

	return session[0];
}

export async function getSessionByToken(db: Database, token: string) {
	const session = await db.query.sessions.findFirst({
		where: (sessions, { eq }) => eq(sessions.token, token),
	});
	return session;
}

export async function updateSession(db: Database, phone: string, data: Partial<typeof sessions.$inferInsert>) {
	const session = await db
		.update(sessions)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(sessions.phone, phone))
		.returning();
	return session[0];
}

export async function deleteSession(db: Database, token: string) {
	await db.delete(sessions).where(eq(sessions.token, token));
}

export async function cleanupExpiredSessions(db: Database) {
	const now = new Date();
	await db.delete(sessions).where(eq(sessions.expiresAt, now));
}
