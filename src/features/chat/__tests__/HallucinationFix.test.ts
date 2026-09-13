import { useChatStore } from '../ChatStore';
import { chatRepository } from '../ChatRepository';
import { knowledgeRepository } from '../../knowledge/KnowledgeRepository';
import { getAIProvider } from '../../../ai/AIProviderFactory';

jest.mock('../ChatRepository', () => ({
  chatRepository: {
    createConversation: jest.fn(),
    addMessage: jest.fn().mockImplementation((msg) => Promise.resolve({ id: Date.now().toString(), ...msg })),
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

describe('ChatStore Hallucination Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.setState({
      currentConversation: { id: 'conv-fix' } as any,
      messages: [],
      isLoading: false,
    });
  });

  it('should generate a system prompt with strict ranking rules to prevent hallucination', async () => {
    // 1. Setup mock data representing the user's specific note
    const mockNote = {
      title: 'Favourite AI Provider',
      content: '1st Gemini, 2nd Chatgpt, 3rd Open source models'
    };
    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue([mockNote]);
    (knowledgeRepository.searchChunks as jest.Mock).mockResolvedValue([{
      content: mockNote.content,
      sourceTitle: mockNote.title,
      sourceType: 'NOTE'
    }]);

    const mockAIProvider = {
      generate: jest.fn().mockResolvedValue({ text: 'Gemini' }),
      streamGenerate: jest.fn()
    };
    (getAIProvider as jest.Mock).mockReturnValue(mockAIProvider);

    // 2. Execute the message sending
    await useChatStore.getState().sendMessage('What is my Favourite Provider?');

    // 3. Verify the system prompt contains the strengthened instructions
    const callArgs = (mockAIProvider.generate as jest.Mock).mock.calls[0][0];
    const systemPrompt = callArgs.systemPrompt;

    // Check for scanning protocol in prompt
    expect(systemPrompt).toContain('You are Memora, a helpful and natural knowledge assistant');
    expect(callArgs.prompt).toContain('DATA SOURCE');
    expect(callArgs.prompt).toContain('QUESTION:');

    // Check that context is structured correctly
    expect(callArgs.prompt).toContain('DATA SOURCE: Favourite AI Provider');

    // 4. Verify result in state
    const messages = useChatStore.getState().messages;
    expect(messages[messages.length - 1].content).toBe('Gemini');
  });

  it('should use keyword expansion for better retrieval', async () => {
    (knowledgeRepository.getAll as jest.Mock).mockResolvedValue([]);
    (knowledgeRepository.searchChunks as jest.Mock).mockResolvedValue([]);
    (knowledgeRepository.getRecentChunks as jest.Mock).mockResolvedValue([]);
    (getAIProvider as jest.Mock).mockReturnValue({ streamGenerate: jest.fn() });

    await useChatStore.getState().sendMessage('Where did I work last?');

    // Verify search terms include expanded keywords like 'experience', 'resume'
    const searchArg = (knowledgeRepository.getAll as jest.Mock).mock.calls[0][0].search;
    expect(searchArg).toContain('work');
    expect(searchArg).toContain('resume');
  });
});
