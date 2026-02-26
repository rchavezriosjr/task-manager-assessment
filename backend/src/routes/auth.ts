import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { db } from '../db';

// Export routes
export async function authRoutes(app: FastifyInstance) {
  
  // Endpoint to register a user (Sign Up)
  app.post('/signup', async (request, reply) => {
    // 1. Extract the data the user sends in the request body
    const { email, password, role } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Incomplete data, please check and try again' });
    }

    // 2. Check that the email isn't already registered
    const existingUser = await db.selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingUser) {
      return reply.status(409).send({ error: 'Email already in use' });
    }

    // 3. Encrypt the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Save the new user to the database
    const newUser = await db.insertInto('users')
      .values({
        email,
        password_hash: passwordHash,
        role: role || 'USER', // If no role is sent, default to USER
      })
      .returningAll() // Ask Kysely to return the created data
      .executeTakeFirstOrThrow();

    // 5. Generate the JWT (JSON WEB TOKEN)
    const token = app.jwt.sign({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    });

    // 6. Respond to the client with status 201 (created) and the token
    return reply.status(201).send({
      message: 'User created successfully',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    });
  });

  // Endpoint to log in (Login)
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email/Password Required' });
    }

    // 1. Look up the user in the database by email
    const user = await db.selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    // If none exists, give a generic message for security
    if (!user) {
      return reply.status(401).send({ error: 'Invalid Credentials' });
    }

    // 2. Compare the plaintext password with the stored hash
    // bcrypt does the heavy math to verify a match
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Invalid Credentials' });
    }

    // 3. If everything checks out, generate a new JWT
    const token = app.jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    // 4. Send it back to the client
    return reply.status(200).send({
      message: 'Successfully logged in',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  });
}