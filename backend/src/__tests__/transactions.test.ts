import request from 'supertest';
import { createApp } from '../app';
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearCollections,
  createDemoUser,
  seedSampleTransactions,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from './testUtils';

const app = createApp();
let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearCollections();
  await createDemoUser();
  await seedSampleTransactions();
  agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
});

describe('Transactions API', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('paginates results with correct metadata', async () => {
    const res = await agent.get('/api/transactions').query({ page: 1, limit: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
  });

  it('filters by category and status together', async () => {
    const res = await agent.get('/api/transactions').query({ category: 'Revenue', status: 'Paid' });
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { category: string; status: string }) => t.category === 'Revenue' && t.status === 'Paid')).toBe(true);
  });

  it('filters by amount range', async () => {
    const res = await agent.get('/api/transactions').query({ minAmount: 1000, maxAmount: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { amount: number }) => t.amount >= 1000 && t.amount <= 2000)).toBe(true);
  });

  it('sorts by amount descending', async () => {
    const res = await agent.get('/api/transactions').query({ sortBy: 'amount', sortOrder: 'desc' });
    const amounts = res.body.data.map((t: { amount: number }) => t.amount);
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
  });

  it('rejects an invalid sortBy field (whitelist protection)', async () => {
    const res = await agent.get('/api/transactions').query({ sortBy: 'user_profile' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('searches across id/category/status/user_id', async () => {
    const res = await agent.get('/api/transactions').query({ search: 'user_002' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((t: { user_id: string }) => t.user_id === 'user_002')).toBe(true);
  });

  it('returns a single transaction by id', async () => {
    const res = await agent.get('/api/transactions/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('returns 404 for a non-existent transaction id', async () => {
    const res = await agent.get('/api/transactions/9999');
    expect(res.status).toBe(404);
  });
});

describe('Dashboard API', () => {
  it('computes summary metrics via aggregation', async () => {
    const res = await agent.get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(1000 + 2500 + 1200);
    expect(res.body.data.totalExpenses).toBe(500 + 300);
    expect(res.body.data.netCashFlow).toBe(1000 + 2500 + 1200 - (500 + 300));
    expect(res.body.data.pendingCount).toBe(2);
  });

  it('returns category breakdown', async () => {
    const res = await agent.get('/api/dashboard/categories');
    expect(res.status).toBe(200);
    const revenue = res.body.data.find((c: { category: string }) => c.category === 'Revenue');
    expect(revenue.count).toBe(3);
  });
});

describe('Export API', () => {
  it('exports a correctly formatted, filtered CSV', async () => {
    const res = await agent
      .post('/api/reports/export')
      .send({ columns: ['id', 'date', 'amount', 'category'], filters: { category: 'Revenue' } });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('financial-report-');
    const lines = res.text.trim().split('\n');
    expect(lines[0]).toBe('ID,Date,Amount,Category');
    expect(lines).toHaveLength(4); // header + 3 revenue rows
  });

  it('rejects export requests with no columns', async () => {
    const res = await agent.post('/api/reports/export').send({ columns: [] });
    expect(res.status).toBe(400);
  });

  it('returns an export preview with record and column counts', async () => {
    const res = await agent
      .post('/api/reports/export/preview')
      .send({ columns: ['id', 'amount'], filters: { status: 'Paid' } });

    expect(res.status).toBe(200);
    expect(res.body.data.recordCount).toBe(3);
    expect(res.body.data.columnCount).toBe(2);
  });
});
