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

    query += ' ORDER BY updatedAt DESC';

    const rows = await db.getAllAsync<any>(query, params);
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
