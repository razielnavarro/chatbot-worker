import { z } from 'zod';

export const orderSchema = z.object({
	id: z.number().min(1).optional(),
	name: z.string().min(2).max(100),
	status: z.enum(['pending', 'processing', 'completed']),
	createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: 'Invalid date',
	}),
});
