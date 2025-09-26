/**
 * PKL-278651-API-0001-TEST
 * WeChat Integration API Testing Suite
 * 
 * Comprehensive tests for WeChat API endpoints ensuring reliability for external developers
 */

const request = require('supertest');
const { app } = require('../server/server');
const { db } = require('../server/db');
const { eq } = require('drizzle-orm');
const { users, apiApplications, apiKeys, apiWebhooks } = require('../shared/schema');

describe('WeChat Integration API', () => {
  let testApiKey;
  let testApplication;
  let testUser;

  beforeAll(async () => {
    // Create test application and API key
    testApplication = await db.insert(apiApplications).values({
      name: 'Test WeChat App',
      description: 'Test application for WeChat integration',
      developerId: 1,
      isActive: true
    }).returning();

    testApiKey = await db.insert(apiKeys).values({
      applicationId: testApplication[0].id,
      keyValue: 'test_wechat_api_key_12345',
      keyType: 'production',
      scopes: 'user:read,user:write,match:write,ranking:advanced,webhook:manage',
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }).returning();
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser?.id) {
      await db.delete(users).where(eq(users.id, testUser.id));
    }
    if (testApiKey?.[0]?.id) {
      await db.delete(apiKeys).where(eq(apiKeys.id, testApiKey[0].id));
    }
    if (testApplication?.[0]?.id) {
      await db.delete(apiApplications).where(eq(apiApplications.id, testApplication[0].id));
    }
  });

  describe('POST /api/v1/wechat/register', () => {
    test('should successfully register a new WeChat user', async () => {
      const wechatUserData = {
        wechat_oauth_data: {
          openid: 'test_openid_12345',
          unionid: 'test_unionid_12345', 
          nickname: '测试用户',
          sex: 1,
          city: 'Shanghai',
          country: 'China',
          province: 'Shanghai',
          language: 'zh_CN',
          headimgurl: 'https://example.com/avatar.jpg'
        },
        registration_metadata: {
          source: 'wechat_miniprogram',
          app_version: '1.0.0',
          platform: 'iOS',
          registration_ip: '127.0.0.1'
        },
        user_preferences: {
          preferred_language: 'zh',
          marketing_consent: true,
          data_sharing_consent: true
        }
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(wechatUserData)
        .expect(200);

      expect(response.body).toMatchObject({
        api_version: 'v1',
        data: {
          registration_status: 'success',
          user_id: expect.any(Number),
          passport_code: expect.stringMatching(/^[A-Z0-9]{8}$/),
          display_name: '测试用户'
        }
      });

      testUser = response.body.data;
    });

    test('should prevent duplicate registration with same openid', async () => {
      const duplicateData = {
        wechat_oauth_data: {
          openid: 'test_openid_12345', // Same as previous test
          nickname: '重复用户'
        },
        registration_metadata: {
          source: 'wechat_miniprogram'
        }
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(duplicateData)
        .expect(409);

      expect(response.body.error).toBe('user_already_exists');
    });

    test('should require valid API key', async () => {
      const userData = {
        wechat_oauth_data: {
          openid: 'test_openid_invalid',
          nickname: 'Test User'
        }
      };

      await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', 'invalid_key')
        .send(userData)
        .expect(401);
    });

    test('should require user:write scope', async () => {
      // Create API key without user:write scope
      const limitedApiKey = await db.insert(apiKeys).values({
        applicationId: testApplication[0].id,
        keyValue: 'limited_api_key_12345',
        keyType: 'production',
        scopes: 'user:read', // Missing user:write
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }).returning();

      const userData = {
        wechat_oauth_data: {
          openid: 'test_openid_limited',
          nickname: 'Limited User'
        }
      };

      await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', limitedApiKey[0].keyValue)
        .send(userData)
        .expect(403);

      // Clean up
      await db.delete(apiKeys).where(eq(apiKeys.id, limitedApiKey[0].id));
    });
  });

  describe('POST /api/v1/wechat/register-webhook', () => {
    test('should successfully register webhook for WeChat app', async () => {
      const webhookData = {
        webhook_url: 'https://wechatapp.example.com/webhook',
        events: ['user.created', 'user.ranking_changed', 'wechat.user_linked'],
        secret: 'webhook_secret_12345'
      };

      const response = await request(app)
        .post('/api/v1/wechat/register-webhook')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(webhookData)
        .expect(200);

      expect(response.body).toMatchObject({
        api_version: 'v1',
        data: {
          webhook_id: expect.stringMatching(/^wh_/),
          application_id: testApplication[0].id,
          url: webhookData.webhook_url,
          events: webhookData.events,
          status: 'active',
          sync_capabilities: {
            real_time_user_updates: true,
            ranking_notifications: true,
            match_result_sync: true,
            profile_change_alerts: true
          }
        }
      });
    });

    test('should require webhook:manage scope', async () => {
      const limitedApiKey = await db.insert(apiKeys).values({
        applicationId: testApplication[0].id,
        keyValue: 'no_webhook_scope_12345',
        keyType: 'production',
        scopes: 'user:read,user:write', // Missing webhook:manage
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }).returning();

      const webhookData = {
        webhook_url: 'https://example.com/webhook',
        events: ['user.created']
      };

      await request(app)
        .post('/api/v1/wechat/register-webhook')
        .set('X-API-Key', limitedApiKey[0].keyValue)
        .send(webhookData)
        .expect(403);

      // Clean up
      await db.delete(apiKeys).where(eq(apiKeys.id, limitedApiKey[0].id));
    });
  });

  describe('PATCH /api/v1/wechat/sync-user-profile', () => {
    test('should successfully sync user profile changes', async () => {
      if (!testUser?.user_id) {
        // Create a test user first
        const registrationData = {
          wechat_oauth_data: {
            openid: 'sync_test_openid',
            nickname: 'Sync Test User'
          }
        };

        const regResponse = await request(app)
          .post('/api/v1/wechat/register')
          .set('X-API-Key', testApiKey[0].keyValue)
          .send(registrationData);

        testUser = regResponse.body.data;
      }

      const syncData = {
        pickle_user_id: testUser.user_id,
        wechat_openid: 'sync_test_openid',
        profile_updates: {
          display_name: 'Updated Test User',
          bio: 'Updated bio from WeChat app',
          skill_level: 'intermediate',
          equipment_preferences: {
            paddle_brand: 'Wilson',
            paddle_model: 'Pro Staff'
          },
          skill_ratings: {
            forehand: 7,
            backhand: 6,
            serve: 8
          }
        },
        sync_timestamp: new Date().toISOString(),
        conflict_resolution: 'pickle_plus_wins'
      };

      const response = await request(app)
        .patch('/api/v1/wechat/sync-user-profile')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(syncData)
        .expect(200);

      expect(response.body).toMatchObject({
        api_version: 'v1',
        data: {
          sync_status: 'success',
          user_id: testUser.user_id,
          passport_code: expect.stringMatching(/^[A-Z0-9]{8}$/),
          updated_fields: expect.arrayContaining(['displayName', 'bio']),
          sync_timestamp: expect.any(String),
          next_sync_eligible_at: expect.any(String)
        }
      });
    });

    test('should handle user not found', async () => {
      const syncData = {
        pickle_user_id: 999999,
        profile_updates: {
          display_name: 'Non-existent User'
        }
      };

      await request(app)
        .patch('/api/v1/wechat/sync-user-profile')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(syncData)
        .expect(404);
    });
  });

  describe('POST /api/v1/wechat/match-submit', () => {
    test('should process match data and return ranking updates', async () => {
      if (!testUser?.user_id) {
        // Register test user if not already done
        const registrationData = {
          wechat_oauth_data: {
            openid: 'match_test_openid',
            nickname: 'Match Test User'
          }
        };

        const regResponse = await request(app)
          .post('/api/v1/wechat/register')
          .set('X-API-Key', testApiKey[0].keyValue)
          .send(registrationData);

        testUser = regResponse.body.data;
      }

      const matchData = {
        match_data: {
          match_type: 'singles',
          duration_minutes: 45,
          score: [11, 9, 11, 6, 11, 8],
          location: 'WeChat Mini-Program Court'
        },
        participants: [
          {
            player_id: testUser.user_id,
            wechat_openid: 'match_test_openid',
            previous_ranking: 800,
            match_result: 'win'
          },
          {
            player_id: 'opponent_123',
            wechat_openid: 'opponent_openid',
            previous_ranking: 750,
            match_result: 'loss'
          }
        ],
        wechat_openids: ['match_test_openid', 'opponent_openid'],
        tournament_context: null
      };

      const response = await request(app)
        .post('/api/v1/wechat/match-submit')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(matchData)
        .expect(200);

      expect(response.body).toMatchObject({
        api_version: 'v1',
        data: {
          match_id: expect.stringMatching(/^pkl_/),
          processed_at: expect.any(String),
          participants: expect.arrayContaining([
            expect.objectContaining({
              wechat_openid: 'match_test_openid',
              ranking_update: expect.objectContaining({
                previous_position: expect.any(Number),
                new_position: expect.any(Number),
                points_change: expect.any(Number),
                confidence_score: expect.any(Number)
              }),
              performance_summary: expect.objectContaining({
                match_impact: expect.stringMatching(/^(positive|neutral|negative)$/),
                skill_development: expect.stringMatching(/^(improving|stable|declining)$/),
                competitive_level: expect.stringMatching(/^(above|appropriate|below)$/)
              })
            })
          ]),
          ranking_table_updates: expect.objectContaining({
            local_leaderboard_changes: true,
            affected_rankings_count: 2,
            recalculation_scope: expect.stringMatching(/^(local|regional|global)$/)
          })
        }
      });
    });

    test('should require match:write and ranking:advanced scopes', async () => {
      const limitedApiKey = await db.insert(apiKeys).values({
        applicationId: testApplication[0].id,
        keyValue: 'limited_match_key_12345',
        keyType: 'production',
        scopes: 'user:read,user:write', // Missing match:write and ranking:advanced
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }).returning();

      const matchData = {
        match_data: { match_type: 'singles' },
        participants: [{ player_id: 1 }],
        wechat_openids: ['test_openid']
      };

      await request(app)
        .post('/api/v1/wechat/match-submit')
        .set('X-API-Key', limitedApiKey[0].keyValue)
        .send(matchData)
        .expect(403);

      // Clean up
      await db.delete(apiKeys).where(eq(apiKeys.id, limitedApiKey[0].id));
    });
  });

  describe('Webhook Delivery System', () => {
    test('should trigger webhooks on user registration', async () => {
      // This test would require a mock webhook server or integration with
      // the webhook delivery system to verify webhooks are sent correctly
      // For now, we test the registration endpoint and verify it completes
      
      const userData = {
        wechat_oauth_data: {
          openid: 'webhook_test_openid',
          nickname: 'Webhook Test User'
        }
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(userData)
        .expect(200);

      expect(response.body.data.registration_status).toBe('success');
      
      // In a real implementation, we would:
      // 1. Set up a test webhook endpoint
      // 2. Register it via the webhook registration endpoint
      // 3. Verify the webhook was called with correct data
      // 4. Check webhook delivery logs
    });
  });

  describe('API Rate Limiting and Security', () => {
    test('should handle malformed requests gracefully', async () => {
      const malformedData = {
        invalid_field: 'test'
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(malformedData)
        .expect(400);

      expect(response.body.error).toBe('invalid_request');
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        wechat_oauth_data: {
          // Missing openid and nickname
        }
      };

      await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(incompleteData)
        .expect(400);
    });

    test('should handle database errors gracefully', async () => {
      // Test with extremely long data that might cause database errors
      const oversizedData = {
        wechat_oauth_data: {
          openid: 'x'.repeat(1000), // Extremely long openid
          nickname: 'Test User'
        }
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(oversizedData)
        .expect(400);

      expect(response.body.error).toMatch(/validation|invalid/);
    });
  });

  describe('Algorithm Protection', () => {
    test('should obfuscate sensitive algorithm data', async () => {
      const matchData = {
        match_data: { match_type: 'singles' },
        participants: [{ player_id: testUser?.user_id || 1 }],
        wechat_openids: ['test_openid']
      };

      const response = await request(app)
        .post('/api/v1/wechat/match-submit')
        .set('X-API-Key', testApiKey[0].keyValue)
        .send(matchData)
        .expect(200);

      // Verify that algorithm internals are not exposed
      expect(response.body.data).not.toHaveProperty('algorithm_details');
      expect(response.body.data).not.toHaveProperty('calculation_steps');
      expect(response.body.data).not.toHaveProperty('internal_weights');
      
      // Only final results should be returned
      expect(response.body.data.participants[0]).toHaveProperty('ranking_update');
      expect(response.body.data.participants[0]).toHaveProperty('performance_summary');
    });
  });
});

module.exports = {
  testApiKey,
  testApplication,
  testUser
};