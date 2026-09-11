import { getDb } from '../../database/db';
import { Tag } from './models/Graph';
import { generateId } from '../../shared/utils/id';

export class TagRepository {
  async getAll(): Promise<Tag[]> {
    const db = await getDb();
    return await db.getAllAsync<any>('SELECT * FROM tags ORDER BY name ASC');
  }

  async create(name: string): Promise<Tag> {
    const db = await getDb();
    const id = generateId();
    await db.runAsync('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)', [id, name]);
    const tag = await db.getFirstAsync<any>('SELECT * FROM tags WHERE name = ?', [name]);
    return tag;
  }

  async linkToItem(itemId: string, tagId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('INSERT OR IGNORE INTO item_tags (itemId, tagId) VALUES (?, ?)', [itemId, tagId]);
  }

  async getForItem(itemId: string): Promise<Tag[]> {
    const db = await getDb();
    return await db.getAllAsync<any>(
      'SELECT t.* FROM tags t JOIN item_tags it ON t.id = it.tagId WHERE it.itemId = ?',
      [itemId]
    );
  }
}

export const tagRepository = new TagRepository();
