import { Database } from './types';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import dotenv from 'dotenv';

// Load variables from the .env file
dotenv.config();

// Set up configuration for PostgreSQL
const dialect = new PostgresDialect({
  // Create a connection pool
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Maximum allowed simultaneous connections
  })
});

// Instantiate and export our database connection
export const db = new Kysely<Database>({
  dialect,
});