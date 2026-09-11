import { z } from 'zod';
import { CitationSchema } from '../../knowledge/models/Chunk';

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  citations: z.array(CitationSchema).optional(),
  createdAt: z.string(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  lastMessageAt: z.string(),
  createdAt: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
