import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_OPENAI_API_KEY, SECRET_DB_NAME } from '$env/static/private';
import OpenAI from 'openai';
import type { MongoClient, Db, Collection } from 'mongodb';
import pdf from 'pdf-extraction';

interface KnowledgeBase {
	name: string;
	fields: { name: string; description: string }[];
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const knowledgeBaseName = formData.get('knowledgeBaseName') as string;
		let fileContent: string;

		if (formData.has('file')) {
			const file = formData.get('file') as File;
			if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
				const arrayBuffer = await file.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				const data = await pdf(uint8Array);
				fileContent = data.text;
			} else {
				fileContent = await file.text();
			}
		} else if (formData.has('pastedText')) {
			fileContent = formData.get('pastedText') as string;
		} else {
			return json({ success: false, error: 'No file or text provided' }, { status: 400 });
		}

		const client: MongoClient = await clientPromise;
		const db: Db = client.db(SECRET_DB_NAME);

		// Fetch the specific knowledge base
		const kbCollection: Collection<KnowledgeBase> = db.collection('knowledgeBases');
		const knowledgeBase = await kbCollection.findOne({ name: knowledgeBaseName });

		if (!knowledgeBase) {
			return json({ success: false, error: 'Knowledge base not found' }, { status: 404 });
		}

		// Create the tool for extracting information
		const extractTool = {
			type: 'function',
			function: {
				name: `extractInfo${knowledgeBase.name}`,
				description: `Extract information for the ${knowledgeBase.name} knowledge base`,
				parameters: {
					type: 'object',
					properties: knowledgeBase.fields.reduce(
						(acc, field) => {
							acc[field.name] = {
								type: 'string',
								description: field.description
							};
							return acc;
						},
						{} as { [key: string]: { type: 'string'; description: string } }
					),
					additionalProperties: false
				}
			}
		};

		// Initialize OpenAI API
		const openai: OpenAI = new OpenAI({
			apiKey: SECRET_OPENAI_API_KEY
		});

		// Call OpenAI API
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content: 'You are an AI assistant that extracts information from text files.'
				},
				{
					role: 'user',
					content: `Extract information for the ${knowledgeBase.name} knowledge base from the following text:\n\n${fileContent}`
				}
			],
			tools: [extractTool],
			tool_choice: 'auto'
		});

		const assistantResponse = completion.choices[0].message;

		if (assistantResponse.tool_calls && assistantResponse.tool_calls.length > 0) {
			const toolCall = assistantResponse.tool_calls[0];
			const extractedData = JSON.parse(toolCall.function.arguments);

			return json({ success: true, data: extractedData }, { status: 200 });
		} else {
			return json({ success: false, error: 'Failed to extract information' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error processing file:', error);
		return json({ success: false, error: 'Failed to process file' }, { status: 500 });
	}
};
