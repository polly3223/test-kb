import type { PageServerLoad } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_DB_NAME } from '$env/static/private';

export const load: PageServerLoad = async () => {
	try {
		const client = await clientPromise;
		const db = client.db(SECRET_DB_NAME);
		const knowledgeBases = await db.collection('knowledgeBases').find({}).toArray();

		// Convert ObjectId to string
		const serializedKnowledgeBases = knowledgeBases.map((kb) => ({
			...kb,
			_id: kb._id.toString()
		}));

		return {
			knowledgeBases: serializedKnowledgeBases
		};
	} catch (error) {
		console.error('Error fetching knowledge bases:', error);
		return {
			knowledgeBases: [],
			error: 'Failed to fetch knowledge bases'
		};
	}
};
