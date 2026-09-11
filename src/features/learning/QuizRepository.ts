import { getDb } from '../../database/db';
import { Quiz } from './models/Learning';
import { generateId } from '../../shared/utils/id';

export class QuizRepository {
  async saveQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();
    const newQuiz: Quiz = { ...quiz, id, createdAt: now };

    await db.runAsync(
      'INSERT INTO quizzes (id, title, questions, score, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, quiz.title, JSON.stringify(quiz.questions), quiz.score || null, now]
    );

    return newQuiz;
  }

  async getQuizzes(): Promise<Quiz[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM quizzes ORDER BY createdAt DESC');
    return rows.map(row => ({
      ...row,
      questions: JSON.parse(row.questions),
    }));
  }
}

export const quizRepository = new QuizRepository();
