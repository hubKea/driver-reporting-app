import bcrypt from 'bcrypt';
import type express from 'express';
import * as DataModel from '../datamodel';
import logger from '../utils/logger';

const loginHandler = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    // --- Definitive Logging Step 1: Check the request body ---
    logger.info(`Login attempt with body: ${JSON.stringify(req.body)}`);
    
    const { username, password } = req.body;

    if (!username || !password) {
      // 'return' keyword removed from this line
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    try {
      const user = await DataModel.User.findByUsername(username);

      // --- Definitive Logging Step 2: Check if the user was found ---
      if (!user) {
        logger.error(`Login failed: User '${username}' not found in database.`);
        // 'return' keyword removed from this line
        res.status(401).json({ error: 'Invalid username or password.' });
        return;
      }
      logger.info(`Login check: Found user '${user.username}' with role '${user.role}'.`);

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        logger.error(`Login failed: Invalid password for user '${username}'.`);
        // 'return' keyword removed from this line
        res.status(401).json({ error: 'Invalid username or password.' });
        return;
      }
      
      if (user.role !== 'manager') {
        logger.error(`Login failed: User '${username}' is not a manager.`);
        // 'return' keyword removed from this line
        res.status(403).json({ error: 'Access denied. Only managers can log in.' });
        return;
      }

      const token = `fake-session-token-for-user-${user.id}`;
      logger.info(`Manager logged in successfully: ${username}`);
      res.status(200).json({ token: token });

    } catch (e) {
      logger.error('An unexpected error occurred during login:', e);
      next(e);
    }
  };
  return handler;
};

export default loginHandler;