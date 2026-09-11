import { IAIProvider } from '../../../src/ai/interfaces/AIProvider';
import { AIRequest, AIResponse, AIStreamChunk } from '../../../src/ai/models/AIModels';

export class TestAIProvider implements IAIProvider {
  private static mockResponseText: string = 'Default mock response text';
  private static mockUsage = { promptTokens: 10, completionTokens: 15 };
  private static failureMode: Error | null = null;

  public static setResponse(text: string) {
    this.mockResponseText = text;
    this.failureMode = null;
  }

  public static setFailure(error: Error) {
    this.failureMode = error;
  }

  public static clear() {
    this.mockResponseText = 'Default mock response text';
    this.failureMode = null;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (TestAIProvider.failureMode) {
      throw TestAIProvider.failureMode;
    }

    // Context-grounded checking if required by systemPrompt
    if (request.systemPrompt && request.systemPrompt.includes('Use the following knowledge to answer')) {
      // If context has sources, use them or respond accordingly
      if (!request.systemPrompt.includes('Source:')) {
        return {
          text: 'I do not have any grounded knowledge about this topic.',
          usage: TestAIProvider.mockUsage,
        };
      }
    }

    // Dynamic JSON schema generation helper based on prompt keywords
    if (request.prompt.toLowerCase().includes('flashcard') || request.systemPrompt?.toLowerCase().includes('flashcard')) {
      return {
        text: JSON.stringify([
          { front: 'What is photosynthesis?', back: 'The process used by plants to convert light into energy.' }
        ]),
        usage: TestAIProvider.mockUsage,
      };
    }

    if (request.prompt.toLowerCase().includes('quiz') || request.systemPrompt?.toLowerCase().includes('quiz')) {
      return {
        text: JSON.stringify({
          title: 'Science Quiz',
          questions: [
            {
              question: 'What is H2O?',
              options: ['Water', 'Oxygen', 'Hydrogen', 'Carbon'],
              correctAnswer: 'Water'
            }
          ]
        }),
        usage: TestAIProvider.mockUsage,
      };
    }

    return {
      text: TestAIProvider.mockResponseText,
      usage: TestAIProvider.mockUsage,
    };
  }

  async streamGenerate(request: AIRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<void> {
    const res = await this.generate(request);
    onChunk({ text: res.text, isFinal: true });
  }
}
