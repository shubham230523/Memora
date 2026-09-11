import { noteRepository } from '../NoteRepository';
import { getDb } from '../../../database/db';
import { generateId } from '../../../shared/utils/id';

jest.mock('../../../database/db', () => ({
  getDb: jest.fn(),
}));

jest.mock('../../../shared/utils/id', () => ({
  generateId: jest.fn(() => 'test-id'),
}));

describe('NoteRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    jest.clearAllMocks();
  });

  it('create should insert and return note', async () => {
    const note = await noteRepository.create('Title', 'Content');

    expect(note.id).toBe('test-id');
    expect(note.title).toBe('Title');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO knowledge_items'),
      expect.arrayContaining(['test-id', 'NOTE', 'Title', 'Content', 0])
    );
  });

  it('getAll should return only notes', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: '1', type: 'NOTE', title: 'Note 1', isFavorite: 0 }
    ]);

    const notes = await noteRepository.getAll();

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE type = ?'),
      ['NOTE']
    );
    expect(notes.length).toBe(1);
    expect(notes[0].isFavorite).toBe(false);
  });

  it('update should call update query', async () => {
    await noteRepository.update('123', { title: 'New Title', isFavorite: true });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE knowledge_items SET title = ?, isFavorite = ?, updatedAt = ? WHERE id = ?'),
      expect.arrayContaining(['New Title', 1, '123'])
    );
  });

  it('delete should call delete query', async () => {
    await noteRepository.delete('123');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM knowledge_items WHERE id = ?',
      ['123']
    );
  });
});
