import type { PageServerLoad } from './$types';
import clientPromise from '$lib/server/mongo';

export const load: PageServerLoad = async () => {
	try {
		const client = await clientPromise;
		const db = client.db('ksTest');
		const collection = db.collection('traces');

		// Fetch all traces and sort them by timestamp
		const traces = await collection.find().sort({ timestamp: 1 }).toArray();

		// Convert traces to the format expected by the frontend
		const messages = traces.map((trace) => ({
			text: trace.message,
			isUser: trace.isUser
		}));

		return {
			messages
		};
	} catch (error) {
		console.error('Error loading messages:', error);
		return {
			messages: []
		};
	}
};
