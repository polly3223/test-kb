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

		// Fetch all knowledge bases
		const kbCollection = db.collection('knowledgeBases');
		const knowledgeBases = await kbCollection.find({}).toArray();

		// Create tools for each knowledge base
		const tools = knowledgeBases.flatMap((kb) => {
			// Create a properties object for the insertRow function
			const insertProperties = kb.fields.reduce((acc, field) => {
				acc[field.name] = {
					type: 'string',
					description: field.description
				};
				return acc;
			}, {});

			return [
				{
					type: 'function',
					function: {
						name: `insertRow${kb.name}`,
						description: `Insert a new row into the ${kb.name} knowledge base`,
						parameters: {
							type: 'object',
							properties: insertProperties,
							required: kb.fields.map((field) => field.name)
						}
					}
				},
				{
					type: 'function',
					function: {
						name: `getRows${kb.name}`,
						description: `Get rows from the ${kb.name} knowledge base`,
						parameters: {
							type: 'object',
							properties: {
								filter: {
									type: 'object',
									description: 'Filter criteria for the rows',
									properties: insertProperties,
									additionalProperties: true
								}
							},
							required: ['filter']
						}
					}
				}
			];
		});

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

		// Call OpenAI API with tools
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: messages,
			tools: tools,
			tool_choice: 'auto'
		});

		const assistantResponse = completion.choices[0].message;
		let assistantMessage = assistantResponse.content || "Sorry, I couldn't generate a response.";
		let functionCalled = null;

		if (assistantResponse.tool_calls && assistantResponse.tool_calls.length > 0) {
			functionCalled = assistantResponse.tool_calls[0].function.name;
			assistantMessage += `\n\nFunction called: ${functionCalled}`;
		}

		// Insert the assistant's response as a trace
		await collection.insertOne({
			timestamp: new Date(),
			message: assistantMessage,
			isUser: false,
			functionCalled: functionCalled
		});

		return json(
			{
				success: true,
				assistantMessage: assistantMessage,
				functionCalled: functionCalled
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error processing message:', error);
		return json({ success: false, error: 'Failed to process message' }, { status: 500 });
	}
};
