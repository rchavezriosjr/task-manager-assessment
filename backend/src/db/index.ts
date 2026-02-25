import { Database } from './types';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

// Configurar instrucciones para PostgreSQL
const dialect = new PostgresDialect({
  // Creamos un Pool de conexiones
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Máximo de conexiones simultáneas permitidas
  })
});

// Instanciamos y exportamos nuestra conexión a la base de datos
export const db = new Kysely<Database>({
  dialect,
});