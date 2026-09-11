import { z } from 'zod';

export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export enum RelationshipType {
  RELATED_TO = 'RELATED_TO',
  PART_OF = 'PART_OF',
  PREREQUISITE_OF = 'PREREQUISITE_OF',
  SIMILAR_TO = 'SIMILAR_TO',
  CONTRASTS_WITH = 'CONTRASTS_WITH',
  USED_WITH = 'USED_WITH',
}

export const RelationshipSchema = z.object({
  id: z.string(),
  sourceId: z.string(), // KnowledgeItem or Concept ID
  targetId: z.string(),
  type: z.nativeEnum(RelationshipType),
  strength: z.number().min(0).max(1).default(1),
});

export type Tag = z.infer<typeof TagSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
