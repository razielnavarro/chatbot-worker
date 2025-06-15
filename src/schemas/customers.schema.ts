import { z } from 'zod';

export const createCustomerSchema = z.object({
	phoneNumber: z.string().min(1),
	name: z.string().optional(),
});

export const updateCustomerSchema = z.object({
	name: z.string().optional(),
	phoneNumber: z.string().min(1).optional(),
});

export const customerResponseSchema = z.object({
	id: z.number(),
	phoneNumber: z.string(),
	name: z.string().nullable(),
	lastOrderDate: z.date().nullable(),
});
