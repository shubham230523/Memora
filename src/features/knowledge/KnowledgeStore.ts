import { create } from 'zustand';
import { KnowledgeItem } from './models/KnowledgeItem';
import { knowledgeRepository, KnowledgeFilter } from './KnowledgeRepository';
import { logger } from '../../core/logging/Logger';

interface KnowledgeState {
  items: KnowledgeItem[];
  isLoading: boolean;
  filter: KnowledgeFilter;
  setFilter: (filter: KnowledgeFilter) => void;
  fetchItems: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  items: [],
  isLoading: false,
  filter: {},

  setFilter: (filter) => {
    set({ filter });
    get().fetchItems();
  },

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const items = await knowledgeRepository.getAll(get().filter);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (id) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;
    const newStatus = !item.isFavorite;
    await knowledgeRepository.toggleFavorite(id, newStatus);
    set({
      items: get().items.map(i => i.id === id ? { ...i, isFavorite: newStatus } : i)
    });
  },

  deleteItem: async (id) => {
    try {
      logger.info(`Deleting knowledge item: ${id}`);
      await knowledgeRepository.delete(id);
      set(state => ({
        items: state.items.filter(i => i.id !== id)
      }));
      logger.info(`Knowledge item ${id} deleted successfully`);
    } catch (error) {
      logger.error(`Failed to delete knowledge item ${id}`, error);
      throw error;
    }
  },
}));
