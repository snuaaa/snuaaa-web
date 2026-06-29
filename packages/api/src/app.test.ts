import request from 'supertest';
import app from './app';

describe('App Endpoints', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');
    expect(response.status).toBe(404);
  });
});
