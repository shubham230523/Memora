import { knowledgeRepository } from '../KnowledgeRepository';
import { getDb } from '../../../database/db';

jest.mock('../../../database/db', () => ({
  getDb: jest.fn(),
}));

describe('KnowledgeRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getAll', () => {
    it('should fetch all items with default query', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', title: 'Test', isFavorite: 1, metadata: '{"key":"value"}' }
      ]);

      const items = await knowledgeRepository.getAll();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM knowledge_items WHERE 1=1'),
        []
      );
      expect(items[0]).toEqual(expect.objectContaining({
        id: '1',
        isFavorite: true,
        metadata: { key: 'value' }
      }));
    });

    it('should apply filters', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await knowledgeRepository.getAll({
        type: 'WEB_ARTICLE' as any,
        isFavorite: true,
        search: 'react'
      });

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('AND type = ? AND isFavorite = ? AND (title LIKE ? OR content LIKE ?)'),
        ['WEB_ARTICLE', 1, '%react%', '%react%']
      );
    });
  });

  describe('toggleFavorite', () => {
    it('should update isFavorite status', async () => {
      await knowledgeRepository.toggleFavorite('123', true);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE knowledge_items SET isFavorite = ? WHERE id = ?',
        [1, '123']
      );
    });
  });

  describe('delete', () => {
    it('should delete item by id', async () => {
      await knowledgeRepository.delete('123');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM knowledge_items WHERE id = ?',
        ['123']
      );
    });
  });
});
