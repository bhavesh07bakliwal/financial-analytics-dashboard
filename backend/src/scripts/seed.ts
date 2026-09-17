/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { env } from '../config/env';
import { TransactionDTO } from '../types';

const DATA_PATH = path.resolve(__dirname, '../../../data/transactions.json');
const isReset = process.argv.includes('--reset');

async function seedTransactions(): Promise<void> {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const transactions: TransactionDTO[] = JSON.parse(raw);

  if (isReset) {
    await Transaction.deleteMany({});
    console.log('[seed] cleared existing transactions (--reset)');
  }

  // Upsert by `id` so the script is safe to re-run without duplicating records.
  const operations = transactions.map((tx) => ({
    updateOne: {
      filter: { id: tx.id },
      update: {
        $set: {
          id: tx.id,
          date: new Date(tx.date),
          amount: tx.amount,
          category: tx.category,
          status: tx.status,
          user_id: tx.user_id,
          user_profile: tx.user_profile,
        },
      },
      upsert: true,
    },
  }));

  const result = await Transaction.bulkWrite(operations);
  console.log(
    `[seed] transactions upserted=${result.upsertedCount} modified=${result.modifiedCount} matched=${result.matchedCount}`
  );
}

async function seedDemoUser(): Promise<void> {
  const passwordHash = await bcrypt.hash(env.demoPassword, 10);
  await User.updateOne(
    { email: env.demoEmail },
    { $set: { name: 'Demo Analyst', email: env.demoEmail, passwordHash } },
    { upsert: true }
  );
  console.log(`[seed] demo user ready -> ${env.demoEmail}`);
}

async function main(): Promise<void> {
  await connectDatabase();
  await seedTransactions();
  await seedDemoUser();
  await disconnectDatabase();
  console.log('[seed] done');
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
