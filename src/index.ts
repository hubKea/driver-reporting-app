import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { database } from './utils/database';
import logger from './utils/logger';
import process from 'process';
import populate_with_mock_data from './mockdata';
import path from 'path';
import fs from 'fs';

// --- All Your Original Route Imports ---
import loginHandler from './routes/login';
import getBreakRequests from './routes/getBreakRequests';
import createBreakRequest from './routes/createBreakRequest';
import getBreakdownReports from './routes/getBreakdownReports';
import createBreakdownReport from './routes/createBreakdownReport';
import resolveBreakdownReport from './routes/resolveBreakdownReport';
import downloadReports from './routes/downloadReports';
import getStormAuthUserById from './routes/getStormAuthUserById';
import getCurrentStormAuthUser from './routes/getCurrentStormAuthUser';
import upload from './utils/fileUpload';


// Load environment variables
dotenv.config();

const app = express();

// --- All Your Original Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to set user information from headers
app.use(async (req: any, res: Response, next: NextFunction) => {
  const userId = req.headers["x-storm-userid"];
  const userName = req.headers["x-storm-username"];

  if (userId) {
    req.user = { id: userId, name: userName };
  }
  return next();
});

// --- All Your Original Route Definitions ---
app.post('/api/login', loginHandler());
app.get('/api/break_requests', getBreakRequests());
app.post('/api/break_requests', createBreakRequest());
app.get('/api/breakdown_reports', getBreakdownReports());
app.post('/api/breakdown_reports', upload, createBreakdownReport());
app.put('/api/breakdown_reports/:breakdown_report_id', resolveBreakdownReport());
app.get('/api/download_reports', downloadReports());
app.get('/api/storm/auth_user', getStormAuthUserById());
app.get('/api/storm/me', getCurrentStormAuthUser());

// --- All Your Original Static File Serving Logic ---
// This serves your HTML, JS, and CSS files
app.use(express.static(path.join(__dirname, '..')));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: `Internal Server Error: ${err.message}` });
});


// --- THE FIX: The New Server Startup Logic ---
async function startServer() {
    try {
        // 1. Connect to the database first
        await database.connect();
        logger.info("Database connection established.");

        // 2. Populate with mock data and WAIT for it to finish
        await populate_with_mock_data();

        // 3. Only then, start listening for requests
        const PORT = 5010;
        app.listen(PORT, () => {
            logger.info(`✅ Server is running on port ${PORT}`);
            logger.info(`Login page available at http://localhost:${PORT}/login.html`);
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1); // Exit if startup fails
    }
}

// This ensures the server only starts when the file is run directly
if (require.main === module) {
    startServer();
}

export default app;