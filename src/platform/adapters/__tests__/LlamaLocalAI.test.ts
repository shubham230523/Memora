import { LlamaLocalAI } from '../LlamaLocalAI';
import { logger } from '../../../core/logging/Logger';

// Mock llama.rn string-based since it might not be available in node_modules
jest.mock('llama.rn', () => ({
  initLlama: jest.fn(),
}), { virtual: true });

// We need to re-require it to get the mock
const { initLlama } = require('llama.rn');

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LlamaLocalAI', () => {
  let llama: LlamaLocalAI;

  beforeEach(() => {
    llama = new LlamaLocalAI();
    jest.clearAllMocks();
  });

  it('isModelReady should return false initially', async () => {
    expect(await llama.isModelReady()).toBe(false);
  });

  it('loadModel should initialize context', async () => {
    const mockContext = { release: jest.fn() };
    (initLlama as jest.Mock).mockResolvedValue(mockContext);

    await llama.loadModel('/path/to/model');

    expect(initLlama).toHaveBeenCalledWith(expect.objectContaining({
      model: 'file:///path/to/model'
    }));
    expect(await llama.isModelReady()).toBe(true);
  });

  it('unloadModel should release context', async () => {
    const mockContext = { release: jest.fn() };
    (initLlama as jest.Mock).mockResolvedValue(mockContext);
    await llama.loadModel('/path');

    await llama.unloadModel();

    expect(mockContext.release).toHaveBeenCalled();
    expect(await llama.isModelReady()).toBe(false);
  });

  it('generate should call completion', async () => {
    const mockContext = {
      completion: jest.fn((opts, cb) => {
        cb({ token: 'Hello' });
        cb({ token: ' World' });
        return Promise.resolve();
      })
    };
    (initLlama as jest.Mock).mockResolvedValue(mockContext);
    await llama.loadModel('/path');

    const response = await llama.generate({ prompt: 'hi' } as any);

    expect(response.text).toBe('Hello World');
    expect(mockContext.completion).toHaveBeenCalled();
  });

  it('streamGenerate should yield tokens', async () => {
    const mockContext = {
      completion: jest.fn((opts, cb) => {
        cb({ token: 'Hi' });
        return Promise.resolve();
      })
    };
    (initLlama as jest.Mock).mockResolvedValue(mockContext);
    await llama.loadModel('/path');

    const onChunk = jest.fn();
    await llama.streamGenerate({ prompt: 'hi' } as any, onChunk);

    expect(onChunk).toHaveBeenCalledWith({ text: 'Hi', isFinal: false });
    expect(onChunk).toHaveBeenCalledWith({ text: '', isFinal: true });
  });

  it('loadModel should throw if initLlama fails', async () => {
    (initLlama as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(llama.loadModel('/path')).rejects.toThrow('fail');
    expect(logger.error).toHaveBeenCalled();
  });
});
