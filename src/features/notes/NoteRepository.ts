import { getDb } from '../../database/db';
import { Note } from './models/Note';
import { KnowledgeType } from '../knowledge/models/KnowledgeItem';
import { generateId } from '../../shared/utils/id';

export class NoteRepository {
  async create(title: string, content: string): Promise<Note> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();

    const note: Note = {
      id,
      type: KnowledgeType.NOTE,
      title,
      content,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      'INSERT INTO knowledge_items (id, type, title, content, isFavorite, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [note.id, note.type, note.title, note.content, note.isFavorite ? 1 : 0, note.createdAt, note.updatedAt]
    );

    return note;
  }

  async getAll(): Promise<Note[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM knowledge_items WHERE type = ? ORDER BY updatedAt DESC',
      [KnowledgeType.NOTE]
    );

    return rows.map(row => ({
      ...row,
      isFavorite: !!row.isFavorite,
    }));
  }

  async update(id: string, updates: Partial<Note>): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();

    const sets = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates).map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v);

    await db.runAsync(
      `UPDATE knowledge_items SET ${sets}, updatedAt = ? WHERE id = ?`,
      [...values, now, id]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM knowledge_items WHERE id = ?', [id]);
  }
}

export const noteRepository = new NoteRepository();
