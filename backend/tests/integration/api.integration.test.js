import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/server.js'; // The Express app export

describe('API Integration Tests', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is running');
  });

  it('GET non-existent route should return 404', async () => {
    const res = await request(app).get('/api/invalid-route-12345');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });
});
