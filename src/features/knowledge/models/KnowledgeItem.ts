import { z } from 'zod';

export enum KnowledgeType {
  NOTE = 'NOTE',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  SCREENSHOT = 'SCREENSHOT',
  VOICE = 'VOICE',
  WEBPAGE = 'WEBPAGE',
  CODE = 'CODE',
}

export const KnowledgeItemSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(KnowledgeType),
  title: z.string(),
  content: z.string(), // Extracted or original text
  summary: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  isFavorite: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type KnowledgeItem = z.infer<typeof KnowledgeItemSchema>;
