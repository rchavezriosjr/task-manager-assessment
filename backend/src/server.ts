// Imports (frameworks, libraries, modules, etc.)
import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { sql } from 'kysely';
import { db } from './db';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';

dotenv.config();

// Instantiate the server
const app = fastify(
    {
        logger: true // Enable logger to record requests and responses in the console
    }
);

// Register middlewares
app.register(cors, {
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
});

// Register JWT plugin
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
});

// Register authentication routes (using /api to avoid confusion)
app.register(authRoutes, { prefix: '/api/auth' });
// Task routes
app.register(taskRoutes, { prefix: '/api/tasks' });

// Test route
app.get('/ping', async (request, reply) => {
    return {status: 'ok', message: 'Manoloooo'};
});

// Start the server
const start = async () => {
  try {
    await sql`SELECT 1`.execute(db);
    console.log('Connection to the database was successful');

    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();