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
});
