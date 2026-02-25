//Importaciones (Frameworks, librerías, modulos, etc.)
import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { sql } from 'kysely';
import { db } from './db';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';

dotenv.config();

//Instanciar el Server
const app = fastify(
    {
        logger: true // Habilita el logger para registrar las solicitudes y respuestas en la consola
    }
);

//Se registran middlewares
app.register(cors, {
    origin: '*', // Permite solicitudes desde cualquier origen
});

// Registrar el plugin JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
});

//Registrar rutas de autenticacion (usando /api para no confundirme)
app.register(authRoutes, { prefix: '/api/auth' });
// Rutas de tareas
app.register(taskRoutes, { prefix: '/api/tasks' });

//Ruta Test
app.get('/ping', async (request, reply) => {
    return {status: 'ok', message: 'Manoloooo'};
});

//Iniciar el servidor
const start = async () => {
  try {
    await sql`SELECT 1`.execute(db);
    console.log('Conexion a la Base de Datos establecida con exito.');

    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor corriendo en http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();