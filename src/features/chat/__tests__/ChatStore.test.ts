import { useChatStore } from '../ChatStore';
import { chatRepository } from '../ChatRepository';
import { knowledgeRepository } from '../../knowledge/KnowledgeRepository';
import { getAIProvider } from '../../../ai/AIProviderFactory';

jest.mock('../ChatRepository', () => ({
  chatRepository: {
    createConversation: jest.fn(),
    addMessage: jest.fn(),
  },
}));

jest.mock('../../knowledge/KnowledgeRepository', () => ({
  knowledgeRepository: {
    getAll: jest.fn(),
    getRecent: jest.fn(),
    searchChunks: jest.fn(),
    getRecentChunks: jest.fn(),
  },
}));

jest.mock('../../../ai/AIProviderFactory', () => ({
  getAIProvider: jest.fn(),
}));

describe('ChatStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.setState({
      currentConversation: null,
      messages: [],
      isLoading: false,
    });
  });

  it('startNewChat should create conversation and update state', async () => {
    const mockConv = { id: 'conv-1', title: 'New Chat' };
    (chatRepository.createConversation as jest.Mock).mockResolvedValue(mockConv);

    await useChatStore.getState().startNewChat();

    expect(useChatStore.getState().currentConversation).toEqual(mockConv);
    expect(useChatStore.getState().messages).toEqual([]);
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  it('sendMessage should handle full RAG pipeline', async () => {
    const mockConv = { id: 'conv-1' };
    useChatStore.setState({ currentConversation: mockConv as any });

    const userMsg = { id: 'm1', role: 'user', content: 'hello' };
    const assistantMsg = { id: 'm2', role: 'assistant', content: 'hi there' };

    (chatRepository.addMessage as jest.Mock)
      .mockResolvedValueOnce(userMsg)
      .mockResolvedValueOnce(assistantMsg);

    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue([
      { title: 'K1', content: 'Info 1' }
    ]);
    (knowledgeRepository.searchChunks as jest.Mock).mockResolvedValue([]);

    const mockAIProvider = {
      generate: jest.fn().mockResolvedValue({ text: 'hi there' })
    };
    (getAIProvider as jest.Mock).mockReturnValue(mockAIProvider);

    await useChatStore.getState().sendMessage('hello');

    expect(chatRepository.addMessage).toHaveBeenCalledTimes(2);
    expect(knowledgeRepository.getAll).toHaveBeenCalledWith({ search: 'hello' });
    expect(mockAIProvider.generate).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('hello'),
      systemPrompt: expect.stringContaining('helpful assistant')
    }));

    expect(useChatStore.getState().messages.length).toBe(2);
    expect(useChatStore.getState().messages[1].content).toBe('hi there');
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  it('sendMessage should do nothing if no current conversation', async () => {
    await useChatStore.getState().sendMessage('hi');
    expect(chatRepository.addMessage).not.toHaveBeenCalled();
  });

  it('sendMessage should handle errors gracefully', async () => {
    useChatStore.setState({ currentConversation: { id: '1' } as any });
    (chatRepository.addMessage as jest.Mock).mockRejectedValue(new Error('fail'));

    await useChatStore.getState().sendMessage('hi');

    expect(useChatStore.getState().isLoading).toBe(false);
  });
});
