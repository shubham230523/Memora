import { initDb } from '../../../src/database/db';
import { noteRepository } from '../../../src/features/notes/NoteRepository';
import { useSearchStore } from '../../../src/features/search/SearchStore';

describe('Search and Ranking Integration', () => {
  beforeEach(async () => {
    await initDb();
    useSearchStore.setState({ query: '', results: [], isLoading: false });
  });

  it('performs keyword matching, partial match, and case variations search across notes', async () => {
    // 1. Create seed notes
    await noteRepository.create('React Native Basics', 'In depth look into components and native modules.');
    await noteRepository.create('Advanced TypeScript', 'Generics, conditional types, and utility types.');
    await noteRepository.create('Jest Testing Guide', 'Unit, integration, and component testing.');

    const store = useSearchStore.getState();

    // 2. Exact match query
    useSearchStore.setState({ query: 'Basics' });
    await useSearchStore.getState().performSearch();
    expect(useSearchStore.getState().results).toHaveLength(1);
    expect(useSearchStore.getState().results[0].title).toBe('React Native Basics');

    // 3. Case variations query
    useSearchStore.setState({ query: 'typescript' });
    await useSearchStore.getState().performSearch();
    expect(useSearchStore.getState().results).toHaveLength(1);
    expect(useSearchStore.getState().results[0].title).toBe('Advanced TypeScript');

    // 4. Partial/substring query matching multiple records
    useSearchStore.setState({ query: 'testing' });
    await useSearchStore.getState().performSearch();
    expect(useSearchStore.getState().results).toHaveLength(1); // Matches 'Jest Testing Guide'

    // 5. No results query
    useSearchStore.setState({ query: 'Flutter' });
    await useSearchStore.getState().performSearch();
    expect(useSearchStore.getState().results).toHaveLength(0);
  });
});
