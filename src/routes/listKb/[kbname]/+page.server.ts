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

		// Convert ObjectId to string
		const serializedKnowledgeBase = {
			...knowledgeBase,
			_id: knowledgeBase._id.toString()
		};

		return {
			knowledgeBase: serializedKnowledgeBase
		};
	} catch (error) {
		console.error('Error fetching knowledge base:', error);
		return {
			status: 500,
			error: 'Failed to fetch knowledge base'
		};
	}
};
