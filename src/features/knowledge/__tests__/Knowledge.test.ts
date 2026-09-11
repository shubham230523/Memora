import { useKnowledgeStore } from '../KnowledgeStore';
import { knowledgeRepository } from '../KnowledgeRepository';

jest.mock('../KnowledgeRepository', () => ({
  knowledgeRepository: {
    getAll: jest.fn(async () => []),
    toggleFavorite: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('KnowledgeStore', () => {
  it('initializes with empty items', () => {
    const state = useKnowledgeStore.getState();
    expect(state.items).toEqual([]);
  });

  it('fetches items from repository', async () => {
    const mockItems = [{ id: '1', title: 'Test' }];
    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue(mockItems);

    await useKnowledgeStore.getState().fetchItems();

    expect(useKnowledgeStore.getState().items).toEqual(mockItems);
  });
});
