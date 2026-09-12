import { getDb } from '../../database/db';
import { KnowledgeItem, KnowledgeType } from './models/KnowledgeItem';

export interface KnowledgeFilter {
  type?: KnowledgeType;
  isFavorite?: boolean;
  search?: string;
}

export class KnowledgeRepository {
  async getAll(filter: KnowledgeFilter = {}): Promise<KnowledgeItem[]> {
    const db = await getDb();
    let query = 'SELECT * FROM knowledge_items WHERE 1=1';
    const params: any[] = [];

    if (filter.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }

    if (filter.isFavorite !== undefined) {
      query += ' AND isFavorite = ?';
      params.push(filter.isFavorite ? 1 : 0);
    }

    if (filter.search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    query += ' ORDER BY isFavorite DESC, updatedAt DESC';

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map(row => ({
      ...row,
      isFavorite: !!row.isFavorite,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  async getStats(): Promise<{ totalItems: number; itemsThisWeek: number; knowledgeGaps: number }> {
    const db = await getDb();

    // Total items
    const totalResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM knowledge_items');

    // Items this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM knowledge_items WHERE createdAt > ?',
      [weekAgo.toISOString()]
    );

    // Knowledge gaps (placeholder logic: items without content or specific metadata)
    const gapsResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM knowledge_items WHERE content = "" OR content IS NULL'
    );

    return {
      totalItems: totalResult?.count || 0,
      itemsThisWeek: weekResult?.count || 0,
      knowledgeGaps: gapsResult?.count || 0,
    };
  }

  async getRecent(limit: number = 5): Promise<KnowledgeItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM knowledge_items ORDER BY createdAt DESC LIMIT ?',
      [limit]
    );

    return rows.map(row => ({
      ...row,
      isFavorite: !!row.isFavorite,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE knowledge_items SET isFavorite = ? WHERE id = ?',
      [isFavorite ? 1 : 0, id]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM knowledge_items WHERE id = ?', [id]);
  }
}

export const knowledgeRepository = new KnowledgeRepository();
