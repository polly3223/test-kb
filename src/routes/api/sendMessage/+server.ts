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
			model: 'gpt-4o-mini',
			messages: messages,
			tools: tools,
			tool_choice: 'auto'
		});

		const assistantResponse = completion.choices[0].message;
		let assistantMessage = assistantResponse.content || '';
		let functionCalled = null;

		if (assistantResponse.tool_calls && assistantResponse.tool_calls.length > 0) {
			const toolCall = assistantResponse.tool_calls[0];
			functionCalled = toolCall.function.name;
			assistantMessage += assistantMessage ? '\n\n' : '';
			assistantMessage += `Function called: ${functionCalled}`;

			// Handle insertRow function calls
			if (functionCalled.startsWith('insertRow')) {
				const kbName = functionCalled.replace('insertRow', '');
				const rowData = JSON.parse(toolCall.function.arguments);

				// Insert the row into the 'rows' collection
				const rowsCollection = db.collection('rows');
				await rowsCollection.insertOne({
					knowledgeBase: kbName,
					...rowData,
					timestamp: new Date()
				});

				assistantMessage += `\nRow inserted into ${kbName} knowledge base.`;
			}
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
