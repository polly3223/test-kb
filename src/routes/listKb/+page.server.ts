import type { PageServerLoad } from './$types';
import clientPromise from '$lib/server/mongo';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async () => {
	try {
		const client = await clientPromise;
		const db = client.db('ksTest'); // Replace 'ksTest' with your actual database name
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
