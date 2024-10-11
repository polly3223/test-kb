import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { SECRET_DB_NAME } from '$env/static/private';
import { nanoid } from 'nanoid';

export const load: PageServerLoad = async () => {
	const client = await clientPromise;
	const db = client.db(SECRET_DB_NAME);
	const collection = db.collection('chats');

	// Check if any chats exist
	const existingChat = await collection.findOne({});

	if (existingChat) {
		// If a chat exists, redirect to that chat
		throw redirect(302, `/chat/${existingChat.id}`);
	} else {
		// If no chats exist, create a new one
		const chatId = nanoid(10);
		const newChat = { id: chatId, createdAt: new Date() };

		await collection.insertOne(newChat);

		// Redirect to the newly created chat
		throw redirect(302, `/chat/${chatId}`);
	}
};
