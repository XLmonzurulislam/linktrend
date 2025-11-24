import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Re-fetch user from database to check if this is the admin user
    const user = await storage.getUserById(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if this is the admin system user
    if (user.email !== 'admin@system.local') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
