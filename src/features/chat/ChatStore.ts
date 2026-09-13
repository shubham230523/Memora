import { create } from 'zustand';
import { Conversation, Message } from './models/Conversation';
import { chatRepository } from './ChatRepository';
import { getAIProvider } from '../../ai/AIProviderFactory';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';
import { chunkRepository } from '../knowledge/ChunkRepository';
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

      const stopWords = ['what', 'is', 'my', 'the', 'a', 'an', 'and', 'or', 'but', 'how', 'who', 'where'];
      const rawKeywords = content.toLowerCase()
        .replace(/[?.,!]/g, '')
        .split(' ')
        .filter(word => word.length > 2 && !stopWords.includes(word));

      // Keyword Expansion Logic
      const expansionMap: Record<string, string[]> = {
        'company': ['work', 'experience', 'resume', 'employment', 'job', 'career', 'positions', 'history'],
        'employer': ['work', 'experience', 'resume', 'company', 'career', 'employment', 'history'],
        'job': ['work', 'experience', 'resume', 'company', 'employment', 'roles', 'history'],
        'work': ['experience', 'resume', 'company', 'job', 'employment', 'history', 'background'],
        'resume': ['experience', 'work', 'cv', 'career', 'employment', 'history', 'background'],
        'fav': ['favourite', 'favorite', 'like', 'top', 'list', 'preferred', 'choice'],
        'favourite': ['favorite', 'like', 'top', 'list', 'ranking', 'preferred', 'choice'],
        'favorite': ['favourite', 'like', 'top', 'list', 'ranking', 'preferred', 'choice'],
      };

      let expandedKeywords = [...rawKeywords];
      rawKeywords.forEach(word => {
        if (expansionMap[word]) {
          expandedKeywords.push(...expansionMap[word]);
        }
      });
      expandedKeywords = Array.from(new Set(expandedKeywords));

      const searchTerms = expandedKeywords.length > 0 ? expandedKeywords.join(' ') : content;
      logger.info(`[CHAT] Searching for context using terms: "${searchTerms}"`);

      // 2a. Search Items and Chunks
      let [relevantItems, relevantChunks] = await Promise.all([
        knowledgeRepository.getAll({ search: searchTerms }),
        knowledgeRepository.searchChunks(expandedKeywords)
      ]);

      // DEEP SEARCH: If we found relevant documents but not their chunks,
      // pull all chunks for those documents and search them manually.
      if (relevantItems.length > 0 && relevantChunks.length === 0) {
        logger.info('[CHAT] Deep searching chunks for relevant items...');
        const itemIds = relevantItems.map(i => i.id);
        for (const id of itemIds) {
          const itemChunks = await chunkRepository.getForItem(id);
          // Filter chunks that have ANY of the keywords
          const matched = itemChunks.filter(c =>
            expandedKeywords.some(kw => c.content.toLowerCase().includes(kw))
          );
          relevantChunks.push(...matched.map(c => ({
            ...c,
            sourceTitle: relevantItems.find(i => i.id === c.knowledgeItemId)?.title || 'Unknown',
            sourceType: relevantItems.find(i => i.id === c.knowledgeItemId)?.type || 'NOTE'
          })));
        }
      }

      // 2b. Advanced Scoring & Selection
      let contextPieces = [...relevantChunks.map(c => ({
        content: c.content,
        source: c.sourceTitle,
        type: c.sourceType,
        score: 1.5
      }))];

      for (const item of relevantItems) {
        const isHighPriority = item.title.toLowerCase().includes('resume') ||
                             item.title.toLowerCase().includes('cv') ||
                             item.title.toLowerCase().includes('provider');

        if (isHighPriority) {
          // For high-priority docs, we take the FULL content and REMOVE any existing tiny chunks
          // from this document to avoid duplication and ensure the model sees the data in order.
          contextPieces = contextPieces.filter(p => p.source !== item.title);
          contextPieces.push({
            content: item.content.substring(0, 6000), // Maximize visibility
            source: item.title,
            type: item.type,
            score: 10.0 // Absolute priority
          });
        } else if (!contextPieces.some(p => p.source === item.title)) {
          contextPieces.push({
            content: item.content.substring(0, 1000),
            source: item.title,
            type: item.type,
            score: 1.0
          });
        }
      }

      // Context-Aware Scoring: Heavy boost for category matches
      const lowQuery = content.toLowerCase();
      const isJobQuery = lowQuery.includes('work') || lowQuery.includes('company') || lowQuery.includes('job') || lowQuery.includes('last') || lowQuery.includes('employer');
      const isRankingQuery = lowQuery.includes('fav') || lowQuery.includes('like') || lowQuery.includes('top') || lowQuery.includes('best') || lowQuery.includes('provider');

      contextPieces = contextPieces.map(p => {
        let boost = 0;
        const lowSource = p.source.toLowerCase();

        if (isJobQuery && (lowSource.includes('resume') || lowSource.includes('cv'))) boost += 5;
        if (isRankingQuery && (lowSource.includes('fav') || lowSource.includes('provider'))) boost += 5;

        // Keyword density boost
        expandedKeywords.forEach(kw => {
          if (p.content.toLowerCase().includes(kw)) boost += 1.0;
        });

        return { ...p, score: p.score + boost };
      });

      // Take Top-5
      const topContext = contextPieces
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (topContext.length === 0) {
        logger.info('[CHAT] No direct matches, getting recent context');
        const recent = await knowledgeRepository.getRecentChunks(3);
        topContext.push(...recent.map(c => ({
          content: c.content,
          source: c.sourceTitle,
          type: c.sourceType,
          score: 0
        })));
      }

      const contextTitles = topContext.map(c => c.source).join(', ');
      logger.info(`[CHAT] Selected Context Sources: [${contextTitles}]`);

      // 3. AI Generation
      logger.debug('[CHAT] Step 3: Initializing AI provider');
      const aiProvider = getAIProvider();

      // Setup placeholder assistant message
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
      let answerFound = false;

      // Filtering segments for scanning
      const allSegments: { source: string; content: string; densityScore: number }[] = [];
      for (const source of topContext) {
        const size = 2000;
        const overlap = 500;
        let start = 0;
        while (start < source.content.length) {
          const text = source.content.substring(start, start + size + overlap);
          let score = 0;
          expandedKeywords.forEach(kw => {
            if (text.toLowerCase().includes(kw)) score += 2;
          });
          allSegments.push({
            source: source.source,
            content: text,
            densityScore: score
          });
          if (source.content.length <= size) break;
          start += size;
        }
      }

      // Sort all segments by density and pick Top-5 to scan with AI
      const winnerSegments = allSegments
        .sort((a, b) => b.densityScore - a.densityScore)
        .slice(0, 5);

      logger.info(`[CHAT] Filtered ${allSegments.length} segments down to ${winnerSegments.length} winners for AI scanning`);

      for (let i = 0; i < winnerSegments.length; i++) {
        if (answerFound) break;

        const segment = winnerSegments[i];
        logger.info(`[CHAT] AI Scanning Segment ${i + 1}/${winnerSegments.length} (from ${segment.source})`);

        const scanSystemPrompt = `You are a precise factual extractor.
Your ONLY goal is to extract the answer to the QUESTION from the provided DATA.

STRICT RULES:
1. If the question asks for a "favorite" or "top" item, the first item in a list (#1 or 1.) is the answer.
2. Provide the extracted fact directly.
3. Do not include any introductory phrases like "Based on the notes".
4. If the answer is not in the data, respond with a single word: "NONE".`;

        const scanUserPrompt = `DATA FROM [${segment.source}]:
"""
${segment.content}
"""

QUESTION: ${content}

Extraction:`;

        const response = await aiProvider.generate({
          prompt: scanUserPrompt,
          systemPrompt: scanSystemPrompt,
          temperature: 0.0
        });

        let cleanResult = response.text.trim();

        // Log raw output for troubleshooting
        logger.info(`[CHAT] Segment ${i+1} Raw Output: "${cleanResult.substring(0, 100)}"`);

        // Check if the result is a valid extraction
        const isRefusal = cleanResult.toLowerCase().includes('none') ||
                         cleanResult.toLowerCase().includes('not found') ||
                         cleanResult.toLowerCase().includes('i don\'t have');

        if (cleanResult && !isRefusal && cleanResult.length > 1) {
          fullContent = cleanResult;
          answerFound = true;
          logger.info(`[CHAT] Valid answer extracted from segment ${i + 1}`);
        }
      }

      // Final fallback if nothing found in all segments
      if (!answerFound) {
        fullContent = "I couldn't find that specific information in your current notes.";
      }

      logger.info(`[CHAT] AI Response: "${fullContent.substring(0, 100)}..."`);

      // Update UI with the final result (simulating a "stream" for UX consistency)
      const words = fullContent.split(' ');
      let displayedText = '';
      for (const word of words) {
        displayedText += word + ' ';
        set(state => ({
          messages: state.messages.map(m =>
            m.id === assistantMsgId ? { ...m, content: displayedText.trim() } : m
          )
        }));
        await new Promise(r => setTimeout(r, 30)); // Natural reading speed
      }

      // Final save to database
      chatRepository.addMessage({
        conversationId: currentConversation.id,
        role: 'assistant',
        content: fullContent,
      });

      set({ isLoading: false });
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
