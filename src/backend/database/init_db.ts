import { initSchema, db } from './db.js';

console.log('[DB Init] Initializing database schema...');
initSchema()
  .then(() => {
    console.log('[DB Init] Schema created successfully.');
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[DB Init Error] Failed to initialize schema:', err);
    db.close();
    process.exit(1);
  });
