import { getDb } from '../../database/db';
import { Flashcard } from './models/Learning';
import { generateId } from '../../shared/utils/id';

export class FlashcardRepository {
  async addFlashcard(card: Omit<Flashcard, 'id' | 'createdAt'>): Promise<Flashcard> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();
    const newCard: Flashcard = { ...card, id, createdAt: now };

    await db.runAsync(
      'INSERT INTO flashcards (id, knowledgeItemId, front, back, nextReviewAt, interval, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, card.knowledgeItemId || null, card.front, card.back, card.nextReviewAt || null, card.interval, now]
    );

    return newCard;
  }

  async getDueCards(): Promise<Flashcard[]> {
    const db = await getDb();
    const now = new Date().toISOString();
    return await db.getAllAsync<any>(
      'SELECT * FROM flashcards WHERE nextReviewAt IS NULL OR nextReviewAt <= ?',
      [now]
    );
  }

  async updateReviewState(id: string, nextReviewAt: string, interval: number): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE flashcards SET nextReviewAt = ?, interval = ? WHERE id = ?',
      [nextReviewAt, interval, id]
    );
  }
}

export const flashcardRepository = new FlashcardRepository();
