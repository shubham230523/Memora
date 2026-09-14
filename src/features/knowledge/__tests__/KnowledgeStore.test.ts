import { useKnowledgeStore } from '../KnowledgeStore';
import { knowledgeRepository } from '../KnowledgeRepository';

jest.mock('../KnowledgeRepository', () => ({
  knowledgeRepository: {
    getAll: jest.fn(),
    toggleFavorite: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('KnowledgeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useKnowledgeStore.setState({
      items: [],
      isLoading: false,
      filter: {},
    });
  });

  it('fetchItems should update items state', async () => {
    const mockItems = [{ id: '1', title: 'K1' }];
    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue(mockItems);

    await useKnowledgeStore.getState().fetchItems();

    expect(useKnowledgeStore.getState().items).toEqual(mockItems);
    expect(useKnowledgeStore.getState().isLoading).toBe(false);
  });

  it('setFilter should update filter and fetch items', async () => {
    const fetchSpy = jest.spyOn(useKnowledgeStore.getState(), 'fetchItems');

    useKnowledgeStore.getState().setFilter({ search: 'test' });

    expect(useKnowledgeStore.getState().filter).toEqual({ search: 'test' });
    expect(knowledgeRepository.getAll).toHaveBeenCalledWith({ search: 'test' });
  });

  it('toggleFavorite should update state locally and in repository', async () => {
    useKnowledgeStore.setState({ items: [{ id: '1', isFavorite: false }] as any });

    await useKnowledgeStore.getState().toggleFavorite('1');

    expect(knowledgeRepository.toggleFavorite).toHaveBeenCalledWith('1', true);
    expect(useKnowledgeStore.getState().items[0].isFavorite).toBe(true);
  });

  it('deleteItem should remove item from state', async () => {
    useKnowledgeStore.setState({ items: [{ id: '1' }, { id: '2' }] as any });

    await useKnowledgeStore.getState().deleteItem('1');

    expect(knowledgeRepository.delete).toHaveBeenCalledWith('1');
    expect(useKnowledgeStore.getState().items.length).toBe(1);
    expect(useKnowledgeStore.getState().items[0].id).toBe('2');
  });

  it('setLoading should update loading state', () => {
    useKnowledgeStore.getState().setLoading(true, 'Test Label');
    expect(useKnowledgeStore.getState().isLoading).toBe(true);
    expect(useKnowledgeStore.getState().loadingLabel).toBe('Test Label');
  });

  it('fetchItems should handle errors', async () => {
    (knowledgeRepository.getAll as jest.Mock).mockRejectedValue(new Error('fail'));
    await useKnowledgeStore.getState().fetchItems();
    expect(useKnowledgeStore.getState().isLoading).toBe(false);
  });
});
