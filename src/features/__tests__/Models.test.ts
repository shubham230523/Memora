import { UserSchema } from '../auth/models/User';
import { KnowledgeItemSchema, KnowledgeType } from '../knowledge/models/KnowledgeItem';

describe('Domain Models Validation', () => {
  it('validates a correct User object', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(UserSchema.parse(user)).toEqual(user);
  });

  it('fails on invalid email', () => {
    const user = {
      id: '1',
      email: 'invalid-email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(user)).toThrow();
  });

  it('validates a correct KnowledgeItem', () => {
    const item = {
      id: 'k1',
      type: KnowledgeType.NOTE,
      title: 'My Note',
      content: 'This is a note',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(KnowledgeItemSchema.parse(item)).toEqual(item);
  });
});
