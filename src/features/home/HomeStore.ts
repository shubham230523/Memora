import { create } from 'zustand';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';

interface HomeState {
  stats: {
    totalItems: number;
    itemsThisWeek: number;
  };
  recentItems: any[];
  isLoading: boolean;
  fetchHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  stats: {
    totalItems: 0,
    itemsThisWeek: 0,
  },
  recentItems: [],
  isLoading: false,

  fetchHomeData: async () => {
    set({ isLoading: true });
    try {
      const [stats, recentItems] = await Promise.all([
        knowledgeRepository.getStats(),
        knowledgeRepository.getRecent(5)
      ]);

      set({ stats, recentItems, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch home data', error);
      set({ isLoading: false });
    }
  },
}));
