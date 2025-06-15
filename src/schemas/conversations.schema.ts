import { z } from 'zod';

export const conversationStateSchema = z.enum([
	'greeting',
	'selecting_type',
	'awaiting_address',
	'selecting_items',
	'confirming_order',
	'order_confirmed',
	'order_cancelled',
]);

export const createConversationSchema = z.object({
	customerId: z.number(),
	state: conversationStateSchema,
	temporaryData: z.string().optional(),
	cartId: z.string().optional(),
});

export const updateConversationSchema = z.object({
	state: conversationStateSchema.optional(),
	temporaryData: z.string().optional(),
	cartId: z.string().optional(),
});

export const conversationResponseSchema = z.object({
	id: z.number(),
	customerId: z.number(),
	state: z.string(),
	temporaryData: z.string().nullable(),
	lastMessageAt: z.date(),
	cartId: z.string().nullable(),
});
