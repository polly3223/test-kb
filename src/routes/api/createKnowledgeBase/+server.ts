import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_DB_NAME } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const knowledgeBase = await request.json();
		const client = await clientPromise;
		const db = client.db(SECRET_DB_NAME);
		const collection = db.collection('knowledgeBases');

		const result = await collection.insertOne(knowledgeBase);

		return json({ success: true, insertedId: result.insertedId }, { status: 201 });
	} catch (error) {
		console.error('Error saving knowledge base:', error);
		return json({ success: false, error: 'Failed to save knowledge base' }, { status: 500 });
	}
};
