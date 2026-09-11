import { noteRepository } from '../NoteRepository';

const mockDb = {
  runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
  getAllAsync: jest.fn(async () => []),
};

jest.mock('../../../database/db', () => ({
  getDb: jest.fn(async () => mockDb),
}));

describe('NoteRepository', () => {
  it('creates a note successfully', async () => {
    const note = await noteRepository.create('Test Note', 'Test Content');
    expect(note.title).toBe('Test Note');
    expect(note.id).toBeDefined();

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO knowledge_items'),
      expect.arrayContaining(['Test Note', 'Test Content'])
    );
  });
});
