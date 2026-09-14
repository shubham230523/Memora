import { LlamaLocalAI } from '../LlamaLocalAI';
import { logger } from '../../../core/logging/Logger';

// virtual mock for llama.rn
jest.mock('llama.rn', () => ({
  initLlama: jest.fn(),
}), { virtual: true });

const { initLlama } = require('llama.rn');

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
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

  it('loadModel should initialize context and set isMock false if library exists', async () => {
    const mockContext = { release: jest.fn() };
    (initLlama as jest.Mock).mockResolvedValue(mockContext);

    await llama.loadModel('/path/to/model');

    expect(initLlama).toHaveBeenCalled();
    expect(await llama.isModelReady()).toBe(true);
    // @ts-ignore
    expect(llama.isMock).toBe(false);
  });

  it('generate should call completion if not in mock mode', async () => {
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
  });

  it('loadModel should fallback to mock if initLlama fails', async () => {
    (initLlama as jest.Mock).mockRejectedValue(new Error('fail'));
    await llama.loadModel('/path');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Falling back to Mock Mode'), expect.any(Error));
    expect(await llama.isModelReady()).toBe(true);
    // @ts-ignore
    expect(llama.isMock).toBe(true);
  });

  it('formatPrompt should generate correct string', () => {
    // @ts-ignore
    const prompt = llama.formatPrompt({
      prompt: 'User question',
      systemPrompt: 'Sys prompt',
      history: [{ role: 'user', content: 'prev' }]
    });
    expect(prompt).toContain('Sys prompt');
    expect(prompt).toContain('User question');
    expect(prompt).toContain('prev');
  });

  it('generate should return mock text if in mock mode', async () => {
    (initLlama as jest.Mock).mockRejectedValue(new Error('fail'));
    await llama.loadModel('/path');
    const response = await llama.generate({ prompt: 'hi' } as any);
    expect(response.text).toContain('mock mode');
  });

  it('streamGenerate should yield tokens if in mock mode', async () => {
    (initLlama as jest.Mock).mockRejectedValue(new Error('fail'));
    await llama.loadModel('/path');
    const onChunk = jest.fn();
    await llama.streamGenerate({ prompt: 'hi' } as any, onChunk);
    expect(onChunk).toHaveBeenCalled();
    expect(onChunk).toHaveBeenCalledWith(expect.objectContaining({ isFinal: true }));
  });

  it('unloadModel should clear mock state', async () => {
    (initLlama as jest.Mock).mockRejectedValue(new Error('fail'));
    await llama.loadModel('/path');
    await llama.unloadModel();
    // @ts-ignore
    expect(llama.isMock).toBe(false);
  });
});
