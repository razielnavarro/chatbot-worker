import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../entities';

export const createDb = (d1: D1Database) => {
	return drizzle(d1, { schema });
};

export const getDb = () => {
	if (!db) {
		throw new Error('Database not initialized');
	}
	return db;
};

let db: ReturnType<typeof createDb>;

export const initDb = (d1: D1Database) => {
	db = createDb(d1);
	return db;
};

export type Database = ReturnType<typeof createDb>;
