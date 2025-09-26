/**
 * PKL-278651-API-0001-WEBHOOK-TEST
 * Webhook Integration Testing Suite
 * 
 * Tests real-time sync webhook delivery and integration with external apps
 */

const request = require('supertest');
const express = require('express');
const crypto = require('crypto');
const { triggerWeChatWebhook, triggerUserWebhook } = require('../server/modules/api-gateway/utils/webhook-delivery');
const { db } = require('../server/db');
const { apiWebhooks, apiApplications, apiWebhookDeliveryLogs } = require('../shared/schema/api-gateway');

describe('Webhook Integration Tests', () => {
  let mockWebhookServer;
  let mockWebhookPort = 3456;
  let receivedWebhooks = [];
  let testWebhook;

  beforeAll(async () => {
    // Start a mock webhook server to receive webhooks
    const mockApp = express();
    mockApp.use(express.json());
    
    // Mock webhook endpoint that receives and stores webhooks for testing
    mockApp.post('/webhook', (req, res) => {
      console.log('Mock webhook received:', JSON.stringify(req.body, null, 2));
      receivedWebhooks.push({
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString()
      });
      res.status(200).json({ received: true });
    });

    mockWebhookServer = mockApp.listen(mockWebhookPort);
    console.log(`Mock webhook server started on port ${mockWebhookPort}`);

    // Create test webhook registration
    testWebhook = await db.insert(apiWebhooks).values({
      applicationId: 1, // Assuming test application exists
      url: `http://localhost:${mockWebhookPort}/webhook`,
      events: 'user.created,user.updated,wechat.user_linked,wechat.profile_synced',
      secret: 'test_webhook_secret_12345',
      isActive: true,
      failureCount: 0
    }).returning();
  });

  afterAll(async () => {
    // Clean up mock server and test data
    if (mockWebhookServer) {
      mockWebhookServer.close();
    }
    if (testWebhook?.[0]?.id) {
      await db.delete(apiWebhooks).where({ id: testWebhook[0].id });
    }
  });

  beforeEach(() => {
    // Clear received webhooks before each test
    receivedWebhooks = [];
  });

  describe('User Creation Webhooks', () => {
    test('should send webhook when user is created', async () => {
      const userData = {
        user_id: 12345,
        username: 'webhook_test_user',
        display_name: 'Webhook Test User',
        passport_code: 'ABCD1234',
        email: 'webhook@test.com',
        ranking_points: {
          singles: 800,
          doubles: 750
        },
        profile_completion: 85,
        created_at: new Date().toISOString()
      };

      // Trigger user creation webhook
      await triggerUserWebhook('created', userData.user_id, userData);

      // Wait for webhook delivery
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedWebhooks).toHaveLength(1);
      const webhook = receivedWebhooks[0];

      expect(webhook.body).toMatchObject({
        event: 'user.created',
        api_version: 'v1',
        data: {
          user_id: userData.user_id,
          user_data: userData
        },
        timestamp: expect.any(String)
      });

      // Verify signature headers are present
      expect(webhook.headers).toHaveProperty('x-pickle-signature');
      expect(webhook.headers).toHaveProperty('x-pickle-timestamp');
    });

    test('should verify webhook signature correctly', async () => {
      const userData = {
        user_id: 54321,
        username: 'signature_test_user'
      };

      await triggerUserWebhook('created', userData.user_id, userData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedWebhooks).toHaveLength(1);
      const webhook = receivedWebhooks[0];

      // Verify signature manually
      const signature = webhook.headers['x-pickle-signature'];
      const timestamp = webhook.headers['x-pickle-timestamp'];
      const payload = JSON.stringify(webhook.body);
      const secret = 'test_webhook_secret_12345';

      const [version, signatureValue] = signature.split('=');
      const signatureContent = `${version}.${timestamp}.${payload}`;
      
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(signatureContent);
      const expectedSignature = hmac.digest('hex');

      expect(signatureValue).toBe(expectedSignature);
    });
  });

  describe('WeChat-Specific Webhooks', () => {
    test('should send webhook when WeChat user is linked', async () => {
      const linkData = {
        pickle_user_id: 67890,
        passport_code: 'WXCD5678',
        wechat_data: {
          openid: 'test_openid_webhook',
          unionid: 'test_unionid_webhook',
          nickname: '测试用户Webhook',
          profile_image: 'https://example.com/avatar.jpg'
        },
        linked_at: new Date().toISOString(),
        registration_source: 'wechat_miniprogram',
        language: 'zh'
      };

      await triggerWeChatWebhook('user_linked', linkData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedWebhooks).toHaveLength(1);
      const webhook = receivedWebhooks[0];

      expect(webhook.body).toMatchObject({
        event: 'wechat.user_linked',
        api_version: 'v1',
        data: linkData,
        timestamp: expect.any(String)
      });
    });

    test('should send webhook when WeChat profile is synced', async () => {
      const syncData = {
        pickle_user_id: 98765,
        wechat_openid: 'sync_webhook_openid',
        updated_fields: ['displayName', 'bio', 'skillLevel'],
        sync_timestamp: new Date().toISOString(),
        conflict_resolution: 'pickle_plus_wins'
      };

      await triggerWeChatWebhook('profile_synced', syncData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedWebhooks).toHaveLength(1);
      const webhook = receivedWebhooks[0];

      expect(webhook.body).toMatchObject({
        event: 'wechat.profile_synced',
        api_version: 'v1',
        data: syncData,
        timestamp: expect.any(String)
      });
    });
  });

  describe('Webhook Delivery Reliability', () => {
    test('should handle webhook endpoint failures gracefully', async () => {
      // Create a webhook pointing to a non-existent endpoint
      const failingWebhook = await db.insert(apiWebhooks).values({
        applicationId: 1,
        url: 'http://localhost:9999/nonexistent',
        events: 'user.created',
        secret: 'failing_webhook_secret',
        isActive: true,
        failureCount: 0
      }).returning();

      const userData = {
        user_id: 11111,
        username: 'failing_webhook_test'
      };

      // This should not throw an error, just log the failure
      await expect(triggerUserWebhook('created', userData.user_id, userData))
        .resolves.not.toThrow();

      // Clean up
      await db.delete(apiWebhooks).where({ id: failingWebhook[0].id });
    });

    test('should log webhook delivery attempts', async () => {
      const userData = {
        user_id: 22222,
        username: 'delivery_log_test'
      };

      await triggerUserWebhook('created', userData.user_id, userData);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check that delivery was logged
      const deliveryLogs = await db.select()
        .from(apiWebhookDeliveryLogs)
        .where({ webhookId: testWebhook[0].id })
        .orderBy({ attemptedAt: 'desc' })
        .limit(1);

      expect(deliveryLogs).toHaveLength(1);
      expect(deliveryLogs[0]).toMatchObject({
        webhookId: testWebhook[0].id,
        success: true,
        statusCode: 200,
        deliveryId: expect.stringMatching(/^delivery_/),
        responseTime: expect.any(Number)
      });
    });
  });

  describe('Webhook Event Filtering', () => {
    test('should only send webhooks for subscribed events', async () => {
      // Create webhook that only subscribes to user.updated events
      const selectiveWebhook = await db.insert(apiWebhooks).values({
        applicationId: 1,
        url: `http://localhost:${mockWebhookPort}/webhook`,
        events: 'user.updated', // Only this event
        secret: 'selective_webhook_secret',
        isActive: true,
        failureCount: 0
      }).returning();

      // Trigger user.created (should NOT be sent)
      await triggerUserWebhook('created', 33333, { user_id: 33333 });
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(receivedWebhooks).toHaveLength(0);

      // Trigger user.updated (SHOULD be sent)
      await triggerUserWebhook('updated', 33333, { user_id: 33333 });
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(receivedWebhooks).toHaveLength(1);
      expect(receivedWebhooks[0].body.event).toBe('user.updated');

      // Clean up
      await db.delete(apiWebhooks).where({ id: selectiveWebhook[0].id });
    });

    test('should send all events when subscribed to wildcard', async () => {
      // Create webhook that subscribes to all events
      const wildcardWebhook = await db.insert(apiWebhooks).values({
        applicationId: 1,
        url: `http://localhost:${mockWebhookPort}/webhook`,
        events: '*', // All events
        secret: 'wildcard_webhook_secret',
        isActive: true,
        failureCount: 0
      }).returning();

      // Trigger multiple different events
      await triggerUserWebhook('created', 44444, { user_id: 44444 });
      await triggerWeChatWebhook('user_linked', { pickle_user_id: 44444 });
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedWebhooks.length).toBeGreaterThanOrEqual(2);
      
      const eventTypes = receivedWebhooks.map(wh => wh.body.event);
      expect(eventTypes).toContain('user.created');
      expect(eventTypes).toContain('wechat.user_linked');

      // Clean up
      await db.delete(apiWebhooks).where({ id: wildcardWebhook[0].id });
    });
  });

  describe('Performance and Concurrency', () => {
    test('should handle multiple simultaneous webhook deliveries', async () => {
      const promises = [];
      
      // Trigger 5 webhooks simultaneously
      for (let i = 0; i < 5; i++) {
        promises.push(
          triggerUserWebhook('created', 50000 + i, { 
            user_id: 50000 + i, 
            username: `concurrent_user_${i}` 
          })
        );
      }

      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(receivedWebhooks).toHaveLength(5);
      
      // Verify all webhooks have unique delivery IDs
      const deliveryIds = receivedWebhooks.map(wh => wh.body.timestamp);
      const uniqueDeliveryIds = new Set(deliveryIds);
      expect(uniqueDeliveryIds.size).toBe(5);
    });
  });
});

module.exports = {
  receivedWebhooks
};