import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_DB_NAME } from '$env/static/private';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async () => {
	try {
		const client = await clientPromise;
		const db = client.db(SECRET_DB_NAME);
		const collection = db.collection('chats');

		const chatId = nanoid(10); // Generate a short random ID
		const newChat = { id: chatId, createdAt: new Date() };

		await collection.insertOne(newChat);

		return json(newChat, { status: 201 });
	} catch (error) {
		console.error('Error creating new chat:', error);
		return json({ error: 'Failed to create new chat' }, { status: 500 });
	}
};
