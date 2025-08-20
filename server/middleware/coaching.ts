/**
 * Coaching middleware for authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      coachLevel?: number | null;
      isCoach?: boolean;
    }
  }
}

/**
 * Middleware to require a minimum coach level
 */
export function requireCoachLevel(minLevel: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const coachLevel = user.coachLevel || 0;
    if (coachLevel < minLevel) {
      return res.status(403).json({ 
        message: `Coach level L${minLevel}+ required. Current level: L${coachLevel}`,
        requiredLevel: minLevel,
        currentLevel: coachLevel
      });
    }

    next();
  };
}

/**
 * Middleware to require coach status
 */
export function requireCoach(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const coachLevel = user.coachLevel || 0;
  if (coachLevel < 1) {
    return res.status(403).json({ 
      message: 'Coach certification required',
      currentLevel: coachLevel
    });
  }

  next();
}