import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let User;

beforeEach(async () => {
  const userModule = await import('../models/User.js');
  User = userModule.default;

  // Manual mocks
  User.findOne = jest.fn();
  User.create = jest.fn();
  User.findById = jest.fn();

  bcrypt.hash = jest.fn();
  bcrypt.compare = jest.fn();

  jwt.sign = jest.fn();
  jwt.verify = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('🧍‍♂️ User Authentication & Profile', () => {
  it('should register a new user with valid data', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpass');
    User.create.mockResolvedValue({
      _id: 'userId123',
      email: 'test@example.com',
      role: 'user',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registered successfully');
  });

  it('should fail registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: '', password: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should fail registration with duplicate email', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('User already exists');
  });

  it('should login with correct credentials', async () => {
    const fakeUser = {
      _id: 'user123',
      email: 'test@example.com',
      name: 'Test',
      role: 'user',
      password: 'hashedpass',
      wishlist: [],
    };

    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('fake-jwt-token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should fail login with wrong email', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: '123456' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should fail login with wrong password', async () => {
    User.findOne.mockResolvedValue({ password: 'hashedpass' });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should fetch profile with valid token', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user123' });
    });

    User.findById.mockResolvedValue({
      _id: 'user123',
      name: 'Test',
      email: 'test@example.com',
      role: 'user',
      wishlist: [],
      save: jest.fn(),
    });

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', 'Bearer validtoken')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated');
  });

  it('should fail to update profile with invalid token', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(new Error('Invalid token'), null);
    });

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ name: 'Updated' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  it('should allow access to protected route with valid token', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user123' });
    });

    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'user123',
        name: 'Test',
        email: 'test@example.com',
        wishlist: [],
      }),
    });

    const res = await request(app)
      .get('/api/auth/wishlist')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.wishlist)).toBe(true);
  });
});
