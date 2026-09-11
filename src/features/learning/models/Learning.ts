import { z } from 'zod';

export const FlashcardSchema = z.object({
  id: z.string(),
  knowledgeItemId: z.string().optional(),
  front: z.string(),
  back: z.string(),
  nextReviewAt: z.string().optional(),
  interval: z.number().default(0), // SRS interval
  createdAt: z.string(),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'CODE']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
});

export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  questions: z.array(QuizQuestionSchema),
  score: z.number().optional(),
  createdAt: z.string(),
});

export enum ConceptState {
  KNOWN = 'KNOWN',
  WEAK = 'WEAK',
  MISSING = 'MISSING',
}

export const LearningStateSchema = z.object({
  conceptId: z.string(),
  state: z.nativeEnum(ConceptState),
  lastReviewedAt: z.string().optional(),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type LearningState = z.infer<typeof LearningStateSchema>;
