import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Database } from '../db';
import { conversations } from '../entities/conversations.entity';
import { customers } from '../entities/customers.entity';
import { eq } from 'drizzle-orm';
import { conversationStateSchema } from '../schemas/conversations.schema';

type Variables = {
	db: Database;
};

const whatsappController = new Hono<{ Variables: Variables }>();

// Webhook for incoming WhatsApp messages
const incomingMessageSchema = z.object({
	From: z.string(),
	Body: z.string(),
	MessageSid: z.string(),
});

whatsappController.post('/webhook', zValidator('form', incomingMessageSchema), async (c) => {
	const { From, Body, MessageSid } = c.req.valid('form');
	const db = c.get('db');

	// Extract phone number from WhatsApp format (e.g., "whatsapp:+1234567890")
	const phoneNumber = From.replace('whatsapp:', '');

	// Find or create customer
	let customer = await db.query.customers.findFirst({
		where: (customers, { eq }) => eq(customers.phoneNumber, phoneNumber),
	});

	if (!customer) {
		const [newCustomer] = await db.insert(customers).values({ phoneNumber }).returning();
		customer = newCustomer;
	}

	// Find or create conversation
	let conversation = await db.query.conversations.findFirst({
		where: (conversations, { eq }) => eq(conversations.customerId, customer.id),
	});

	if (!conversation) {
		const [newConversation] = await db
			.insert(conversations)
			.values({
				customerId: customer.id,
				state: 'greeting',
				lastMessageAt: new Date(),
			})
			.returning();
		conversation = newConversation;
	}

	// Process message based on conversation state
	const response = await processMessage(conversation.state, Body, db);

	// Update conversation state and last message time
	await db
		.update(conversations)
		.set({
			state: response.newState,
			lastMessageAt: new Date(),
			temporaryData: response.temporaryData,
		})
		.where(eq(conversations.id, conversation.id));

	// Send response back to WhatsApp
	return c.json({
		message: response.message,
	});
});

// Helper function to process messages based on conversation state
async function processMessage(
	state: string,
	message: string,
	db: Database
): Promise<{
	message: string;
	newState: string;
	temporaryData?: string;
}> {
	switch (state) {
		case 'greeting':
			return {
				message: 'Welcome! Would you like to place an order for delivery or pickup?',
				newState: 'selecting_type',
			};

		case 'selecting_type':
			const orderType = message.toLowerCase();
			if (orderType === 'delivery' || orderType === 'pickup') {
				return {
					message: orderType === 'delivery' ? 'Please provide your delivery address.' : 'Please select your preferred pickup location.',
					newState: orderType === 'delivery' ? 'awaiting_address' : 'selecting_location',
					temporaryData: JSON.stringify({ orderType }),
				};
			}
			return {
				message: 'Please type "delivery" or "pickup".',
				newState: 'selecting_type',
			};

		case 'awaiting_address':
			// TODO: Validate address and get coordinates
			return {
				message: 'Great! Now let\'s select your items. Type "menu" to see our menu.',
				newState: 'selecting_items',
				temporaryData: JSON.stringify({ address: message }),
			};

		case 'selecting_location':
			// TODO: Validate location selection
			return {
				message: 'Great! Now let\'s select your items. Type "menu" to see our menu.',
				newState: 'selecting_items',
				temporaryData: JSON.stringify({ location: message }),
			};

		case 'selecting_items':
			if (message.toLowerCase() === 'menu') {
				// TODO: Get menu items from database
				return {
					message: "Here's our menu:\n1. Item 1 - $10\n2. Item 2 - $15\n\nType the number to add to cart.",
					newState: 'selecting_items',
				};
			}
			// TODO: Handle item selection and cart management
			return {
				message: 'Item added to cart. Type "done" when finished or "menu" to see more items.',
				newState: 'selecting_items',
			};

		case 'confirming_order':
			if (message.toLowerCase() === 'confirm') {
				// TODO: Create order in database
				return {
					message: "Order confirmed! We'll notify you when it's ready.",
					newState: 'order_confirmed',
				};
			}
			return {
				message: 'Please type "confirm" to place your order or "cancel" to start over.',
				newState: 'confirming_order',
			};

		default:
			return {
				message: 'Welcome! Would you like to place an order for delivery or pickup?',
				newState: 'selecting_type',
			};
	}
}

export { whatsappController };
