import { randomBytes } from 'crypto';

export function generateToken(length = 32): string {
	return randomBytes(length).toString('hex');
}

export function generateExpiryTime(hours = 1): Date {
	const now = new Date();
	now.setHours(now.getHours() + hours);
	return now;
}
