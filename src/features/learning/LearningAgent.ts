import { OpenRouterAdapter } from '../ai/adapters/OpenRouterAdapter';
import { logger } from '../../core/logging/Logger';

const aiProvider = new OpenRouterAdapter();

export class LearningAgent {
  async generateRoadmap(goal: string): Promise<string> {
    logger.info(`Generating roadmap for goal: ${goal}`);
    try {
      const response = await aiProvider.generate({
        prompt: `Create a step-by-step learning roadmap for: ${goal}`,
        systemPrompt: "You are an expert tutor. Break down complex topics into small, achievable steps.",
      });
      return response.text;
    } catch (error) {
      logger.error('Failed to generate roadmap', error);
      return "Unable to generate roadmap at this time.";
    }
  }

  async generateDailyTask(): Promise<string> {
    // Logic to select a weak concept and generate a task
    return "Review 'Neural Networks' basics and take a quick quiz.";
  }
}

export const learningAgent = new LearningAgent();
