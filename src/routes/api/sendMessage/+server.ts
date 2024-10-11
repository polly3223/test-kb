import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_OPENAI_API_KEY, SECRET_DB_NAME } from '$env/static/private';
import OpenAI from 'openai';
import type { MongoClient, Db, Collection } from 'mongodb';

interface KnowledgeBase {
	name: string;
	fields: { name: string; description: string }[];
}

interface Trace {
	timestamp: Date;
	message: string;
	isUser: boolean;
	chatId: string;
	functionCalled?: string;
}

interface RowData {
	[key: string]: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message, chatId }: { message: string; chatId: string } = await request.json();
		const client: MongoClient = await clientPromise;
		const db: Db = client.db(SECRET_DB_NAME);
		const collection: Collection<Trace> = db.collection('traces');

		// Fetch all knowledge bases
		const kbCollection: Collection<KnowledgeBase> = db.collection('knowledgeBases');
		const knowledgeBases: KnowledgeBase[] = await kbCollection.find({}).toArray();

		// Update the tools creation logic
		const tools = knowledgeBases.flatMap((kb: KnowledgeBase) => {
			// Create a properties object for the insertRow function
			const insertProperties: { [key: string]: { type: string; description: string } } =
				kb.fields.reduce(
					(acc, field) => {
						acc[field.name] = {
							type: 'string',
							description:
								field.name !== field.description
									? `${field.name}: ${field.description}`
									: field.description
						};
						return acc;
					},
					{} as { [key: string]: { type: string; description: string } }
				);

			// Set all fields as required
			const requiredFields = kb.fields.map((field) => field.name);

			return [
				{
					type: 'function',
					function: {
						name: `insertRow${kb.name}`,
						description: `Insert a new row into the ${kb.name} knowledge base`,
						strict: true,
						parameters: {
							type: 'object',
							properties: insertProperties,
							additionalProperties: false,
							required: requiredFields
						}
					}
				},
				{
					type: 'function',
					function: {
						name: `getRows${kb.name}`,
						description: `Get rows from the ${kb.name} knowledge base`
					}
				}
			];
		});

		console.log(JSON.stringify(tools, null, 2));

		// Add a check for empty tools array
		if (tools.length === 0) {
			console.warn('No knowledge bases found. Proceeding without tools.');
		}

		// Insert the user's message as a trace
		await collection.insertOne({
			timestamp: new Date(),
			message: message,
			isUser: true,
			chatId: chatId
		});

		// Fetch all previous traces for this chat
		const traces: Trace[] = await collection
			.find({ chatId: chatId })
			.sort({ timestamp: 1 })
			.toArray();

		// Prepare messages for OpenAI API
		const messages: { role: 'user' | 'assistant'; content: string }[] = traces.map((trace) => ({
			role: trace.isUser ? 'user' : 'assistant',
			content: trace.message
		}));

		// Initialize OpenAI API
		const openai: OpenAI = new OpenAI({
			apiKey: SECRET_OPENAI_API_KEY
		});

		// Call OpenAI API with tools only if they exist
		let assistantMessage: string = '';
		let functionCalled: string | null = null;
		let shouldMakeSecondCall = false;
		let functionResult: any = null;

		// First AI call
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: messages,
			...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {})
		});

		const assistantResponse = completion.choices[0].message;

		if (assistantResponse.tool_calls && assistantResponse.tool_calls.length > 0) {
			const toolCall = assistantResponse.tool_calls[0];
			functionCalled = toolCall.function.name;

			console.log('functionCalled', functionCalled);

			// Handle insertRow function calls
			if (functionCalled.startsWith('insertRow')) {
				const kbName: string = functionCalled.replace('insertRow', '');
				const rowData: RowData = JSON.parse(toolCall.function.arguments);

				// Insert the row into the 'rows' collection
				const rowsCollection: Collection<RowData & { knowledgeBase: string; timestamp: Date }> =
					db.collection('rows');
				await rowsCollection.insertOne({
					knowledgeBase: kbName,
					...rowData,
					timestamp: new Date()
				});

				assistantMessage += `\nRow inserted into ${kbName} knowledge base.`;
			}

			// Handle getRows function calls
			if (functionCalled.startsWith('getRows')) {
				const kbName: string = functionCalled.replace('getRows', '');
				const filter: RowData = JSON.parse(toolCall.function.arguments).filter;

				const rowsCollection: Collection<RowData & { knowledgeBase: string; timestamp: Date }> =
					db.collection('rows');
				functionResult = await rowsCollection.find({ knowledgeBase: kbName, ...filter }).toArray();

				shouldMakeSecondCall = true;
			}
		} else {
			assistantMessage = assistantResponse.content || '';
		}

		// Make a second AI call if necessary
		if (shouldMakeSecondCall) {
			const secondCallMessages = [
				...messages,
				{
					role: 'function',
					name: functionCalled,
					content: JSON.stringify(functionResult)
				}
			];

			const secondCompletion = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: secondCallMessages
			});

			assistantMessage = secondCompletion.choices[0].message.content || '';
		}

		// Insert the assistant's response as a trace
		await collection.insertOne({
			timestamp: new Date(),
			message: assistantMessage,
			isUser: false,
			functionCalled,
			chatId: chatId
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
