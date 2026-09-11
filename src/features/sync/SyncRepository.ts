import { getDb } from '../../database/db';
import { SyncQueueItem, SyncOperation, SyncStatus } from './models/Sync';
import { generateId } from '../../shared/utils/id';

export class SyncRepository {
  async addToQueue(entityType: string, entityId: string, operation: SyncOperation, payload?: any): Promise<void> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO sync_queue (id, entityType, entityId, operation, payload, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, entityType, entityId, operation, payload ? JSON.stringify(payload) : null, SyncStatus.PENDING, now]
    );
  }

  async getPending(): Promise<SyncQueueItem[]> {
    const db = await getDb();
    return await db.getAllAsync<any>(
      'SELECT * FROM sync_queue WHERE status = ? OR (status = ? AND retryCount < 3) ORDER BY createdAt ASC',
      [SyncStatus.PENDING, SyncStatus.FAILED]
    );
  }

  async updateStatus(id: string, status: SyncStatus, error?: string): Promise<void> {
    const db = await getDb();
    if (status === SyncStatus.FAILED) {
      await db.runAsync(
        'UPDATE sync_queue SET status = ?, error = ?, retryCount = retryCount + 1 WHERE id = ?',
        [status, error || null, id]
      );
    } else {
      await db.runAsync(
        'UPDATE sync_queue SET status = ?, error = NULL WHERE id = ?',
        [status, id]
      );
    }
  }
}

export const syncRepository = new SyncRepository();
