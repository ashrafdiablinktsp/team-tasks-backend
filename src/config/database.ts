import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { config } from "./env";

let db: Database | null = null;

export const connectDB = async () => {
  if (db) {
    return db;
  }

  db = await open({
    filename: config.DATABASE_URL,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      position TEXT,
      jobDescription TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      assignedTo TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    );
  `);

  return db;
};

export const getDB = (): Database => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};
