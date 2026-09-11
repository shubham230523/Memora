import { z } from 'zod';

export const ChunkSchema = z.object({
  id: z.string(),
  knowledgeItemId: z.string(),
  content: z.string(),
  index: z.number(), // Order in document
  metadata: z.record(z.any()).optional(),
});

export const CitationSchema = z.object({
  id: z.string(),
  knowledgeItemId: z.string(),
  chunkId: z.string().optional(),
  text: z.string(), // Excerpt being cited
  pageNumber: z.number().optional(),
  section: z.string().optional(),
});

export type Chunk = z.infer<typeof ChunkSchema>;
export type Citation = z.infer<typeof CitationSchema>;
