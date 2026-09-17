import request from 'supertest';
import { createApp } from '../app';
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearCollections,
  createDemoUser,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from './testUtils';

const app = createApp();

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearCollections();
  await createDemoUser();
});

describe('Auth API', () => {
  it('logs in with valid credentials and sets an auth cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(DEMO_EMAIL);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: DEMO_EMAIL, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects malformed login payloads', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('blocks access to /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows access to /me with a valid cookie from login', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(DEMO_EMAIL);
  });

  it('clears the cookie on logout', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});
