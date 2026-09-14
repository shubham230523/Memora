import { useHomeStore } from '../HomeStore';
import { knowledgeRepository } from '../../knowledge/KnowledgeRepository';

jest.mock('../../knowledge/KnowledgeRepository', () => ({
  knowledgeRepository: {
    getStats: jest.fn(),
    getRecent: jest.fn(),
  },
}));

describe('HomeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default stats', () => {
    const state = useHomeStore.getState();
    expect(state.stats.totalItems).toBe(0);
  });

  it('updates stats after fetching', async () => {
    (knowledgeRepository.getStats as jest.Mock).mockResolvedValue({
      totalItems: 10,
      itemsThisWeek: 2,
      knowledgeGaps: 1,
    });
    (knowledgeRepository.getRecent as jest.Mock).mockResolvedValue([]);

    await useHomeStore.getState().fetchHomeData();
    expect(useHomeStore.getState().stats.totalItems).toBe(10);
  });

  it('fetchHomeData should handle errors', async () => {
    (knowledgeRepository.getStats as jest.Mock).mockRejectedValue(new Error('fail'));
    await useHomeStore.getState().fetchHomeData();
    expect(useHomeStore.getState().isLoading).toBe(false);
  });
});
