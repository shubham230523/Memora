import { useSearchStore } from '../SearchStore';
import { knowledgeRepository } from '../../knowledge/KnowledgeRepository';

jest.mock('../../knowledge/KnowledgeRepository', () => ({
  knowledgeRepository: {
    getAll: jest.fn(async () => []),
  },
}));

describe('SearchStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchStore.setState({ query: '', results: [], isLoading: false });
  });

  it('performs search when query is set', async () => {
    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue([{ id: '1', title: 'Find Me' }]);

    const store = useSearchStore.getState();
    store.setQuery('find');
    await store.performSearch();

    expect(useSearchStore.getState().results[0].title).toBe('Find Me');
    expect(useSearchStore.getState().isLoading).toBe(false);
  });

  it('should clear results for empty query', async () => {
    useSearchStore.setState({ query: '   ', results: [{ id: '1' }] as any });
    await useSearchStore.getState().performSearch();
    expect(useSearchStore.getState().results).toEqual([]);
  });

  it('should handle repository errors', async () => {
    (knowledgeRepository.getAll as jest.Mock).mockRejectedValue(new Error('fail'));
    useSearchStore.setState({ query: 'test' });

    await useSearchStore.getState().performSearch();

    expect(useSearchStore.getState().isLoading).toBe(false);
  });
});
