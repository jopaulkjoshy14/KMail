import knex from 'knex';
import { config } from './config';

export const db = knex({
  client: 'pg',
  connection: config.database.url,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
