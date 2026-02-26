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
      // Tell it where to find our migrations
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  // Run the migrations
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`SUCCESS - "${it.migrationName}"`);
    } else if (it.status === 'Error') {
      console.error(`ERROR  "${it.migrationName}".`);
    }
  });

  if (error) {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  }

  // Close the connection so the script can finish
  await db.destroy();
}

migrateToLatest();