import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongo';
import { SECRET_DB_NAME } from '$env/static/private';
import type { MongoClient, Db, Collection } from 'mongodb';

interface RowData {
	[key: string]: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { knowledgeBase, rowData }: { knowledgeBase: string; rowData: RowData } =
			await request.json();
		const client: MongoClient = await clientPromise;
		const db: Db = client.db(SECRET_DB_NAME);
		const rowsCollection: Collection<RowData & { knowledgeBase: string; timestamp: Date }> =
			db.collection('rows');

		// Insert the row into the 'rows' collection
		await rowsCollection.insertOne({
			knowledgeBase,
			...rowData,
			timestamp: new Date()
		});

		return json({ success: true, message: 'Row inserted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error inserting row:', error);
		return json({ success: false, error: 'Failed to insert row' }, { status: 500 });
	}
};
