import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';

let mongoServer: MongoMemoryServer;

export async function setupTestDatabase(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

export async function teardownTestDatabase(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
}

export async function clearCollections(): Promise<void> {
  await User.deleteMany({});
  await Transaction.deleteMany({});
}

export const DEMO_EMAIL = 'test@financeapp.com';
export const DEMO_PASSWORD = 'Test@1234';

export async function createDemoUser(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await User.create({ name: 'Test User', email: DEMO_EMAIL, passwordHash });
}

export async function seedSampleTransactions(): Promise<void> {
  await Transaction.insertMany([
    { id: 1, date: new Date('2024-01-10'), amount: 1000, category: 'Revenue', status: 'Paid', user_id: 'user_001', user_profile: 'https://thispersondoesnotexist.com/' },
    { id: 2, date: new Date('2024-02-15'), amount: 500, category: 'Expense', status: 'Pending', user_id: 'user_002', user_profile: 'https://thispersondoesnotexist.com/' },
    { id: 3, date: new Date('2024-03-01'), amount: 2500, category: 'Revenue', status: 'Paid', user_id: 'user_001', user_profile: 'https://thispersondoesnotexist.com/' },
    { id: 4, date: new Date('2024-03-20'), amount: 300, category: 'Expense', status: 'Paid', user_id: 'user_003', user_profile: 'https://thispersondoesnotexist.com/' },
    { id: 5, date: new Date('2024-04-05'), amount: 1200, category: 'Revenue', status: 'Pending', user_id: 'user_002', user_profile: 'https://thispersondoesnotexist.com/' },
  ]);
}
