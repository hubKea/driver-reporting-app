import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

class DatabaseService {
    private client: MongoClient;
    private db: Db | null = null;
    private readonly uri: string;

    constructor() {
        const username = process.env.MONGO_USERNAME;
        const password = process.env.MONGO_PASSWORD;
        const host = process.env.MONGO_HOST;
        const dbName = process.env.MONGO_DB;

        if (!username || !password || !host || !dbName) {
            throw new Error("Missing MongoDB connection details in .env file.");
        }

        // --- THIS IS THE CORRECTED CONNECTION STRING FOR MONGODB ATLAS ---
        this.uri = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
        
        console.log(`Configured MongoDB Atlas connection to: ${host}`);
        
        this.client = new MongoClient(this.uri);
    }

    async connect(): Promise<Db> {
        if (this.db) return this.db;

        try {
            await this.client.connect();
            this.db = this.client.db(); // The dbName is already in the connection string
            console.log(`✅ Successfully connected to MongoDB Atlas database: ${this.db.databaseName}`);
            return this.db;
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB', error);
            throw error;
        }
    }

    async getDb(): Promise<Db> {
        if (!this.db) {
            return await this.connect();
        }
        return this.db;
    }
    
    // ... (the other functions remain the same)
    async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.close();
			this.db = null;
			console.log('Disconnected from MongoDB');
		}
	}

	async getClient(): Promise<MongoClient> {
		return this.client;
	}
}

// Singleton instance
export const database = new DatabaseService();
export default database;
