import { appConfig } from '../core/config/appConfig';
import { logger } from '../core/logging/Logger';

// Safely require expo-sqlite to prevent crash if native module is missing
let SQLite: typeof import('expo-sqlite') | null = null;
try {
  SQLite = require('expo-sqlite');
} catch (e) {
  logger.warn('expo-sqlite not found or native module missing');
}

let db: any = null;

export const getDb = async () => {
  if (db) return db;
  if (!SQLite) {
    throw new Error('Database not available in this environment');
  }

  try {
    db = await SQLite.openDatabaseAsync(appConfig.persistence.dbName);
    logger.info(`Database ${appConfig.persistence.dbName} opened successfully`);
    return db;
  } catch (error) {
    logger.error('Failed to open database', error);
    throw error;
  }
};

export const initDb = async () => {
  if (!SQLite) {
    logger.warn('Skipping DB init: SQLite not available');
    return;
  }
  const database = await getDb();

  // Enable foreign keys
  await database.execAsync('PRAGMA foreign_keys = ON;');

  // Basic migrations logic
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatarUrl TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      sourceUrl TEXT,
      metadata TEXT,
      isFavorite INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS item_tags (
      itemId TEXT NOT NULL,
      tagId TEXT NOT NULL,
      PRIMARY KEY (itemId, tagId),
      FOREIGN KEY (itemId) REFERENCES knowledge_items (id) ON DELETE CASCADE,
      FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY NOT NULL,
      sourceId TEXT NOT NULL,
      targetId TEXT NOT NULL,
      type TEXT NOT NULL,
      strength REAL DEFAULT 1.0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY NOT NULL,
      knowledgeItemId TEXT NOT NULL,
      content TEXT NOT NULL,
      "index" INTEGER NOT NULL,
      metadata TEXT,
      FOREIGN KEY (knowledgeItemId) REFERENCES knowledge_items (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      lastMessageAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      conversationId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      citations TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (conversationId) REFERENCES conversations (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT,
      status TEXT NOT NULL,
      retryCount INTEGER DEFAULT 0,
      error TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY NOT NULL,
      knowledgeItemId TEXT,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      nextReviewAt TEXT,
      interval INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      score REAL,
      createdAt TEXT NOT NULL
    );
  `);

  logger.info('Database initialized with core tables');
};
