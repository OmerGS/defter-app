import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { db } from '@/database';

/**
 * AUTHENTICATION MODULE TESTS
 * Scope: Integration / End-to-End
 */
describe('Auth API Integration', () => {

  afterAll(async () => {
    await db.end();
  });

  /**
   * TEST CASE 1: Successful Login
   * Requires: The user 'admin@defter.local' must exist in DB with password 'admin123'
   */
  it('POST /api/v1/auth/login - should return 200 and a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identity: 'admin@defter.local',
        password: 'admin123'
      });

    // 2. Assertions (Verifications)
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('email', 'admin@defter.local');
  });

  /**
   * TEST CASE 2: Failed Login (Wrong Password)
   */
  it('POST /api/v1/auth/login - should return 401 for invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identity: 'admin@defter.local',
        password: 'WRONG_PASSWORD_123'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials.');
  });

  /**
   * TEST CASE 3: Input Validation (Empty fields)
   */
  it('POST /api/v1/auth/login - should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identity: '', // Empty
        password: ''
      });

    expect(response.status).toBe(400);
  });
});