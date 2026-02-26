import { FastifyInstance } from 'fastify';
import { db } from '../db';

export async function taskRoutes(app: FastifyInstance) {
  
  // Verify the user sent a valid token in the headers.
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Forbidden - Invalid or missing token' });
    }
  });

  // --------------------------------------------------------
  // 1. CREATE A TASK (POST)
  // --------------------------------------------------------
  app.post('/', async (request, reply) => {
    // request.user contains decoded token data (id, email, role)
    const user = request.user as { id: string; role: string };
    const { title, description } = request.body as any;

    if (!title) {
      return reply.status(400).send({ error: 'Title is required' });
    }

    // Insert the new task into the database, associating it with the user who created it (user.id)
    const newTask = await db.insertInto('tasks')
      .values({
        title,
        description: description || null,
        user_id: user.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return reply.status(201).send(newTask);
  });

  // --------------------------------------------------------
  // 2. GET TASKS (GET) + Filters + Pagination 
  // --------------------------------------------------------
  app.get('/', async (request, reply) => {
    const user = request.user as { id: string; role: string };
    
    // Extract parameters from the URL (e.g. ?status=PENDING&page=1&limit=10)
    const { status, page = 1, limit = 3 } = request.query as any;

    // Convert to numbers for SQL pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    // Empezamos a construir la consulta base
    let query = db.selectFrom('tasks').selectAll();


    // If NOT admin, force them to only see their own.
    if (user.role !== 'ADMIN') {
      query = query.where('user_id', '=', user.id);
    }

    // Apply status filter (if the user provided it)
    if (status) {
      query = query.where('status', '=', status);
    }

    // Apply pagination
    query = query.limit(limitNum).offset(offset).orderBy('created_at', 'desc');

    const tasks = await query.execute();

    return reply.send({
      page: pageNum,
      limit: limitNum,
      total_in_page: tasks.length,
      data: tasks
    });
  });

  // --------------------------------------------------------
  // 3. UPDATE A TASK (PATCH)
  // --------------------------------------------------------
  // We use a dynamic parameter in the URL: /:id
  app.patch('/:id', async (request, reply) => {
    const user = request.user as { id: string; role: string };
    const { id } = request.params as { id: string };
    const { title, description, status } = request.body as any;

    // Only update the fields the user sent
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // If nothing was sent to update, respond with an error
    if (Object.keys(updateData).length === 0) {
      return reply.status(400).send({ error: 'No data was sent to update' });
    }

    // Execute the update
    const updatedTask = await db.updateTable('tasks')
      .set(updateData)
      .where('id', '=', id)
      // No one can modify a task that isn't theirs
      .where('user_id', '=', user.id) 
      .returningAll()
      .executeTakeFirst();

    // If updatedTask is undefined, the ID doesn't exist OR it doesn't belong to the user
    if (!updatedTask) {
      return reply.status(404).send({ error: 'Task not found or you do not have permission to update it' });
    }

    return reply.send(updatedTask);
  });

  // --------------------------------------------------------
  // 4. DELETE A TASK (DELETE)
  // --------------------------------------------------------
  app.delete('/:id', async (request, reply) => {
    const user = request.user as { id: string; role: string };
    const { id } = request.params as { id: string };

    const deletedTask = await db.deleteFrom('tasks')
      .where('id', '=', id)
      .where('user_id', '=', user.id)
      .returningAll()
      .executeTakeFirst();

    if (!deletedTask) {
      return reply.status(404).send({ error: 'Task not found or you do not have permission to delete it' });
    }

    return reply.send({ message: 'Task deleted successfully', deletedTask });
  });
}