import { initDb, getDb } from '../db';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => {}),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
  })),
}));

describe('Database', () => {
  it('initializes the database without errors', async () => {
    await expect(initDb()).resolves.not.toThrow();
  });

  it('provides a database instance', async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    expect(db.execAsync).toBeDefined();
  });

  it('getDb should throw if openDatabaseAsync fails', async () => {
    const SQLite = require('expo-sqlite');
    const originalOpen = SQLite.openDatabaseAsync;
    SQLite.openDatabaseAsync = jest.fn().mockRejectedValue(new Error('Locked'));

    // We isolate to avoid messing with other tests and to trigger the init block
    jest.isolateModules(async () => {
      const { getDb } = require('../db');
      await expect(getDb()).rejects.toThrow('Locked');
    });

    SQLite.openDatabaseAsync = originalOpen;
  });
});
