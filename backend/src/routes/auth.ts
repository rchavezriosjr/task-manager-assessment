import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { db } from '../db';

// Exportar rutas
export async function authRoutes(app: FastifyInstance) {
  
  // Endpoint para registrar un usuario (Sign Up)
  app.post('/signup', async (request, reply) => {
    // 1. Extraemos los datos que el usuario envia en el body de la peticion
    const { email, password, role } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Datos Incompletos, revise e intente de nuevo' });
    }

    // 2. Verificamos que el correo no este registrado ya
    const existingUser = await db.selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingUser) {
      return reply.status(409).send({ error: 'Este email ya está en uso' });
    }

    // 3. Encriptamos la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Guardamos el nuevo usuario en la base de datos
    const newUser = await db.insertInto('users')
      .values({
        email,
        password_hash: passwordHash,
        role: role || 'USER', // Si no mandan rol, por defecto es USER
      })
      .returningAll() // Le pedimos a Kysely que nos devuelva los datos creados
      .executeTakeFirstOrThrow();

    // 5. Generamos el JWT (JSON WEB TOKEN)
    const token = app.jwt.sign({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    });

    // 6. Respondemos al cliente con código 201 (creado) y el token
    return reply.status(201).send({
      message: 'Usuario creado con éxito',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    });
  });

  // Endpoint para iniciar sesión (Login)
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'El email y el password son requeridos' });
    }

    // 1. Buscamos al usuario en la base de datos por su email
    const user = await db.selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    // Si no existe, damos un mensaje genérico por seguridad
    if (!user) {
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    // 2. Comparamos la contraseña en texto plano con el Hash guardado
    // bcrypt hace la matemática pesada para saber si coinciden
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    // 3. Si todo está bien, generamos un nuevo JWT
    const token = app.jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    // 4. Se lo enviamos al cliente
    return reply.status(200).send({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  });
}