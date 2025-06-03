/**
 * Anti-Gaming Middleware for Pickle Points System
 * 
 * Middleware that automatically validates all point-earning activities
 * to prevent manipulation and gaming of the system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import { Request, Response, NextFunction } from 'express';
import { AntiGamingService } from '../services/anti-gaming';
import { storage } from '../storage';

export interface AntiGamingRequest extends Request {
  antiGaming?: {
    validated: boolean;
    suspiciousScore: number;
    reason?: string;
  };
}

/**
 * Middleware to validate match submissions
 */
export async function validateMatchSubmission(
  req: AntiGamingRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const recentMatches = await storage.getMatchesByUser(userId, 20, 0, userId);
    
    const validation = AntiGamingService.validateMatchSubmission(
      userId,
      req.body,
      recentMatches
    );

    // Attach validation results to request
    req.antiGaming = {
      validated: validation.isValid,
      suspiciousScore: validation.suspiciousScore,
      reason: validation.reason
    };

    if (!validation.isValid) {
      console.log(`[ANTI-GAMING] Blocked match submission from user ${userId}: ${validation.reason}`);
      
      // Flag highly suspicious users
      if (validation.suspiciousScore >= 85) {
        AntiGamingService.flagSuspiciousUser(userId, validation.reason || 'High suspicious score');
      }
      
      return res.status(400).json({
        success: false,
        message: validation.reason || "Match submission failed validation",
        code: 'ANTI_GAMING_VIOLATION',
        suspiciousScore: validation.suspiciousScore
      });
    }

    // Log suspicious but allowed activity
    if (validation.suspiciousScore >= 50) {
      console.log(`[ANTI-GAMING] Warning - Suspicious activity from user ${userId}, score: ${validation.suspiciousScore}`);
    }

    next();
  } catch (error) {
    console.error('[ANTI-GAMING] Error in match validation middleware:', error);
    next(); // Allow request to continue if validation fails
  }
}

/**
 * Middleware to validate profile updates
 */
export async function validateProfileUpdate(
  req: AntiGamingRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const currentUser = await storage.getUser(userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validation = AntiGamingService.validateProfileUpdate(
      userId,
      currentUser.profileCompletionPct || 0,
      req.body.profileCompletionPct || 0,
      req.body
    );

    req.antiGaming = {
      validated: validation.isValid,
      suspiciousScore: validation.suspiciousScore,
      reason: validation.reason
    };

    if (!validation.isValid) {
      console.log(`[ANTI-GAMING] Blocked profile update from user ${userId}: ${validation.reason}`);
      
      return res.status(400).json({
        success: false,
        message: validation.reason || "Profile update failed validation",
        code: 'ANTI_GAMING_VIOLATION',
        suspiciousScore: validation.suspiciousScore
      });
    }

    next();
  } catch (error) {
    console.error('[ANTI-GAMING] Error in profile validation middleware:', error);
    next(); // Allow request to continue if validation fails
  }
}

/**
 * Middleware to validate point-earning activities
 */
export async function validatePointsActivity(
  req: AntiGamingRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const activityType = req.body.activityType || 'general';
    const pointsRequested = req.body.pointsRequested || 0;

    const validation = AntiGamingService.validatePointsActivity(
      userId,
      activityType,
      pointsRequested,
      req.body.metadata
    );

    req.antiGaming = {
      validated: validation.isValid,
      suspiciousScore: validation.suspiciousScore,
      reason: validation.reason
    };

    if (!validation.isValid) {
      console.log(`[ANTI-GAMING] Blocked points activity from user ${userId}: ${validation.reason}`);
      
      return res.status(400).json({
        success: false,
        message: validation.reason || "Points activity failed validation",
        code: 'ANTI_GAMING_VIOLATION',
        suspiciousScore: validation.suspiciousScore
      });
    }

    next();
  } catch (error) {
    console.error('[ANTI-GAMING] Error in points validation middleware:', error);
    next(); // Allow request to continue if validation fails
  }
}

/**
 * Rate limiting middleware for API endpoints
 */
export function rateLimitByActivity(maxAttempts: number, windowMinutes: number) {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const key = `${userId}_${req.route?.path || req.path}`;

    const userAttempts = attempts.get(key);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or initialize counter
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      console.log(`[RATE-LIMIT] User ${userId} exceeded rate limit for ${req.path}`);
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please try again later.",
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
      });
    }

    userAttempts.count++;
    next();
  };
}

/**
 * IP-based detection middleware (basic implementation)
 */
export function detectSuspiciousIPs(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Basic IP analysis
  if (clientIP === '127.0.0.1' || clientIP === '::1') {
    // Localhost - potentially development environment
    req.headers['x-development-mode'] = 'true';
  }

  // Log for potential analysis
  if (req.user) {
    console.log(`[IP-TRACKING] User ${req.user.id} from IP ${clientIP} with UA: ${userAgent.substring(0, 50)}`);
  }

  next();
}