import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/rentmyfit_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});


jest.setTimeout(15000); // Extend timeout to 15s

let productId;

describe('🛍️ Product CRUD', () => {
  // 1️⃣ Create a new product (admin)
  it('should create a new product with valid data', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Dress',
        category: 'Women',
        sizes: ['S', 'M'],
        price: 49.99,
        image: 'image.jpg',
      });

    console.log('Create product response:', res.body);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Dress');
    productId = res.body._id;
  });

  // 2️⃣ Create product without required fields
  it('should fail to create a product without required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        category: 'Men',
        image: 'image.jpg',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // 3️⃣ Fetch all products
  it('should fetch all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 4️⃣ Fetch product by valid ID
  it('should fetch product by ID', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(productId);
  });

  // 5️⃣ Fetch product by invalid/malformed ID
  it('should return 500 for malformed product ID', async () => {
    const res = await request(app).get('/api/products/invalid123');
    expect(res.status).toBe(500);
    expect(res.body.message).toBeDefined();
  });

  // 6️⃣ Update product details by ID
  it('should update the product name', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ name: 'Updated Dress' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Dress');
  });

  // 7️⃣ Delete product by ID
  it('should delete product by ID', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Deleted successfully');
  });
});
