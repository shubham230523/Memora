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
      const systemPrompt = `You are Memora AI, a personal knowledge assistant. Use the following context to answer the user's question. If the answer is not in the context, use your general knowledge but mention it's not in their notes.\n\nContext:\n${context}`;

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
    } catch (error: any) {
      logger.error('Chat message processing failed', error);

      // Add error message to chat so user knows what happened
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        conversationId: currentConversation.id,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. If you're using Local AI, make sure the model is setup in Settings.`,
        createdAt: new Date().toISOString()
      };

      set(state => ({
        messages: [...state.messages, errorMsg],
        isLoading: false
      }));
    }
  },
}));
