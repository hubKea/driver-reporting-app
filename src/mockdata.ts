import { database } from './utils/database';
import { Db } from 'mongodb';
import bcrypt from 'bcrypt';
import logger from './utils/logger';
import * as DataModel from './datamodel';

async function insertMockData(db: Db) {
    const usersCollection = db.collection('users');
    const reportsCollection = db.collection('breakdown_reports');
    const requestsCollection = db.collection('break_requests');
    const username = 'systemadmin';

    // 1. Check if the user already exists to prevent re-running
    if (await usersCollection.findOne({ username: username })) {
        logger.info(`User '${username}' already exists. Skipping all mock data creation.`);
        return;
    }

    logger.info(`Creating all mock data...`);
    try {
        // Create User
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password', saltRounds);
        const newUser = new DataModel.User('manager', 'idn_d1f21rgoo9s6edus1jdg', 'System Admin', 'systemadmin', 'admin@trucking.com', 'systemadmin', hashedPassword);
        await usersCollection.insertOne({ ...newUser });
        logger.info(`✅ Created mock user: '${username}'`);

        // Create Breakdown Reports
        const reports = [
            new DataModel.BreakdownReport('rep-001', 'driver-01', 'TRK-123', 'N1 Highway', 'Engine Overheating', Math.floor(Date.now() / 1000) - 86400, 'pending', 'Steam from engine', '', 'F01', 'John Doe', '555-1234', 'Super Visor', '555-5678', 'Trucking Inc', 'slip.jpg', 'seal1.jpg', 'seal2.jpg', new Date()),
            new DataModel.BreakdownReport('rep-002', 'driver-02', 'TRK-456', 'R21 Off-ramp', 'Flat Tire', Math.floor(Date.now() / 1000) - 172800, 'resolved', 'Front left tire', 'Replaced tire', 'F02', 'Jane Smith', '555-4321', 'Super Visor', '555-5678', 'Trucking Inc', 'slip.jpg', 'seal1.jpg', 'seal2.jpg', new Date()),
        ];
        await reportsCollection.insertMany(reports.map(r => ({...r})));
        logger.info(`✅ Inserted ${reports.length} mock breakdown reports.`);

        // Create Break Requests
        const requests = [
            new DataModel.BreakRequest(
                'req-001', // request_details
                'driver-03', // user_id
                'fatigue', // break_type
                30, // break_duration
                Math.floor(Date.now() / 1000) - 43200, // submission_date
                'Long day', // notes
                'Peter Jones', // driver_name
                'Trucking Inc', // company_name
                'Midrand', // location
                '555-8888', // phone_number
                new Date() // created_at
            ),
            new DataModel.BreakRequest(
                'req-002',
                'driver-04',
                'lunch',
                60,
                Math.floor(Date.now() / 1000) - 259200,
                'Lunch break',
                'Mary Williams',
                'Trucking Inc',
                'Centurion',
                '555-9999',
                new Date()
            ),
        ];
        await requestsCollection.insertMany(requests.map(r => ({...r})));
        logger.info(`✅ Inserted ${requests.length} mock break requests.`);

    } catch (error) {
        logger.error('❌ Failed to insert mock data:', error);
    }
}

export default async function populate_with_mock_data(): Promise<void> {
    try {
        const db = await database.getDb();
        await insertMockData(db);
    } catch (error) {
        logger.error('Error during mock data population:', error);
    }
}