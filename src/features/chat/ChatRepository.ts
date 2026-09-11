import { getDb } from '../../database/db';
import { Conversation, Message } from './models/Conversation';
import { generateId } from '../../shared/utils/id';

export class ChatRepository {
  async createConversation(title?: string): Promise<Conversation> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();
    const conversation: Conversation = { id, title, lastMessageAt: now, createdAt: now };

    await db.runAsync(
      'INSERT INTO conversations (id, title, lastMessageAt, createdAt) VALUES (?, ?, ?, ?)',
      [id, title || null, now, now]
    );
    return conversation;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC',
      [conversationId]
    );
    return rows.map(row => ({
      ...row,
      citations: row.citations ? JSON.parse(row.citations) : undefined,
    }));
  }

  async addMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();
    const newMessage: Message = { ...message, id, createdAt: now };

    await db.runAsync(
      'INSERT INTO messages (id, conversationId, role, content, citations, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, message.conversationId, message.role, message.content, message.citations ? JSON.stringify(message.citations) : null, now]
    );

    await db.runAsync(
      'UPDATE conversations SET lastMessageAt = ? WHERE id = ?',
      [now, message.conversationId]
    );

    return newMessage;
  }
}

export const chatRepository = new ChatRepository();
