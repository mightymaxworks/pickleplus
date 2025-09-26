/**
 * PKL-278651-API-0001-SYNC
 * Webhook Delivery System
 * 
 * Handles real-time sync by sending webhooks to external apps when data changes.
 */

import axios from 'axios';
import { db } from '../../../db';
import { eq, and } from 'drizzle-orm';
import { apiWebhooks, apiWebhookDeliveryLogs, apiApplications } from '../../../../shared/schema/api-gateway';
import { getWebhookSignatureHeaders } from './webhook-signature';

// Define webhook event types for real-time sync
export const WEBHOOK_EVENTS = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_RANKING_CHANGED: 'user.ranking_changed',
  
  // Match events  
  MATCH_COMPLETED: 'match.completed',
  MATCH_RANKINGS_UPDATED: 'match.rankings_updated',
  
  // Tournament events
  TOURNAMENT_JOINED: 'tournament.joined',
  TOURNAMENT_RESULT: 'tournament.result',
  
  // WeChat specific events
  WECHAT_USER_LINKED: 'wechat.user_linked',
  WECHAT_PROFILE_SYNCED: 'wechat.profile_synced'
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: any;
  api_version: string;
}

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhook(
  eventType: WebhookEventType,
  data: any,
  applicationId?: number
): Promise<void> {
  try {
    console.log(`[WEBHOOK] Triggering webhook event: ${eventType}`);
    
    // Get all webhooks subscribed to this event
    let webhooksQuery = db.select({
      id: apiWebhooks.id,
      applicationId: apiWebhooks.applicationId,
      url: apiWebhooks.url,
      secret: apiWebhooks.secret,
      events: apiWebhooks.events,
      isActive: apiWebhooks.isActive
    })
    .from(apiWebhooks)
    .where(apiWebhooks.isActive.eq(true));
    
    // Filter by application if specified
    if (applicationId) {
      webhooksQuery = webhooksQuery.where(
        and(
          eq(apiWebhooks.applicationId, applicationId),
          apiWebhooks.isActive.eq(true)
        )
      );
    }
    
    const webhooks = await webhooksQuery;
    
    if (webhooks.length === 0) {
      console.log(`[WEBHOOK] No active webhooks found for event: ${eventType}`);
      return;
    }
    
    // Filter webhooks that are subscribed to this event
    const subscribedWebhooks = webhooks.filter(webhook => {
      const events = webhook.events ? webhook.events.split(',') : [];
      return events.includes(eventType) || events.includes('*'); // '*' means all events
    });
    
    if (subscribedWebhooks.length === 0) {
      console.log(`[WEBHOOK] No webhooks subscribed to event: ${eventType}`);
      return;
    }
    
    // Prepare webhook payload
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
      api_version: 'v1'
    };
    
    // Send webhooks to all subscribers
    const deliveryPromises = subscribedWebhooks.map(webhook => 
      deliverWebhook(webhook, payload)
    );
    
    await Promise.allSettled(deliveryPromises);
    
    console.log(`[WEBHOOK] Delivered ${subscribedWebhooks.length} webhooks for event: ${eventType}`);
    
  } catch (error) {
    console.error(`[WEBHOOK] Error triggering webhook for event ${eventType}:`, error);
  }
}

/**
 * Deliver a single webhook to an endpoint
 */
async function deliverWebhook(
  webhook: {
    id: number;
    applicationId: number;
    url: string;
    secret: string | null;
    events: string | null;
  },
  payload: WebhookPayload
): Promise<void> {
  const deliveryId = `delivery_${Date.now()}_${webhook.id}`;
  
  try {
    console.log(`[WEBHOOK] Delivering webhook ${deliveryId} to ${webhook.url}`);
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Pickle+ Webhook/1.0'
    };
    
    // Add signature headers if secret is provided
    if (webhook.secret) {
      const signatureHeaders = getWebhookSignatureHeaders(payload, webhook.secret);
      Object.assign(headers, signatureHeaders);
    }
    
    // Make the webhook request
    const startTime = Date.now();
    const response = await axios.post(webhook.url, payload, {
      headers,
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status >= 200 && status < 300
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log successful delivery
    await logWebhookDelivery({
      webhookId: webhook.id,
      deliveryId,
      success: true,
      statusCode: response.status,
      responseTime: duration,
      payload: JSON.stringify(payload),
      response: JSON.stringify(response.data),
      error: null
    });
    
    console.log(`[WEBHOOK] Successfully delivered webhook ${deliveryId} (${duration}ms)`);
    
  } catch (error: any) {
    console.error(`[WEBHOOK] Failed to deliver webhook ${deliveryId}:`, error.message);
    
    // Log failed delivery
    await logWebhookDelivery({
      webhookId: webhook.id,
      deliveryId,
      success: false,
      statusCode: error.response?.status || null,
      responseTime: null,
      payload: JSON.stringify(payload),
      response: error.response?.data ? JSON.stringify(error.response.data) : null,
      error: error.message
    });
    
    // Update webhook failure count
    await updateWebhookFailureCount(webhook.id);
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(log: {
  webhookId: number;
  deliveryId: string;
  success: boolean;
  statusCode: number | null;
  responseTime: number | null;
  payload: string;
  response: string | null;
  error: string | null;
}): Promise<void> {
  try {
    await db.insert(apiWebhookDeliveryLogs).values({
      webhookId: log.webhookId,
      deliveryId: log.deliveryId,
      success: log.success,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
      payload: log.payload,
      response: log.response,
      error: log.error,
      attemptedAt: new Date()
    });
  } catch (error) {
    console.error('[WEBHOOK] Failed to log webhook delivery:', error);
  }
}

/**
 * Update webhook failure count
 */
async function updateWebhookFailureCount(webhookId: number): Promise<void> {
  try {
    // Get current failure count
    const webhook = await db.select({
      failureCount: apiWebhooks.failureCount
    })
    .from(apiWebhooks)
    .where(eq(apiWebhooks.id, webhookId))
    .limit(1);
    
    if (webhook.length === 0) return;
    
    const newFailureCount = (webhook[0].failureCount || 0) + 1;
    
    // Update failure count and last failure time
    await db.update(apiWebhooks)
      .set({
        failureCount: newFailureCount,
        lastFailure: new Date(),
        // Disable webhook after 10 consecutive failures
        isActive: newFailureCount < 10
      })
      .where(eq(apiWebhooks.id, webhookId));
    
    if (newFailureCount >= 10) {
      console.warn(`[WEBHOOK] Webhook ${webhookId} disabled after 10 consecutive failures`);
    }
    
  } catch (error) {
    console.error('[WEBHOOK] Failed to update webhook failure count:', error);
  }
}

/**
 * Trigger user-related webhooks
 */
export async function triggerUserWebhook(
  eventType: 'created' | 'updated' | 'ranking_changed',
  userId: number,
  userData: any,
  applicationId?: number
): Promise<void> {
  const eventMap = {
    created: WEBHOOK_EVENTS.USER_CREATED,
    updated: WEBHOOK_EVENTS.USER_UPDATED,
    ranking_changed: WEBHOOK_EVENTS.USER_RANKING_CHANGED
  };
  
  await triggerWebhook(eventMap[eventType], {
    user_id: userId,
    user_data: userData
  }, applicationId);
}

/**
 * Trigger WeChat-specific webhooks
 */
export async function triggerWeChatWebhook(
  eventType: 'user_linked' | 'profile_synced',
  data: any,
  applicationId?: number
): Promise<void> {
  const eventMap = {
    user_linked: WEBHOOK_EVENTS.WECHAT_USER_LINKED,
    profile_synced: WEBHOOK_EVENTS.WECHAT_PROFILE_SYNCED
  };
  
  await triggerWebhook(eventMap[eventType], data, applicationId);
}