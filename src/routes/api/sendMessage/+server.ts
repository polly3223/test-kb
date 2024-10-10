import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message } = await request.json();
		const client = await clientPromise;
		const db = client.db('ksTest');
		const collection = db.collection('traces');

		const trace = {
			timestamp: new Date(),
			message: message,
			isUser: true
		};

		await collection.insertOne(trace);

		// Simulate a delay for the assistant's response
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const assistantMessage = 'This is a sample bot response.';

		// Insert the assistant's response as a trace
		await collection.insertOne({
			timestamp: new Date(),
			message: assistantMessage,
			isUser: false
		});

		return json(
			{
				success: true,
				assistantMessage: assistantMessage
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error processing message:', error);
		return json({ success: false, error: 'Failed to process message' }, { status: 500 });
	}
};
