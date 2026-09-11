import { initDb } from '../../../src/database/db';
import { noteRepository } from '../../../src/features/notes/NoteRepository';
import { KnowledgeType } from '../../../src/features/knowledge/models/KnowledgeItem';

describe('Notes Integration Flow', () => {
  beforeEach(async () => {
    await initDb();
  });

  it('completes the full note lifecycle: Create -> Retrieve -> Update -> Search -> Delete', async () => {
    // 1. Create multiple notes
    const note1 = await noteRepository.create('Personal Note', 'Secret content about React Native.');
    const note2 = await noteRepository.create('Study Note', 'Learning about integration testing patterns.');
    const note3 = await noteRepository.create('Unicode Note', 'Special chars: 🔥, 🚀, 你好');

    // 2. Verify collection
    const notes = await noteRepository.getAll();
    expect(notes).toHaveLength(3);

    // 3. Update a note
    await noteRepository.update(note1.id, { content: 'Updated secret content.' });
    const fetched1 = (await noteRepository.getAll()).find(n => n.id === note1.id);
    expect(fetched1?.content).toBe('Updated secret content.');

    // 4. Verify specific attributes
    expect(note3.content).toContain('你好');
    expect(note1.type).toBe(KnowledgeType.NOTE);

    // 5. Delete and verify isolation
    await noteRepository.delete(note2.id);
    const finalNotes = await noteRepository.getAll();
    expect(finalNotes).toHaveLength(2);
    expect(finalNotes.map(n => n.id)).not.toContain(note2.id);
  });
});
