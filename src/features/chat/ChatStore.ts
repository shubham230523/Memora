import { create } from 'zustand';
import { Conversation, Message } from './models/Conversation';
import { chatRepository } from './ChatRepository';
import { getAIProvider } from '../../ai/AIProviderFactory';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';
import { logger } from '../../core/logging/Logger';

interface ChatState {
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  startNewChat: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentConversation: null,
  messages: [],
  isLoading: false,

  startNewChat: async () => {
    set({ isLoading: true });
    try {
      const conv = await chatRepository.createConversation('New Chat');
      set({ currentConversation: conv, messages: [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (content) => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    set({ isLoading: true });
    try {
      // 1. Save user message
      const userMsg = await chatRepository.addMessage({
        conversationId: currentConversation.id,
        role: 'user',
        content,
      });
      set(state => ({ messages: [...state.messages, userMsg] }));

      // 2. Retrieval (RAG)
      const relevantKnowledge = await knowledgeRepository.getAll({ search: content });
      const context = relevantKnowledge.map(k => `Source: ${k.title}\nContent: ${k.content}`).join('\n\n');

      // 3. AI Generation
      const aiProvider = getAIProvider();
      const systemPrompt = `You are Memora AI. Use the following knowledge to answer: \n\n${context}`;
      const response = await aiProvider.generate({
        prompt: content,
        systemPrompt,
      });

      // 4. Save AI message
      const assistantMsg = await chatRepository.addMessage({
        conversationId: currentConversation.id,
        role: 'assistant',
        content: response.text,
      });
      set(state => ({ messages: [...state.messages, assistantMsg], isLoading: false }));
    } catch (error) {
      logger.error('Chat failed', error);
      set({ isLoading: false });
    }
  },
}));
