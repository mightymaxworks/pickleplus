/**
 * PRODUCTION WEBHOOK SECURITY MIDDLEWARE
 * 
 * Production-ready webhook handling with persistent idempotency, database deduplication,
 * and comprehensive security validation for financial transaction processing.
 * 
 * Version: 1.0.0 - Sprint 1: Security Hardening
 * Last Updated: September 17, 2025
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import postgres from "postgres";

// Import webhook events table (will be added to schema)
import { webhookEvents, type InsertWebhookEvent } from "../../shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = postgres(connectionString);
const db = drizzle(sql_client);

interface SecureWebhookRequest extends Request {
  rawBody?: Buffer;
  wiseEvent?: {
    eventId: string;
    type: string;
    resource: any;
    timestamp: string;
    verified: boolean;
  };
  webhookRecord?: any;
}

/**
 * PRODUCTION: Raw body parser middleware with proper ordering
 * CRITICAL: Must be registered BEFORE any JSON body parsers
 */
export function parseWebhookRawBody() {
  return (req: SecureWebhookRequest, res: Response, next: NextFunction) => {
    // Only process webhook paths
    if (!req.path.includes('/webhooks/wise')) {
      return next();
    }

    // Check if body was already parsed by express.json()
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      console.error('[WEBHOOK SECURITY] Body already parsed - raw body not available for signature verification');
      return res.status(400).json({ error: 'Raw body required for webhook signature verification' });
    }

    let rawBody = Buffer.alloc(0);
    
    req.on('data', (chunk: Buffer) => {
      rawBody = Buffer.concat([rawBody, chunk]);
    });
    
    req.on('end', () => {
      try {
        req.rawBody = rawBody;
        req.body = JSON.parse(rawBody.toString());
        next();
      } catch (error) {
        console.error('[WEBHOOK SECURITY] Invalid JSON payload:', error);
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    });
    
    req.on('error', (error) => {
      console.error('[WEBHOOK SECURITY] Raw body parsing error:', error);
      return res.status(400).json({ error: 'Payload parsing failed' });
    });
  };
}

/**
 * PRODUCTION: Wise webhook signature verification with enhanced security
 * CRITICAL: Validates HMAC-SHA256 signatures according to Wise documentation
 */
export function verifyWiseWebhookSignature() {
  return async (req: SecureWebhookRequest, res: Response, next: NextFunction) => {
    if (!req.path.includes('/webhooks/wise')) {
      return next();
    }

    try {
      const signature = req.headers['x-wise-signature'] as string;
      const timestamp = req.headers['x-wise-timestamp'] as string;
      const wiseSecret = process.env.WISE_WEBHOOK_SECRET;

      // Enhanced validation
      if (!signature || !signature.startsWith('sha256=')) {
        console.error('[WEBHOOK SECURITY] Invalid or missing x-wise-signature header');
        return res.status(401).json({ error: 'Invalid signature format' });
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

      if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > maxAge) {
        console.error('[WEBHOOK SECURITY] Invalid or expired timestamp:', {
          requestTime,
          currentTime,
          diff: Math.abs(currentTime - requestTime)
        });
        return res.status(401).json({ error: 'Invalid or expired timestamp' });
      }

      // Create HMAC signature for verification (Wise format: timestamp + raw body)
      const signaturePayload = timestamp + req.rawBody.toString();
      const expectedSignature = crypto
        .createHmac('sha256', wiseSecret)
        .update(signaturePayload)
        .digest('hex');

      // Extract signature from header
      const receivedSignature = signature.replace('sha256=', '');

      // Secure comparison to prevent timing attacks
      const isValidSignature = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );

      if (!isValidSignature) {
        console.error('[WEBHOOK SECURITY] Signature verification failed:', {
          expectedPrefix: expectedSignature.substring(0, 8),
          receivedPrefix: receivedSignature.substring(0, 8),
          timestampUsed: timestamp,
          payloadLength: req.rawBody.length
        });
        return res.status(401).json({ error: 'Signature verification failed' });
      }

      // Parse and validate event structure
      const event = req.body;
      if (!event || !event.type || !event.resource) {
        console.error('[WEBHOOK SECURITY] Invalid event structure:', event);
        return res.status(400).json({ error: 'Invalid event structure' });
      }

      // Store validated event data
      req.wiseEvent = {
        eventId: event.id || `${event.type}_${event.resource.id}_${timestamp}`,
        type: event.type,
        resource: event.resource,
        timestamp,
        verified: true
      };
      
      console.log('[WEBHOOK SECURITY] Signature verified successfully:', {
        eventId: req.wiseEvent.eventId,
        eventType: event.type,
        resourceId: event.resource.id
      });

      next();

    } catch (error) {
      console.error('[WEBHOOK SECURITY] Signature verification error:', error);
      return res.status(500).json({ error: 'Signature verification failed' });
    }
  };
}

/**
 * PRODUCTION: Persistent idempotency with database storage
 * CRITICAL: Prevents duplicate event processing across restarts and instances
 */
export function ensurePersistentIdempotency() {
  return async (req: SecureWebhookRequest, res: Response, next: NextFunction) => {
    if (!req.path.includes('/webhooks/wise') || !req.wiseEvent) {
      return next();
    }

    const { eventId, type, resource } = req.wiseEvent;

    try {
      // Check if event already exists using database transaction
      const result = await db.transaction(async (tx) => {
        // Look for existing event
        const existingEvents = await tx
          .select()
          .from(webhookEvents)
          .where(eq(webhookEvents.eventId, eventId))
          .limit(1);

        if (existingEvents.length > 0) {
          const existingEvent = existingEvents[0];
          console.log('[WEBHOOK SECURITY] Duplicate event detected:', {
            eventId,
            existingStatus: existingEvent.processingStatus,
            existingTimestamp: existingEvent.createdAt
          });

          // Return duplicate status with proper response
          return {
            isDuplicate: true,
            existingEvent
          };
        }

        // Create new webhook event record
        const newEventData: InsertWebhookEvent = {
          eventId,
          eventType: type,
          provider: 'wise',
          payload: req.body,
          signatureVerified: true,
          processingStatus: 'received'
        };

        const createdEvents = await tx
          .insert(webhookEvents)
          .values(newEventData)
          .returning();

        return {
          isDuplicate: false,
          webhookRecord: createdEvents[0]
        };
      });

      if (result.isDuplicate) {
        // Respond with success for duplicate events (idempotent)
        return res.status(200).json({
          message: 'Event already processed',
          eventId,
          status: 'duplicate',
          originalTimestamp: result.existingEvent?.createdAt
        });
      }

      // Store webhook record for processing
      req.webhookRecord = result.webhookRecord;
      
      console.log('[WEBHOOK SECURITY] New event registered for processing:', {
        eventId,
        recordId: result.webhookRecord?.id
      });

      next();

    } catch (error) {
      console.error('[WEBHOOK SECURITY] Idempotency check failed:', error);
      return res.status(500).json({ 
        error: 'Event deduplication failed',
        eventId
      });
    }
  };
}

/**
 * PRODUCTION: Mark webhook event as processing
 * CRITICAL: Updates status to prevent concurrent processing
 */
export function markEventProcessing() {
  return async (req: SecureWebhookRequest, res: Response, next: NextFunction) => {
    if (!req.webhookRecord) {
      return next();
    }

    try {
      await db
        .update(webhookEvents)
        .set({
          processingStatus: 'processing',
          updatedAt: new Date()
        })
        .where(eq(webhookEvents.id, req.webhookRecord.id));

      console.log('[WEBHOOK SECURITY] Event marked as processing:', req.wiseEvent?.eventId);
      next();

    } catch (error) {
      console.error('[WEBHOOK SECURITY] Failed to mark event as processing:', error);
      return res.status(500).json({ 
        error: 'Event status update failed',
        eventId: req.wiseEvent?.eventId
      });
    }
  };
}

/**
 * PRODUCTION: Complete webhook event processing
 * CRITICAL: Updates status and timestamp after successful processing
 */
export async function markEventCompleted(eventId: string, success: boolean = true) {
  try {
    await db
      .update(webhookEvents)
      .set({
        processingStatus: success ? 'completed' : 'failed',
        processedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(webhookEvents.eventId, eventId));

    console.log(`[WEBHOOK SECURITY] Event marked as ${success ? 'completed' : 'failed'}:`, eventId);

  } catch (error) {
    console.error('[WEBHOOK SECURITY] Failed to mark event completion:', error);
  }
}