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

		console.log('Processing request for knowledge base:', knowledgeBaseName);

		if (formData.has('file')) {
			const file = formData.get('file') as File;
			console.log('File type:', file.type);
			console.log('File name:', file.name);

			if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
				try {
					const arrayBuffer = await file.arrayBuffer();
					const uint8Array = new Uint8Array(arrayBuffer);
					const data = await pdf(uint8Array);
					fileContent = data.text;
					console.log('Successfully extracted PDF content');
				} catch (pdfError) {
					console.error('Error processing PDF:', pdfError);
					return json({ success: false, error: 'Failed to process PDF file' }, { status: 500 });
				}
			} else {
				try {
					fileContent = await file.text();
					console.log('Successfully read file content');
				} catch (fileError) {
					console.error('Error reading file:', fileError);
					return json({ success: false, error: 'Failed to read file content' }, { status: 500 });
				}
			}
		} else if (formData.has('pastedText')) {
			fileContent = formData.get('pastedText') as string;
			console.log('Received pasted text');
		} else {
			console.error('No file or text provided');
			return json({ success: false, error: 'No file or text provided' }, { status: 400 });
		}

		const client: MongoClient = await clientPromise;
		const db: Db = client.db(SECRET_DB_NAME);

		console.log('Connected to database');

		// Fetch the specific knowledge base
		const kbCollection: Collection<KnowledgeBase> = db.collection('knowledgeBases');
		const knowledgeBase = await kbCollection.findOne({ name: knowledgeBaseName });

		if (!knowledgeBase) {
			console.error('Knowledge base not found:', knowledgeBaseName);
			return json({ success: false, error: 'Knowledge base not found' }, { status: 404 });
		}

		console.log('Found knowledge base:', knowledgeBaseName);

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

		console.log('Initialized OpenAI API');

		// Call OpenAI API
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o', // Make sure this is the correct model name
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

		console.log('Received response from OpenAI API');

		const assistantResponse = completion.choices[0].message;

		if (assistantResponse.tool_calls && assistantResponse.tool_calls.length > 0) {
			const toolCall = assistantResponse.tool_calls[0];
			const extractedData = JSON.parse(toolCall.function.arguments);

			console.log('Successfully extracted data');
			return json({ success: true, data: extractedData }, { status: 200 });
		} else {
			console.error('Failed to extract information');
			return json({ success: false, error: 'Failed to extract information' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error processing file:', error);
		return json(
			{ success: false, error: 'Failed to process file', details: error.message },
			{ status: 500 }
		);
	}
};
