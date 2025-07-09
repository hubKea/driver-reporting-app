import type express from 'express';
import logger from '../utils/logger';
import * as DataModel from '../datamodel';
import { database } from '../utils/database';

const getCurrentStormAuthUser = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      // Get user ID from JWT token header
      const userId = req.headers['x-storm-userid'] as string;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Find the user to check their role
      const user = await DataModel.User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if user has manager role
      if (user.role !== 'manager') {
        res.status(403).json({ error: 'Access denied. Manager role required' });
        return;
      }

      // Get or create the StormAuthUser
      const stormAuthUser = await DataModel.StormAuthUser.getOrCreate(userId, user.name);
      if (!stormAuthUser) {
        res.status(500).json({ error: 'Failed to retrieve user information' });
        return;
      }

      // Return user info as JSON
      res.status(200).json({
        id: stormAuthUser.id,
        name: stormAuthUser.name,
        handle: stormAuthUser.handle,
        email: stormAuthUser.email
      });
      return;
    } catch (e) {
      next(e);
    }
  };
  return handler;
};

export default getCurrentStormAuthUser;
