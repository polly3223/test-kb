import type { PageServerLoad } from './$types';
import clientPromise from '$lib/server/mongo';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const client = await clientPromise;
		const db = client.db('ksTest'); // Replace 'ksTest' with your actual database name
		const kbname = params.kbname;

		const knowledgeBase = await db.collection('knowledgeBases').findOne({ name: kbname });

		if (!knowledgeBase) {
			return {
				status: 404,
				error: 'Knowledge base not found'
			};
		}

		// Fetch rows for the knowledge base using the kbname
		const rows = await db.collection('rows').find({ knowledgeBase: kbname }).toArray();

		console.log(`Found ${rows.length} rows for knowledge base ${kbname}`);

		// Serialize the knowledgeBase and rows
		const serializedKnowledgeBase = JSON.parse(JSON.stringify(knowledgeBase));
		const serializedRows = JSON.parse(JSON.stringify(rows));

		return {
			knowledgeBase: serializedKnowledgeBase,
			rows: serializedRows
		};
	} catch (error) {
		console.error('Error fetching knowledge base:', error);
		return {
			status: 500,
			error: 'Failed to fetch knowledge base'
		};
	}
};
