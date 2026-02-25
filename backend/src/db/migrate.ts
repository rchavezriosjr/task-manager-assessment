import * as path from 'path';
import { promises as fs } from 'fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from './index';

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // Le decimos dónde encontrar nuestras migraciones
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  // Ejecutamos las migraciones
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`SUCCESS - Migración "${it.migrationName}" ejecutada con éxito.`);
    } else if (it.status === 'Error') {
      console.error(`ERROR en la migración "${it.migrationName}".`);
    }
  });

  if (error) {
    console.error('ERROR fatal al migrar:', error);
    process.exit(1);
  }

  // Cerramos la conexión para que el script termine
  await db.destroy();
}

migrateToLatest();