/**
 * PKL-278651-TRAINING-CENTER-ADMIN-001 - Training Center Admin Module Tests
 * Comprehensive test suite for training center administration functionality
 */

import request from 'supertest';
import { Express } from 'express';
import { DatabaseStorage } from '../storage';

describe('Training Center Admin API', () => {
  let app: Express;
  let storage: DatabaseStorage;

  beforeAll(async () => {
    // Initialize test app and storage
    const { createApp } = require('../index');
    app = await createApp();
    storage = new DatabaseStorage();
  });

  describe('GET /api/admin/training-centers/centers', () => {
    test('should return training centers with statistics', async () => {
      const response = await request(app)
        .get('/api/admin/training-centers/centers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const center = response.body.data[0];
        expect(center).toHaveProperty('id');
        expect(center).toHaveProperty('name');
        expect(center).toHaveProperty('address');
        expect(center).toHaveProperty('capacity');
        expect(center).toHaveProperty('active_classes');
        expect(center).toHaveProperty('total_revenue');
      }
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(storage, 'getTrainingCentersWithStats').mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/admin/training-centers/centers')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to fetch training centers');
    });
  });

  describe('GET /api/admin/training-centers/coaches', () => {
    test('should return coaches with detailed information', async () => {
      const response = await request(app)
        .get('/api/admin/training-centers/coaches')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const coach = response.body.data[0];
        expect(coach).toHaveProperty('id');
        expect(coach).toHaveProperty('name');
        expect(coach).toHaveProperty('email');
        expect(coach).toHaveProperty('pcp_certified');
        expect(coach).toHaveProperty('status');
        expect(coach).toHaveProperty('total_sessions');
        expect(['active', 'pending', 'suspended']).toContain(coach.status);
      }
    });
  });

  describe('GET /api/admin/training-centers/classes', () => {
    test('should return class sessions with enrollment data', async () => {
      const response = await request(app)
        .get('/api/admin/training-centers/classes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const classSession = response.body.data[0];
        expect(classSession).toHaveProperty('id');
        expect(classSession).toHaveProperty('name');
        expect(classSession).toHaveProperty('coach_name');
        expect(classSession).toHaveProperty('center_name');
        expect(classSession).toHaveProperty('capacity');
        expect(classSession).toHaveProperty('enrolled');
        expect(classSession).toHaveProperty('status');
      }
    });
  });

  describe('PUT /api/admin/training-centers/coaches/:coachId/status', () => {
    test('should update coach status successfully', async () => {
      const coachId = 1;
      const newStatus = 'active';

      const response = await request(app)
        .put(`/api/admin/training-centers/coaches/${coachId}/status`)
        .send({ status: newStatus })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Coach status updated');
    });

    test('should validate status values', async () => {
      const coachId = 1;
      const invalidStatus = 'invalid_status';

      const response = await request(app)
        .put(`/api/admin/training-centers/coaches/${coachId}/status`)
        .send({ status: invalidStatus })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put('/api/admin/training-centers/coaches/1/status')
        .send({ status: 'active' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authentication required');
    });
  });

  describe('PUT /api/admin/training-centers/classes/:classId/status', () => {
    test('should update class session status successfully', async () => {
      const classId = 1;
      const newStatus = 'active';

      const response = await request(app)
        .put(`/api/admin/training-centers/classes/${classId}/status`)
        .send({ status: newStatus })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Class status updated');
    });
  });

  describe('POST /api/admin/training-centers/centers', () => {
    test('should create new training center successfully', async () => {
      const newCenter = {
        name: 'Test Training Center',
        description: 'A test training center',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345',
        phone: '555-0123',
        email: 'test@example.com',
        website: 'https://test.com',
        capacity: 50,
        qrCode: 'TEST_QR_123'
      };

      const response = await request(app)
        .post('/api/admin/training-centers/centers')
        .send(newCenter)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newCenter.name);
    });

    test('should validate required fields', async () => {
      const incompleteCenter = {
        name: 'Test Center'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/admin/training-centers/centers')
        .send(incompleteCenter)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('PUT /api/admin/training-centers/centers/:centerId', () => {
    test('should update training center successfully', async () => {
      const centerId = 1;
      const updateData = {
        name: 'Updated Training Center',
        description: 'Updated description',
        address: '456 Updated Street',
        capacity: 75
      };

      const response = await request(app)
        .put(`/api/admin/training-centers/centers/${centerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('Database Integration', () => {
    test('should handle database connection issues', async () => {
      // Mock database connection failure
      jest.spyOn(storage, 'getTrainingCentersWithStats').mockRejectedValue(new Error('Connection failed'));

      const response = await request(app)
        .get('/api/admin/training-centers/centers')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('should return empty arrays when no data exists', async () => {
      jest.spyOn(storage, 'getTrainingCentersWithStats').mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/training-centers/centers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Authentication & Authorization', () => {
    test('should require authentication for all admin endpoints', async () => {
      const endpoints = [
        '/api/admin/training-centers/centers',
        '/api/admin/training-centers/coaches',
        '/api/admin/training-centers/classes'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .get(endpoint)
          .expect(401);
      }
    });

    test('should validate admin permissions', async () => {
      // Test with non-admin user
      const response = await request(app)
        .get('/api/admin/training-centers/centers')
        .set('Authorization', 'Bearer non_admin_token')
        .expect(403);

      expect(response.body.error).toContain('Admin access required');
    });
  });

  describe('Performance Tests', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/admin/training-centers/centers')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/admin/training-centers/centers')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  afterAll(async () => {
    // Cleanup test data and close connections
    if (storage) {
      // Add cleanup logic here
    }
  });
});

describe('Training Center Admin Storage Methods', () => {
  let storage: DatabaseStorage;

  beforeAll(() => {
    storage = new DatabaseStorage();
  });

  test('getTrainingCentersWithStats should return proper structure', async () => {
    const result = await storage.getTrainingCentersWithStats();
    expect(Array.isArray(result)).toBe(true);
  });

  test('getCoachesWithDetails should return coach data', async () => {
    const result = await storage.getCoachesWithDetails();
    expect(Array.isArray(result)).toBe(true);
  });

  test('getClassSessionsWithEnrollment should return class data', async () => {
    const result = await storage.getClassSessionsWithEnrollment();
    expect(Array.isArray(result)).toBe(true);
  });

  test('updateCoachStatus should execute without errors', async () => {
    await expect(storage.updateCoachStatus(1, 'active')).resolves.not.toThrow();
  });

  test('updateClassSessionStatus should execute without errors', async () => {
    await expect(storage.updateClassSessionStatus(1, 'active')).resolves.not.toThrow();
  });
});