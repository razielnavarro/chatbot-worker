import { z } from 'zod';

export const createLocationSchema = z.object({
	name: z.string().min(1),
	address: z.string().min(1),
	latitude: z.number(),
	longitude: z.number(),
	cashierPhone: z.string().min(1),
	deliveryRadius: z.number().positive(),
	minimumOrder: z.number().positive(),
	estimatedDeliveryTime: z.number().int().positive(),
});

export const updateLocationSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	cashierPhone: z.string().min(1).optional(),
	deliveryRadius: z.number().positive().optional(),
	minimumOrder: z.number().positive().optional(),
	estimatedDeliveryTime: z.number().int().positive().optional(),
});

export const locationResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	address: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	cashierPhone: z.string(),
	deliveryRadius: z.number(),
	minimumOrder: z.number(),
	estimatedDeliveryTime: z.number(),
});
