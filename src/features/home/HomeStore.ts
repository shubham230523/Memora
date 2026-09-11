import { create } from 'zustand';

interface HomeState {
  stats: {
    totalItems: number;
    itemsThisWeek: number;
    knowledgeGaps: number;
  };
  recentItems: any[];
  isLoading: boolean;
  fetchHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  stats: {
    totalItems: 0,
    itemsThisWeek: 0,
    knowledgeGaps: 0,
  },
  recentItems: [],
  isLoading: false,

  fetchHomeData: async () => {
    set({ isLoading: true });
    // TODO: Fetch from DB/API
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      stats: { totalItems: 42, itemsThisWeek: 5, knowledgeGaps: 3 },
      recentItems: [],
      isLoading: false
    });
  },
}));
