import { z } from 'zod';

export const createCategorySchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	imageUrl: z.string().url().optional(),
});

export const createMenuItemSchema = z.object({
	categoryId: z.number(),
	name: z.string().min(1),
	description: z.string().optional(),
	price: z.number().positive(),
	imageUrl: z.string().url().optional(),
	available: z.boolean().default(true),
});

export const updateMenuItemSchema = z.object({
	categoryId: z.number().optional(),
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	price: z.number().positive().optional(),
	imageUrl: z.string().url().optional(),
	available: z.boolean().optional(),
});

export const categoryResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	imageUrl: z.string().nullable(),
	items: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			description: z.string().nullable(),
			price: z.number(),
			imageUrl: z.string().nullable(),
			available: z.boolean(),
		})
	),
});

export const menuItemResponseSchema = z.object({
	id: z.number(),
	categoryId: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number(),
	imageUrl: z.string().nullable(),
	available: z.boolean(),
	category: z.object({
		id: z.number(),
		name: z.string(),
		description: z.string().nullable(),
		imageUrl: z.string().nullable(),
	}),
});
