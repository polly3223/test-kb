import { MongoClient } from 'mongodb';
import { SECRET_MONGODB_URI } from '$env/static/private';

if (!SECRET_MONGODB_URI) {
	throw new Error('Please define the SECRET_MONGODB_URI environment variable');
}

const client = new MongoClient(SECRET_MONGODB_URI);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	if (!global._mongoClientPromise) {
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	// In production mode, it's best to not use a global variable.
	clientPromise = client.connect();
}

export default clientPromise;
