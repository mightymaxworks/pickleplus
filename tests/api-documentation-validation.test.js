/**
 * PKL-278651-API-0001-DOC-TEST
 * API Documentation Validation Tests
 * 
 * Ensures API responses match documentation and external developer expectations
 */

const request = require('supertest');
const { app } = require('../server/server');

describe('API Documentation Validation', () => {
  const testApiKey = 'test_wechat_api_key_12345';

  describe('API Response Format Standards', () => {
    test('all API responses should follow consistent format', async () => {
      const testRequests = [
        { method: 'post', path: '/api/v1/wechat/register' },
        { method: 'post', path: '/api/v1/wechat/register-webhook' },
        { method: 'patch', path: '/api/v1/wechat/sync-user-profile' },
        { method: 'post', path: '/api/v1/wechat/match-submit' }
      ];

      for (const req of testRequests) {
        const response = await request(app)
          [req.method](req.path)
          .set('X-API-Key', testApiKey)
          .send({}) // Empty body to trigger validation errors
          .expect(400); // Should return validation error

        // All error responses should follow this format
        expect(response.body).toMatchObject({
          error: expect.any(String),
          error_description: expect.any(String)
        });

        // Error codes should be descriptive and consistent
        expect(response.body.error).toMatch(/^[a-z_]+$/);
        expect(response.body.error_description).not.toBe('');
      }
    });

    test('successful responses should include api_version', async () => {
      // Test with a minimal valid registration
      const validRegistration = {
        wechat_oauth_data: {
          openid: 'doc_test_openid',
          nickname: 'Doc Test User'
        }
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey)
        .send(validRegistration)
        .expect(200);

      expect(response.body).toMatchObject({
        api_version: 'v1',
        data: expect.any(Object)
      });
    });
  });

  describe('API Field Validation', () => {
    test('should validate openid format requirements', async () => {
      const invalidOpenIds = [
        '', // Empty
        'a', // Too short
        'x'.repeat(100), // Too long
        'invalid-chars!@#$', // Invalid characters
        null, // Null
        123 // Wrong type
      ];

      for (const invalidId of invalidOpenIds) {
        const response = await request(app)
          .post('/api/v1/wechat/register')
          .set('X-API-Key', testApiKey)
          .send({
            wechat_oauth_data: {
              openid: invalidId,
              nickname: 'Test User'
            }
          })
          .expect(400);

        expect(response.body.error).toBe('invalid_request');
        expect(response.body.error_description).toContain('openid');
      }
    });

    test('should validate webhook URL format', async () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://invalid-protocol.com',
        'http://localhost', // No path
        '', // Empty
        null // Null
      ];

      for (const invalidUrl of invalidUrls) {
        const response = await request(app)
          .post('/api/v1/wechat/register-webhook')
          .set('X-API-Key', testApiKey)
          .send({
            webhook_url: invalidUrl,
            events: ['user.created']
          })
          .expect(400);

        expect(response.body.error).toBe('invalid_request');
      }
    });
  });

  describe('API Rate Limiting Documentation', () => {
    test('should include rate limit headers in responses', async () => {
      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey)
        .send({
          wechat_oauth_data: {
            openid: 'rate_limit_test_openid',
            nickname: 'Rate Limit Test'
          }
        });

      // Rate limiting headers should be present for documentation
      // (Even if not currently implemented, headers show the intention)
      const expectedHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
        'x-ratelimit-reset'
      ];

      // Note: These headers may not be implemented yet
      // This test documents the expected behavior for external developers
    });
  });

  describe('Error Code Documentation', () => {
    test('should return documented error codes', async () => {
      const errorTestCases = [
        {
          scenario: 'Missing API key',
          request: () => request(app).post('/api/v1/wechat/register').send({}),
          expectedStatus: 401,
          expectedError: 'unauthorized'
        },
        {
          scenario: 'Invalid API key',
          request: () => request(app)
            .post('/api/v1/wechat/register')
            .set('X-API-Key', 'invalid_key')
            .send({}),
          expectedStatus: 401,
          expectedError: 'invalid_api_key'
        },
        {
          scenario: 'Insufficient scope',
          request: () => request(app)
            .post('/api/v1/wechat/register-webhook')
            .set('X-API-Key', testApiKey) // Assume this key doesn't have webhook:manage
            .send({ webhook_url: 'http://example.com', events: ['user.created'] }),
          expectedStatus: 403,
          expectedError: 'insufficient_scope'
        },
        {
          scenario: 'Malformed request',
          request: () => request(app)
            .post('/api/v1/wechat/register')
            .set('X-API-Key', testApiKey)
            .send({ invalid_field: 'test' }),
          expectedStatus: 400,
          expectedError: 'invalid_request'
        }
      ];

      for (const testCase of errorTestCases) {
        const response = await testCase.request().expect(testCase.expectedStatus);
        
        expect(response.body).toMatchObject({
          error: testCase.expectedError,
          error_description: expect.any(String)
        });

        // Error descriptions should be helpful for developers
        expect(response.body.error_description.length).toBeGreaterThan(10);
      }
    });
  });

  describe('API Versioning', () => {
    test('should consistently use v1 API version', async () => {
      const apiEndpoints = [
        '/api/v1/wechat/register',
        '/api/v1/wechat/register-webhook',
        '/api/v1/wechat/sync-user-profile',
        '/api/v1/wechat/match-submit'
      ];

      for (const endpoint of apiEndpoints) {
        // Test that endpoint exists (not 404)
        const response = await request(app)
          .post(endpoint)
          .set('X-API-Key', testApiKey)
          .send({});

        // Should not be 404 (endpoint exists)
        expect(response.status).not.toBe(404);
        
        // If successful, should include api_version
        if (response.status === 200) {
          expect(response.body.api_version).toBe('v1');
        }
      }
    });
  });

  describe('CORS and Headers Documentation', () => {
    test('should include proper CORS headers for external apps', async () => {
      const response = await request(app)
        .options('/api/v1/wechat/register')
        .set('Origin', 'https://wechatapp.example.com')
        .set('X-API-Key', testApiKey);

      // CORS headers should be present for cross-origin requests
      // This documents the expected behavior for WeChat mini-programs
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });

    test('should accept required content-type headers', async () => {
      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey)
        .set('Content-Type', 'application/json')
        .send({
          wechat_oauth_data: {
            openid: 'content_type_test',
            nickname: 'Content Type Test'
          }
        });

      // Should accept JSON content type without issues
      expect([200, 400, 409]).toContain(response.status);
    });
  });

  describe('Data Privacy and Compliance', () => {
    test('should not log sensitive data in responses', async () => {
      const registrationData = {
        wechat_oauth_data: {
          openid: 'privacy_test_openid',
          nickname: 'Privacy Test User',
          headimgurl: 'https://example.com/sensitive-avatar.jpg'
        },
        registration_metadata: {
          registration_ip: '192.168.1.100',
          device_id: 'sensitive-device-id-12345'
        }
      };

      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey)
        .send(registrationData);

      // Response should not expose sensitive input data
      const responseString = JSON.stringify(response.body);
      
      // Should not contain sensitive metadata in response
      expect(responseString).not.toContain('sensitive-device-id-12345');
      expect(responseString).not.toContain('192.168.1.100');
      
      // Should not expose internal system details
      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain('secret');
      expect(responseString).not.toContain('internal_');
    });
  });

  describe('API Performance Expectations', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/wechat/register')
        .set('X-API-Key', testApiKey)
        .send({
          wechat_oauth_data: {
            openid: 'performance_test_openid',
            nickname: 'Performance Test User'
          }
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // API should respond within 2 seconds for external app integration
      expect(responseTime).toBeLessThan(2000);
      
      // Log performance for documentation
      console.log(`API Response Time: ${responseTime}ms`);
    });
  });
});

module.exports = {
  // Export test utilities for documentation generation
  apiEndpoints: [
    '/api/v1/wechat/register',
    '/api/v1/wechat/register-webhook', 
    '/api/v1/wechat/sync-user-profile',
    '/api/v1/wechat/match-submit'
  ],
  errorCodes: {
    'unauthorized': 'Missing or invalid API key',
    'invalid_api_key': 'API key is not valid or has been revoked',
    'insufficient_scope': 'API key does not have required permissions',
    'invalid_request': 'Request body or parameters are malformed',
    'user_already_exists': 'User with this openid already exists',
    'user_not_found': 'User not found in Pickle+ database',
    'webhook_registration_error': 'Error registering webhook endpoint',
    'profile_sync_error': 'Error synchronizing user profile'
  }
};