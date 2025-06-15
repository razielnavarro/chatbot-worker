import { z } from 'zod';

export const orderItemSchema = z.object({
	menuItemId: z.number(),
	quantity: z.number().int().positive(),
	notes: z.string().optional(),
});

export const createOrderSchema = z.object({
	customerId: z.number(),
	locationId: z.number(),
	orderType: z.enum(['delivery', 'pickup']),
	items: z.array(orderItemSchema),
	deliveryAddress: z.string().optional(),
	deliveryLatitude: z.number().optional(),
	deliveryLongitude: z.number().optional(),
	deliveryDetails: z.string().optional(),
	deliveryFee: z.number().optional(),
	subtotal: z.number().positive(),
	total: z.number().positive(),
});

export const updateOrderStatusSchema = z.object({
	status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
});

export const orderResponseSchema = z.object({
	id: z.number(),
	customerId: z.number(),
	locationId: z.number(),
	status: z.string(),
	orderType: z.string(),
	deliveryAddress: z.string().nullable(),
	deliveryLatitude: z.number().nullable(),
	deliveryLongitude: z.number().nullable(),
	deliveryDetails: z.string().nullable(),
	deliveryFee: z.number().nullable(),
	subtotal: z.number(),
	total: z.number(),
	paymentMethod: z.string().nullable(),
	paymentStatus: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	items: z.array(
		z.object({
			id: z.number(),
			menuItemId: z.number(),
			quantity: z.number(),
			price: z.number(),
			notes: z.string().nullable(),
		})
	),
});
