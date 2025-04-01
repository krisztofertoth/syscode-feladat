import request from 'supertest';
import { app } from '../../index';

describe('Application Setup', () => {
  it('should start the application successfully', async () => {
    const response = await request(app).get('/api/address').auth('admin', 'admin123');
    expect(response.status).toBe(200);
  });

  it('should handle unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Not Found' });
  });
}); 