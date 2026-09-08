import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/library.db';
const absoluteDbPath = path.resolve(process.cwd(), dbPath);

const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(absoluteDbPath, (err) => {
  if (err) {
    console.error(`[DB Error] Failed to connect to SQLite database at ${absoluteDbPath}:`, err.message);
  }
});

db.run('PRAGMA foreign_keys = ON;');

export const runQuery = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T);
    });
  });
};

export const allQuery = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
};

export const initSchema = async (): Promise<void> => {
  const schemaPath = path.resolve(process.cwd(), 'src/backend/database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    db.exec(sql, async (err) => {
      if (err) {
        console.error('[DB Error] Schema initialization failed:', err);
        return reject(err);
      }
      
      // Auto-migrate missing columns for backward compatibility
      try {
        await runQuery('ALTER TABLE books ADD COLUMN cover_image TEXT;').catch(() => {});
        await runQuery('ALTER TABLE books ADD COLUMN description TEXT;').catch(() => {});
      } catch (migrationErr) {
        // Ignored if columns already exist
      }

      resolve();
    });
  });
};

