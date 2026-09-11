import { KnowledgeItem, KnowledgeType } from '../../knowledge/models/KnowledgeItem';

export interface Note extends KnowledgeItem {
  type: KnowledgeType.NOTE;
}
