import request from 'supertest';
import express from 'express';
import { getRandomAddress } from '../../controllers/addressController';
import auth from '../../middleware/auth';

const app = express();
app.use(express.json());

// Address végpont védelme
app.get('/api/address', auth, getRandomAddress);

describe('Address API Endpoints', () => {
  describe('GET /api/address', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/address');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return 401 with wrong credentials', async () => {
      const response = await request(app)
        .get('/api/address')
        .auth('wronguser', 'wrongpass');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return a random address with UUID when authenticated', async () => {
      const response = await request(app)
        .get('/api/address')
        .auth('admin', 'admin123');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('address');
      
      // UUID formátum ellenőrzése
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(response.body.id)).toBeTruthy();
      
      // Cím formátum ellenőrzése
      expect(typeof response.body.address).toBe('string');
      expect(response.body.address.length).toBeGreaterThan(0);
      expect(response.body.address).toMatch(/.*utca.*,.*/);
    });

    it('should return different addresses on multiple calls when authenticated', async () => {
      const response1 = await request(app)
        .get('/api/address')
        .auth('admin', 'admin123');
      const response2 = await request(app)
        .get('/api/address')
        .auth('admin', 'admin123');
      
      expect(response1.body.address).not.toBe(response2.body.address);
      expect(response1.body.id).not.toBe(response2.body.id);
    });
  });
}); 