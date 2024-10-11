import type { PageServerLoad } from '../$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_DB_NAME } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const client = await clientPromise;
		const db = client.db(SECRET_DB_NAME);
		const tracesCollection = db.collection('traces');
		const chatsCollection = db.collection('chats');

		// Fetch all chats and convert _id to string
		const chats = await chatsCollection.find().toArray();
		const serializedChats = chats.map((chat) => ({
			...chat,
			_id: chat._id.toString()
		}));

		// If a chat ID is provided, fetch messages for that chat
		if (params.chatId) {
			const traces = await tracesCollection
				.find({ chatId: params.chatId })
				.sort({ timestamp: 1 })
				.toArray();

			const messages = traces.map((trace) => ({
				text: trace.message,
				isUser: trace.isUser
			}));

			return {
				messages,
				chats: serializedChats
			};
		}

		// If no chat ID is provided, return an empty messages array
		return {
			messages: [],
			chats: serializedChats
		};
	} catch (err) {
		console.error('Error loading chat data:', err);
		throw error(500, 'Error loading chat data');
	}
};
