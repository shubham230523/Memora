import { chunkRepository } from '../ChunkRepository';
import { getDb } from '../../../database/db';

jest.mock('../../../database/db', () => ({
  getDb: jest.fn(),
}));

describe('ChunkRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      runAsync: jest.fn(),
      getAllAsync: jest.fn(),
      withTransactionAsync: jest.fn(async (cb) => await cb()),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    jest.clearAllMocks();
  });

  it('saveChunks should insert multiple chunks', async () => {
    const chunks = [
      { knowledgeItemId: '1', content: 'c1', index: 0 },
      { knowledgeItemId: '1', content: 'c2', index: 1 },
    ];

    await chunkRepository.saveChunks(chunks);

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO chunks'),
      [expect.any(String), '1', 'c1', 0, null]
    );
  });

  it('getForItem should fetch chunks by item id', async () => {
    mockDb.getAllAsync.mockResolvedValue([{ id: 1, content: 'c1' }]);
    const result = await chunkRepository.getForItem('123');
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE knowledgeItemId = ?'),
      ['123']
    );
    expect(result).toHaveLength(1);
  });
});
