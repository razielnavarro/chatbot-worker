import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../entities';

let db: ReturnType<typeof createDb>;

export const createDb = (d1: D1Database) => {
	return drizzle(d1, { schema });
};

export const getDb = (d1: D1Database) => {
	if (!db) {
		db = createDb(d1);
	}
	return db;
};

export type Database = ReturnType<typeof createDb>;
