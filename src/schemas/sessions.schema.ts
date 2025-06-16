import { z } from 'zod';

export const sessionStateSchema = z.enum(['started', 'menu_sent', 'order_in_progress', 'order_confirmed', 'order_completed', 'expired']);

export const createSessionSchema = z.object({
	phone: z.string().min(1),
	state: sessionStateSchema.default('started'),
	orderId: z.number().optional(),
});

export const updateSessionSchema = z.object({
	state: sessionStateSchema.optional(),
	orderId: z.number().optional(),
});

export const sessionResponseSchema = z.object({
	id: z.number(),
	token: z.string(),
	phone: z.string(),
	state: z.string(),
	orderId: z.number().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	expiresAt: z.date(),
});
