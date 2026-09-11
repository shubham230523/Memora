import { useSearchStore } from '../SearchStore';
import { knowledgeRepository } from '../../knowledge/KnowledgeRepository';

jest.mock('../../knowledge/KnowledgeRepository', () => ({
  knowledgeRepository: {
    getAll: jest.fn(async () => []),
  },
}));

describe('SearchStore', () => {
  it('performs search when query is set', async () => {
    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue([{ id: '1', title: 'Find Me' }]);

    const store = useSearchStore.getState();
    store.setQuery('find');
    await store.performSearch();

    expect(useSearchStore.getState().results[0].title).toBe('Find Me');
  });
});
