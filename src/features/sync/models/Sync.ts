import { z } from 'zod';

export enum SyncOperation {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

export const SyncQueueItemSchema = z.object({
  id: z.string(),
  entityType: z.string(), // e.g., 'KnowledgeItem'
  entityId: z.string(),
  operation: z.nativeEnum(SyncOperation),
  payload: z.any().optional(),
  status: z.nativeEnum(SyncStatus),
  retryCount: z.number().default(0),
  error: z.string().optional(),
  createdAt: z.string(),
});

export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;
