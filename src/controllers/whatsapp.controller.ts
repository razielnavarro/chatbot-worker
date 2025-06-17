import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Database } from '../db';
import { conversations } from '../entities/conversations.entity';
import { customers } from '../entities/customers.entity';
import { eq, desc } from 'drizzle-orm';
import { conversationStateSchema, incomingMessageSchema } from '../schemas/conversations.schema';
import { createSession, getSessionByToken, updateSession } from './session.controller';

type Variables = {
	db: Database;
};

const whatsappController = new Hono<{ Variables: Variables }>();

// Webhook for incoming WhatsApp messages
whatsappController.post('/webhook', zValidator('form', incomingMessageSchema), async (c) => {
	const { From, Body, MessageSid } = c.req.valid('form');
	const db = c.get('db');

	// Get or create customer
	let customer = await db.query.customers.findFirst({
		where: (customers, { eq }) => eq(customers.phoneNumber, From),
	});

	if (!customer) {
		const [newCustomer] = await db.insert(customers).values({ phoneNumber: From }).returning();
		customer = newCustomer;
	}

	// Get or create conversation
	let conversation = await db.query.conversations.findFirst({
		where: (conversations, { eq }) => eq(conversations.customerId, customer.id),
		orderBy: (conversations, { desc }) => [desc(conversations.lastMessageAt)],
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

	// Create or update session
	let session = await getSessionByToken(db, conversation.id.toString());
	if (!session) {
		session = await createSession(db, From);
	}

	// Update conversation with new message
	await db
		.update(conversations)
		.set({
			lastMessageAt: new Date(),
		})
		.where(eq(conversations.id, conversation.id));

	// Process message based on conversation state
	let response = '';
	switch (conversation.state) {
		case 'greeting':
			response = 'Welcome! Would you like delivery or pickup?';
			await db
				.update(conversations)
				.set({
					state: 'order_type',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		case 'order_type':
			if (Body.toLowerCase().includes('delivery')) {
				response = 'Please enter your delivery address:';
				await db
					.update(conversations)
					.set({
						state: 'delivery_address',
						lastMessageAt: new Date(),
					})
					.where(eq(conversations.id, conversation.id));
			} else if (Body.toLowerCase().includes('pickup')) {
				response = 'Please select a pickup location:';
				await db
					.update(conversations)
					.set({
						state: 'pickup_location',
						lastMessageAt: new Date(),
					})
					.where(eq(conversations.id, conversation.id));
			} else {
				response = 'Please choose either delivery or pickup.';
			}
			break;
		case 'delivery_address':
			response = 'Delivery address received. Processing...';
			await db
				.update(conversations)
				.set({
					state: 'address_received',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		case 'pickup_location':
			response = 'Pickup location received. Processing...';
			await db
				.update(conversations)
				.set({
					state: 'location_received',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		case 'address_received':
			response = 'Address received. Processing...';
			await db
				.update(conversations)
				.set({
					state: 'processing',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		case 'location_received':
			response = 'Location received. Processing...';
			await db
				.update(conversations)
				.set({
					state: 'processing',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		case 'processing':
			response = 'Processing...';
			await db
				.update(conversations)
				.set({
					state: 'processing',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		case 'order_confirmed':
			response = '¡Gracias por su orden! Nos pondremos en contacto pronto con los detalles de su pedido.';
			await db
				.update(conversations)
				.set({
					state: 'order_confirmed',
					lastMessageAt: new Date(),
				})
				.where(eq(conversations.id, conversation.id));
			break;
		default:
			response = 'Lo siento, no entendí. ¿Podría repetir?';
	}

	return c.json({ response });
});

export { whatsappController };
