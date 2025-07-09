import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testDatabaseConnection() {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const host = process.env.MONGO_HOST;
    const dbName = process.env.MONGO_DB;

    if (!username || !password || !host || !dbName) {
        console.error('❌ Error: Missing MongoDB connection details in your .env file.');
        return;
    }

    const uri = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
    
    console.log('Attempting to connect to MongoDB...');
    console.log(`Using URI: mongodb+srv://${username}:<password_hidden>@${host}/${dbName}`);

    const client = new MongoClient(uri);

    try {
        // Connect the client to the server
        await client.connect();
        // Establish and verify connection
        await client.db("admin").command({ ping: 1 });
        console.log('✅ Success! You are successfully connected to MongoDB.');
    } catch (error) {
        console.error('❌ Connection Failed! Here is the error:');
        console.error(error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

testDatabaseConnection();