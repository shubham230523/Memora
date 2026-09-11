import { initDb } from '../../../src/database/db';
import { noteRepository } from '../../../src/features/notes/NoteRepository';
import { tagRepository } from '../../../src/features/knowledge/TagRepository';
import { syncRepository } from '../../../src/features/sync/SyncRepository';
import { SyncStatus, SyncOperation } from '../../../src/features/sync/models/Sync';

describe('Database and Repository Integration', () => {
  beforeEach(async () => {
    await initDb();
  });

  it('correctly initializes the schema and performs basic data integrity operations', async () => {
    // 1. Create a note through repository
    const note = await noteRepository.create('Integration Title', 'Integration Content body here');
    expect(note.id).toBeDefined();
    expect(note.title).toBe('Integration Title');

    // 2. Fetch all notes and verify persistence
    const allNotes = await noteRepository.getAll();
    expect(allNotes.length).toBe(1);
    expect(allNotes[0].id).toBe(note.id);
    expect(allNotes[0].content).toBe('Integration Content body here');

    // 3. Perform item tagging and relational join query
    const tag = await tagRepository.create('test-tag');
    expect(tag).toBeDefined();
    expect(tag.name).toBe('test-tag');

    await tagRepository.linkToItem(note.id, tag.id);
    const itemTags = await tagRepository.getForItem(note.id);
    expect(itemTags.length).toBe(1);
    expect(itemTags[0].name).toBe('test-tag');

    // 4. Perform update operation
    await noteRepository.update(note.id, { title: 'Updated Integration Title', isFavorite: true });
    const updatedNotes = await noteRepository.getAll();
    expect(updatedNotes[0].title).toBe('Updated Integration Title');
    expect(updatedNotes[0].isFavorite).toBe(true);

    // 5. Delete operation
    await noteRepository.delete(note.id);
    const emptyNotes = await noteRepository.getAll();
    expect(emptyNotes.length).toBe(0);
  });

  it('handles sync queue transaction logging and status state transitions', async () => {
    await syncRepository.addToQueue('Note', 'item-123', SyncOperation.CREATE, { title: 'Sync payload' });

    let pending = await syncRepository.getPending();
    expect(pending.length).toBe(1);
    expect(pending[0].entityId).toBe('item-123');
    expect(pending[0].status).toBe(SyncStatus.PENDING);

    // Update to failed state
    await syncRepository.updateStatus(pending[0].id, SyncStatus.FAILED, 'Network timeout');
    pending = await syncRepository.getPending();
    expect(pending.length).toBe(1);
    expect(pending[0].retryCount).toBe(1);
    expect(pending[0].status).toBe(SyncStatus.FAILED);

    // Update to completed state
    await syncRepository.updateStatus(pending[0].id, SyncStatus.COMPLETED);
    pending = await syncRepository.getPending();
    expect(pending.length).toBe(0);
  });
});
