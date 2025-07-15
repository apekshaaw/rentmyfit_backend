import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';

let User;

beforeEach(async () => {
  const userModule = await import('../models/User.js');
  User = userModule.default;

  User.findById = jest.fn();
  jwt.verify = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('💖 Wishlist Flow', () => {
  it('should add product to wishlist (authorized)', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user123' });
    });

    const mockUser = {
      wishlist: [],
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/wishlist/add')
      .set('Authorization', 'Bearer validtoken')
      .send({ productId: 'product123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Added to wishlist');
  });

  it('should fail to add to wishlist without token (unauthorized)', async () => {
    const res = await request(app)
      .post('/api/auth/wishlist/add')
      .send({ productId: 'product123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/No token|Authentication/i);
  });

  it('should remove product from wishlist (authorized)', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user123' });
    });

    const mockUser = {
      wishlist: ['product123'],
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .delete('/api/auth/wishlist/product123')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Removed from wishlist');
  });

  it('should not remove product not in wishlist', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user123' });
    });

    const mockUser = {
      wishlist: ['productABC'], // product123 not in wishlist
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .delete('/api/auth/wishlist/product123')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body.wishlist.includes('product123')).toBe(false);
  });

    it('should fetch wishlist (authorized)', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user123' });
    });

    const mockPopulate = jest.fn().mockResolvedValue({
      wishlist: [{ _id: 'product123', name: 'Dress' }],
    });

    User.findById.mockReturnValue({ populate: mockPopulate });

    const res = await request(app)
      .get('/api/auth/wishlist')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.wishlist)).toBe(true);
  });


  it('should fail to fetch wishlist with invalid token', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(new Error('Invalid token'), null);
    });

    const res = await request(app)
      .get('/api/auth/wishlist')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid token/);
  });
});
