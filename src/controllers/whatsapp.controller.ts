import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Database } from '../db';
import { conversations } from '../entities/conversations.entity';
import { customers } from '../entities/customers.entity';
import { eq } from 'drizzle-orm';
import { conversationStateSchema } from '../schemas/conversations.schema';
import { createSession, getSessionByToken, updateSession } from './sessionController';

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
	const response = await processMessage(conversation.state, Body, db, phoneNumber, conversation.temporaryData || undefined);

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
	return c.text(response.message);
});

// Helper function to process messages based on conversation state
async function processMessage(
	state: string,
	message: string,
	db: Database,
	phoneNumber: string,
	conversationData?: string
): Promise<{
	message: string;
	newState: string;
	temporaryData?: string;
}> {
	const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

	switch (state) {
		case 'greeting':
			return {
				message: '¡Bienvenido! ¿Desea delivery o pickup? (Responda con "delivery" o "pickup")',
				newState: 'selecting_type',
			};

		case 'selecting_type':
			const orderType = message.toLowerCase();
			if (orderType !== 'delivery' && orderType !== 'pickup') {
				return {
					message: 'Por favor, responda con "delivery" o "pickup"',
					newState: 'selecting_type',
				};
			}

			// Create a new session for this order
			const session = await createSession(phoneNumber);
			const menuLink = `${FRONTEND_URL}/menu?token=${session.token}`;

			if (orderType === 'delivery') {
				return {
					message: `Por favor, envíe su dirección de entrega. Luego podrá ver nuestro menú aquí: ${menuLink}`,
					newState: 'awaiting_address',
					temporaryData: JSON.stringify({ orderType, sessionToken: session.token }),
				};
			} else {
				return {
					message: `Por favor, seleccione su ubicación para pickup. Puede ver nuestro menú aquí: ${menuLink}`,
					newState: 'awaiting_address',
					temporaryData: JSON.stringify({ orderType, sessionToken: session.token }),
				};
			}

		case 'awaiting_address':
			try {
				const tempData = JSON.parse(conversationData || '{}');
				const { orderType, sessionToken } = tempData;

				// Update session with address
				await updateSession(sessionToken, {
					state: 'menu_sent',
				});

				return {
					message: '¡Gracias! Puede comenzar a ordenar usando el enlace del menú que le enviamos anteriormente.',
					newState: 'selecting_items',
					temporaryData: JSON.stringify({ ...tempData, address: message }),
				};
			} catch (error) {
				console.error('Error processing address:', error);
				return {
					message: 'Lo siento, hubo un error. Por favor, intente nuevamente.',
					newState: 'awaiting_address',
				};
			}

		case 'selecting_items':
			// The actual order creation will happen through the frontend API
			return {
				message: 'Por favor, use el enlace del menú para seleccionar sus items. Cuando termine, confirme su orden.',
				newState: 'selecting_items',
			};

		case 'order_confirmed':
			return {
				message: '¡Gracias por su orden! Nos pondremos en contacto pronto con los detalles de su pedido.',
				newState: 'order_confirmed',
			};

		default:
			return {
				message: 'Lo siento, no entendí. ¿Podría repetir?',
				newState: state,
			};
	}
}

export { whatsappController };
