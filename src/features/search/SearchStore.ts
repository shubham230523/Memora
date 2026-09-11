import { create } from 'zustand';
import { KnowledgeItem } from '../knowledge/models/KnowledgeItem';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';

interface SearchState {
  query: string;
  results: KnowledgeItem[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  performSearch: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isLoading: false,

  setQuery: (query) => set({ query }),

  performSearch: async () => {
    const { query } = get();
    if (!query.trim()) {
      set({ results: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      // Local keyword search
      const items = await knowledgeRepository.getAll({ search: query });

      // TODO: Hybrid search (Semantic + Keyword)

      set({ results: items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
