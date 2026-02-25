import { Generated } from 'kysely';

//Tabla de Usuarios
export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  role: string;
  created_at: Generated<Date>;
}

//Tabla de Tareas
export interface TasksTable {
  id: Generated<string>;
  title: string;
  description: string | null;
  status: Generated<string>;
  user_id: string;
  created_at: Generated<Date>;
}

//Exportamos el Esquema
export interface Database {
  users: UsersTable;
  tasks: TasksTable;
}