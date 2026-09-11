import { useChatStore } from '../ChatStore';
import { chatRepository } from '../ChatRepository';

jest.mock('../ChatRepository', () => ({
  chatRepository: {
    createConversation: jest.fn(async () => ({ id: 'c1', title: 'Test' })),
    addMessage: jest.fn(async (m) => ({ ...m, id: 'm1', createdAt: '' })),
    getMessages: jest.fn(async () => []),
  },
}));

describe('ChatStore', () => {
  it('starts a new chat successfully', async () => {
    await useChatStore.getState().startNewChat();
    expect(useChatStore.getState().currentConversation?.id).toBe('c1');
  });
});
