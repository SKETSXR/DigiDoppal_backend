import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/env.js';
import * as schema from './schema.js';

// Create postgres connection
const queryClient = postgres(config.database.url);

// Create drizzle instance
export const db = drizzle(queryClient, { schema });

// Test connection
export async function testConnection() {
  try {
    await queryClient`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeConnection() {
  await queryClient.end();
  console.log('✅ Database connection closed');
}