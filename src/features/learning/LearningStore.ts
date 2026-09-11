import { create } from 'zustand';
import { LearningState, ConceptState } from './models/Learning';

interface LearningStore {
  states: LearningState[];
  isLoading: boolean;
  detectGaps: () => Promise<void>;
}

export const useLearningStore = create<LearningStore>((set) => ({
  states: [],
  isLoading: false,

  detectGaps: async () => {
    set({ isLoading: true });
    // TODO: Analyze concepts from knowledge graph vs quizzes
    set({
      states: [
        { conceptId: 'c1', state: ConceptState.KNOWN },
        { conceptId: 'c2', state: ConceptState.WEAK },
        { conceptId: 'c3', state: ConceptState.MISSING },
      ],
      isLoading: false
    });
  },
}));
