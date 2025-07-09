import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';

const getStormAuthUserById = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      // Get user ID from JWT token header
      const userId = req.headers['x-storm-userid'] as string;
      
      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request headers' });
        return;
      }

      // Get the requesting user to check their role
      const requestingUser = await DataModel.User.findById(userId);
      
      if (!requestingUser) {
        res.status(404).json({ error: 'Requesting user not found' });
        return;
      }

      // Check if the requesting user has manager role
      if (requestingUser.role !== 'manager') {
        res.status(403).json({ error: 'Access denied. Manager role required.' });
        return;
      }

      // Get the target user ID from query parameters or use the requesting user's ID
      const targetUserId = req.query.user_id as string || userId;

      if (!targetUserId) {
        res.status(400).json({ error: 'Target user ID is required' });
        return;
      }

      // Get or create the storm auth user
      const stormAuthUser = await DataModel.StormAuthUser.getOrCreate(targetUserId, 'Unknown');

      // Return user info as JSON
      res.status(200).json({
        id: stormAuthUser.id,
        name: stormAuthUser.name,
        handle: stormAuthUser.handle || '',
        email: stormAuthUser.email || ''
      });
      return;

    } catch (e) {
      next(e);
    }
  };

  return handler;
};

export default getStormAuthUserById;
