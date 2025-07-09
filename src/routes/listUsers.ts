import type { Request, Response, NextFunction } from 'express';
import database from '../utils/database';

// Debug route to list all users in the database
const listUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await database.getDb();
    const users = await db.collection('users').find({}).toArray();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users', details: e });
    next(e);
  }
};

export default listUsersHandler;
