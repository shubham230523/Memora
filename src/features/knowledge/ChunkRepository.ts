import { getDb } from '../../database/db';
import { Chunk } from './models/Chunk';
import { generateId } from '../../shared/utils/id';

export class ChunkRepository {
  async saveChunks(chunks: Omit<Chunk, 'id'>[]): Promise<void> {
    const db = await getDb();
    // Use transaction for multiple inserts
    await db.withTransactionAsync(async () => {
      for (const chunk of chunks) {
        const id = generateId();
        await db.runAsync(
          'INSERT INTO chunks (id, knowledgeItemId, content, "index", metadata) VALUES (?, ?, ?, ?, ?)',
          [id, chunk.knowledgeItemId, chunk.content, chunk.index, chunk.metadata ? JSON.stringify(chunk.metadata) : null]
        );
      }
    });
  }

  async getForItem(itemId: string): Promise<Chunk[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM chunks WHERE knowledgeItemId = ? ORDER BY "index" ASC',
      [itemId]
    );
    return rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }
}

export const chunkRepository = new ChunkRepository();
