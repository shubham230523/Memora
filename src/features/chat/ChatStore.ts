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
    if (!currentConversation) {
      logger.warn('Cannot send message: no active conversation');
      return;
    }

    logger.info(`[CHAT] Start processing message: "${content.substring(0, 50)}..."`);
    set({ isLoading: true });

    try {
      // 1. Save user message
      logger.debug('[CHAT] Step 1: Saving user message to database');
      const userMsg = await chatRepository.addMessage({
        conversationId: currentConversation.id,
        role: 'user',
        content,
      });
      set(state => ({ messages: [...state.messages, userMsg] }));

      // 2. Retrieval (RAG)
      logger.debug('[CHAT] Step 2: Retrieving relevant context from knowledge base');

      // Simple Keyword Extraction: Remove common words and split
      const stopWords = ['what', 'is', 'my', 'the', 'a', 'an', 'and', 'or', 'but', 'how', 'who', 'where'];
      const keywords = content.toLowerCase()
        .replace(/[?.,!]/g, '')
        .split(' ')
        .filter(word => word.length > 2 && !stopWords.includes(word));

      const searchTerms = keywords.length > 0 ? keywords.join(' ') : content;
      logger.info(`[CHAT] Searching for context using terms: "${searchTerms}"`);

      const relevantKnowledge = await knowledgeRepository.getAll({ search: searchTerms });
      logger.info(`[CHAT] Found ${relevantKnowledge.length} relevant knowledge items`);

      const context = relevantKnowledge.map(k => `Source: ${k.title}\nContent: ${k.content}`).join('\n\n');

      // 3. AI Generation
      logger.debug('[CHAT] Step 3: Initializing AI provider');
      const aiProvider = getAIProvider();
      const systemPrompt = `You are Memora AI, a personal knowledge assistant. Use the following context to answer the user's question. If the answer is not in the context, use your general knowledge but mention it's not in their notes.\n\nContext:\n${context}`;

      logger.info('[CHAT] Step 4: Generating AI response (streaming)');
      const startTime = Date.now();

      // Add a placeholder assistant message that we will update with stream
      const assistantMsgId = `assistant-${Date.now()}`;
      const initialAssistantMsg: Message = {
        id: assistantMsgId,
        conversationId: currentConversation.id,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      };

      set(state => ({ messages: [...state.messages, initialAssistantMsg] }));

      let fullContent = '';

      await aiProvider.streamGenerate({
        prompt: content,
        systemPrompt,
      }, (chunk) => {
        if (chunk.isFinal) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          logger.info(`[CHAT] AI stream complete in ${duration}s`);
          logger.info(`[CHAT] AI Response: "${fullContent.substring(0, 100)}..."`);

          // Final save to database
          chatRepository.addMessage({
            conversationId: currentConversation.id,
            role: 'assistant',
            content: fullContent,
          });

          set({ isLoading: false });
        } else {
          fullContent += chunk.text;
          set(state => ({
            messages: state.messages.map(m =>
              m.id === assistantMsgId ? { ...m, content: fullContent } : m
            )
          }));
        }
      });

      logger.info('[CHAT] Message flow complete');
    } catch (error: any) {
      logger.error('[CHAT] Chat flow failed at some step', error);

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
