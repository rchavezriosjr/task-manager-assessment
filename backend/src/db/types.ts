import { Generated } from 'kysely';

// Users table
export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  role: string;
  created_at: Generated<Date>;
}

// Tasks table
export interface TasksTable {
  id: Generated<string>;
  title: string;
  description: string | null;
  status: Generated<string>;
  user_id: string;
  created_at: Generated<Date>;
}

// Export the schema
export interface Database {
  users: UsersTable;
  tasks: TasksTable;
}