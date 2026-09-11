import { initDb } from '../../../src/database/db';
import { noteRepository } from '../../../src/features/notes/NoteRepository';
import { useChatStore } from '../../../src/features/chat/ChatStore';
import { TestAIProvider } from '../helpers/TestAIProvider';
import { useSettingsStore } from '../../../src/features/settings/SettingsStore';

import { Platform } from '../../../src/platform/Platform';

describe('RAG Pipeline and Chat Store Integration', () => {
  beforeEach(async () => {
    await initDb();
    useChatStore.setState({ currentConversation: null, messages: [], isLoading: false });
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    (Platform.LocalAI as any).setModelReady(true);
  });

  it('completes the entire RAG pipeline successfully when grounded knowledge exists', async () => {
    // 1. Create a relevant knowledge item
    await noteRepository.create(
      'Project Alpha Specs',
      'Project Alpha uses React Native 0.86 and Expo 57 with full native capabilities.'
    );

    // 2. Start a conversation session
    await useChatStore.getState().startNewChat();
    const chatState = useChatStore.getState();
    expect(chatState.currentConversation).toBeDefined();

    // 3. Set a specific deterministic AI provider response
    TestAIProvider.setResponse('Project Alpha is built on React Native 0.86 and Expo 57.');

    // 4. Send user query that triggers RAG retrieval matching 'Alpha'
    await useChatStore.getState().sendMessage('Alpha');

    // 5. Verify conversation state and history
    const finalState = useChatStore.getState();
    expect(finalState.messages).toHaveLength(2);
    expect(finalState.messages[0].role).toBe('user');
    expect(finalState.messages[0].content).toBe('Alpha');
    expect(finalState.messages[1].role).toBe('assistant');
    expect(finalState.messages[1].content).toBe('Project Alpha is built on React Native 0.86 and Expo 57.');
  });

  it('gracefully handles grounded answers when no relevant knowledge exists', async () => {
    await useChatStore.getState().startNewChat();

    // Querying for something completely absent from database
    await useChatStore.getState().sendMessage('How do you bake a chocolate cake?');

    const finalState = useChatStore.getState();
    expect(finalState.messages).toHaveLength(2);
    expect(finalState.messages[1].content).toContain('I do not have any grounded knowledge');
  });

  it('propagates AI provider generation errors correctly through the store', async () => {
    await useChatStore.getState().startNewChat();

    // Force the AI Provider to throw an inference error
    TestAIProvider.setFailure(new Error('Inference limit exceeded or quota error'));

    await useChatStore.getState().sendMessage('Hello AI?');

    const finalState = useChatStore.getState();
    expect(finalState.isLoading).toBe(false);
    // User message got added, but no assistant message due to the caught error
    expect(finalState.messages.filter(m => m.role === 'assistant')).toHaveLength(0);
  });
});
