import { FastifyInstance } from 'fastify';
import { db } from '../db';

export async function taskRoutes(app: FastifyInstance) {
  
  // Verifica que el usuario haya enviado un token válido en los Headers.
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'No autorizado. Token inválido o faltante.' });
    }
  });

  // --------------------------------------------------------
  // 1. CREAR UNA TAREA (POST)
  // --------------------------------------------------------
  app.post('/', async (request, reply) => {
    // request.user contiene los datos del token decodificado (id, email, role)
    const user = request.user as { id: string; role: string };
    const { title, description } = request.body as any;

    if (!title) {
      return reply.status(400).send({ error: 'El título de la tarea es obligatorio' });
    }

    // Insertamos la nueva tarea en la base de datos, asociándola al usuario que la creó (user.id)
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
  // 2. OBTENER LAS TAREAS (GET) + Filtros + Paginación 
  // --------------------------------------------------------
  app.get('/', async (request, reply) => {
    const user = request.user as { id: string; role: string };
    
    // Extraemos de la URL los parámetros (ej: ?status=PENDING&page=1&limit=10)
    const { status, page = 1, limit = 10 } = request.query as any;

    // Convertimos a números para la paginación de SQL
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    // Empezamos a construir la consulta base
    let query = db.selectFrom('tasks').selectAll();


    // Si NO es admin, forzamos a que solo vea las suyas.
    if (user.role !== 'ADMIN') {
      query = query.where('user_id', '=', user.id);
    }

    // Aplicar Filtro de Estado (Si el usuario lo mandó)
    if (status) {
      query = query.where('status', '=', status);
    }

    // Aplicar Paginación
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
  // 3. ACTUALIZAR UNA TAREA (PATCH)
  // --------------------------------------------------------
  // Usamos un parámetro dinámico en la URL: /:id
  app.patch('/:id', async (request, reply) => {
    const user = request.user as { id: string; role: string };
    const { id } = request.params as { id: string };
    const { title, description, status } = request.body as any;

    // Solo actualizamos los campos que el usuario haya enviado
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // Si no envió nada para actualizar, respondemos con error
    if (Object.keys(updateData).length === 0) {
      return reply.status(400).send({ error: 'No se enviaron datos para actualizar' });
    }

    // Ejecutamos la actualización
    const updatedTask = await db.updateTable('tasks')
      .set(updateData)
      .where('id', '=', id)
      //Nadie puede modificar una tarea que no sea suya
      .where('user_id', '=', user.id) 
      .returningAll()
      .executeTakeFirst();

    // Si updatedTask es indefinido, significa que el ID no existe O no le pertenece al usuario
    if (!updatedTask) {
      return reply.status(404).send({ error: 'Tarea no encontrada o no tienes permisos' });
    }

    return reply.send(updatedTask);
  });

  // --------------------------------------------------------
  // 4. BORRAR UNA TAREA (DELETE)
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
      return reply.status(404).send({ error: 'Tarea no encontrada o no tienes permisos' });
    }

    return reply.send({ message: 'Tarea eliminada con éxito', deletedTask });
  });
}