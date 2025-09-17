/**
 * WISE WEBHOOK SECURITY MIDDLEWARE
 * 
 * Implements secure webhook handling with signature verification and raw body parsing
 * for Wise payment integrations following production security standards.
 * 
 * Version: 1.0.0 - Sprint 1: Foundation & Digital Currency Core
 * Last Updated: September 17, 2025
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface WebhookRequest extends Request {
  rawBody?: Buffer;
  wiseSignatureValid?: boolean;
  wiseEvent?: any;
}

/**
 * Raw body parser middleware for webhook signature verification
 * CRITICAL: Required for HMAC signature validation
 */
export function parseRawBody() {
  return (req: WebhookRequest, res: Response, next: NextFunction) => {
    if (req.path.includes('/webhooks/wise')) {
      let rawBody = Buffer.alloc(0);
      
      req.on('data', (chunk: Buffer) => {
        rawBody = Buffer.concat([rawBody, chunk]);
      });
      
      req.on('end', () => {
        req.rawBody = rawBody;
        try {
          req.body = JSON.parse(rawBody.toString());
        } catch (error) {
          console.error('[WEBHOOK SECURITY] Invalid JSON payload');
          return res.status(400).json({ error: 'Invalid JSON payload' });
        }
        next();
      });
      
      req.on('error', (error) => {
        console.error('[WEBHOOK SECURITY] Raw body parsing error:', error);
        return res.status(400).json({ error: 'Payload parsing failed' });
      });
    } else {
      next();
    }
  };
}

/**
 * Wise webhook signature verification middleware
 * CRITICAL: Validates HMAC-SHA256 signatures from Wise
 */
export function verifyWiseSignature() {
  return (req: WebhookRequest, res: Response, next: NextFunction) => {
    if (!req.path.includes('/webhooks/wise')) {
      return next();
    }

    try {
      const signature = req.headers['x-wise-signature'] as string;
      const timestamp = req.headers['x-wise-timestamp'] as string;
      const wiseSecret = process.env.WISE_WEBHOOK_SECRET;

      // Validate required headers
      if (!signature) {
        console.error('[WEBHOOK SECURITY] Missing x-wise-signature header');
        return res.status(401).json({ error: 'Missing signature header' });
      }

      if (!timestamp) {
        console.error('[WEBHOOK SECURITY] Missing x-wise-timestamp header');
        return res.status(401).json({ error: 'Missing timestamp header' });
      }

      if (!wiseSecret) {
        console.error('[WEBHOOK SECURITY] WISE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }

      if (!req.rawBody) {
        console.error('[WEBHOOK SECURITY] Raw body not available for signature verification');
        return res.status(400).json({ error: 'Raw body required for verification' });
      }

      // Validate timestamp (prevent replay attacks)
      const requestTime = parseInt(timestamp);
      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = 300; // 5 minutes tolerance

      if (Math.abs(currentTime - requestTime) > maxAge) {
        console.error('[WEBHOOK SECURITY] Request timestamp too old:', {
          requestTime,
          currentTime,
          diff: Math.abs(currentTime - requestTime)
        });
        return res.status(401).json({ error: 'Request timestamp too old' });
      }

      // Create HMAC signature for verification
      const expectedSignature = crypto
        .createHmac('sha256', wiseSecret)
        .update(timestamp + req.rawBody.toString())
        .digest('hex');

      // Extract signature from header (format: "sha256=<signature>")
      const receivedSignature = signature.replace('sha256=', '');

      // Secure comparison to prevent timing attacks
      const isValidSignature = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );

      if (!isValidSignature) {
        console.error('[WEBHOOK SECURITY] Invalid signature:', {
          received: receivedSignature.substring(0, 8) + '...',
          expected: expectedSignature.substring(0, 8) + '...',
          timestampUsed: timestamp
        });
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Signature verified successfully
      req.wiseSignatureValid = true;
      req.wiseEvent = req.body;
      
      console.log('[WEBHOOK SECURITY] Signature verified successfully for event:', req.body.type);
      next();

    } catch (error) {
      console.error('[WEBHOOK SECURITY] Signature verification error:', error);
      return res.status(500).json({ error: 'Signature verification failed' });
    }
  };
}

/**
 * Webhook idempotency middleware
 * CRITICAL: Prevents duplicate event processing
 */
export function ensureIdempotency() {
  const processedEvents = new Set<string>(); // In production, use Redis or database
  
  return (req: WebhookRequest, res: Response, next: NextFunction) => {
    if (!req.path.includes('/webhooks/wise')) {
      return next();
    }

    const eventId = req.wiseEvent?.event_id || req.wiseEvent?.id;
    if (!eventId) {
      console.error('[WEBHOOK SECURITY] Missing event ID for idempotency check');
      return res.status(400).json({ error: 'Event ID required' });
    }

    if (processedEvents.has(eventId)) {
      console.log('[WEBHOOK SECURITY] Duplicate event ignored:', eventId);
      return res.status(200).json({ 
        message: 'Event already processed',
        eventId,
        status: 'duplicate'
      });
    }

    // Mark event as being processed
    processedEvents.add(eventId);
    req.wiseEvent.eventId = eventId;
    
    // Set cleanup for memory management (in production, use proper storage)
    setTimeout(() => {
      processedEvents.delete(eventId);
    }, 24 * 60 * 60 * 1000); // 24 hours

    next();
  };
}