import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';

const getBreakRequests = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      // Get user ID from headers
      const userId = req.headers['x-storm-userid'] as string;
      
      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request headers.' });
        return;
      }

      // Check if user exists and has manager role
      const user = await DataModel.User.findById(userId);
      if (!user) {
        res.status(401).json({ error: 'User not found.' });
        return;
      }

      if (user.role !== 'manager') {
        res.status(403).json({ error: 'Access denied. Only managers can access this endpoint.' });
        return;
      }

      const startDateParam = req.query.start_date as string;
      const endDateParam = req.query.end_date as string;

      let startDate: number | undefined;
      let endDate: number | undefined;

      // Validate start_date if provided
      if (startDateParam) {
        const parsedStartDate = parseInt(startDateParam, 10);
        if (isNaN(parsedStartDate)) {
          res.status(400).json({ error: 'Invalid start_date parameter. Must be a valid Unix timestamp.' });
          return;
        }
        startDate = parsedStartDate;
      }

      // Validate end_date if provided
      if (endDateParam) {
        const parsedEndDate = parseInt(endDateParam, 10);
        if (isNaN(parsedEndDate)) {
          res.status(400).json({ error: 'Invalid end_date parameter. Must be a valid Unix timestamp.' });
          return;
        }
        endDate = parsedEndDate;
      }

      // Validate date range if both are provided
      if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
        res.status(400).json({ error: 'start_date cannot be greater than end_date.' });
        return;
      }

      const db = await database.getDb();
      const collection = db.collection('break_requests');

      // Build query filter
      const filter: any = {};
      if (startDate !== undefined || endDate !== undefined) {
        filter.submission_date = {};
        if (startDate !== undefined) {
          filter.submission_date.$gte = startDate;
        }
        if (endDate !== undefined) {
          filter.submission_date.$lte = endDate;
        }
      }

      // Query the database with sorting
      const breakRequests = await collection
        .find(filter)
        .sort({ submission_date: -1 })
        .toArray();

      // Transform the data to match the response format
      const breakRequestsResponse = breakRequests.map(request => ({
        id: request.request_details,
        user_id: request.user_id,
        break_type: request.break_type,
        break_duration: request.break_duration,
        submission_date: request.submission_date,
        notes: request.notes
      }));

      const response = {
        break_requests: breakRequestsResponse
      };

      res.status(200).json(response);
      return;

    } catch (e) {
      logger.error('Error retrieving break requests:', e);
      next(e);
    }
  };
  return handler;
};

export default getBreakRequests;
