import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message } = await request.json();
		const client = await clientPromise;
		const db = client.db('ksTest');
		const collection = db.collection('traces');

		// Insert the user's message as a trace
		await collection.insertOne({
			timestamp: new Date(),
			message: message,
			isUser: true
		});

		// Fetch all previous traces
		const traces = await collection.find({}).sort({ timestamp: 1 }).toArray();

		// Prepare messages for OpenAI API
		const messages = traces.map((trace) => ({
			role: trace.isUser ? 'user' : 'assistant',
			content: trace.message
		}));

		// Initialize OpenAI API
		const openai = new OpenAI({
			apiKey: SECRET_OPENAI_API_KEY
		});

		// Call OpenAI API
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: messages
		});

		const assistantMessage =
			completion.choices[0].message.content || "Sorry, I couldn't generate a response.";

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
