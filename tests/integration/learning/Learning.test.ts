import { initDb } from '../../../src/database/db';
import { flashcardRepository } from '../../../src/features/learning/FlashcardRepository';
import { quizRepository } from '../../../src/features/learning/QuizRepository';
import { learningAgent } from '../../../src/features/learning/LearningAgent';
import { TestAIProvider } from '../helpers/TestAIProvider';
import { useSettingsStore } from '../../../src/features/settings/SettingsStore';
import { Platform } from '../../../src/platform/Platform';

describe('Learning Agent, Flashcard and Quiz Integration', () => {
  beforeEach(async () => {
    await initDb();
    useSettingsStore.setState({ inferenceMode: 'LOCAL' });
    (Platform.LocalAI as any).setModelReady(true);
  });

  it('completes the flashcard repository lifecycle: add card, fetch due cards, and update review intervals', async () => {
    // 1. Add fresh cards
    const card1 = await flashcardRepository.addFlashcard({
      knowledgeItemId: 'item-1',
      front: 'What is a closure?',
      back: 'A function that remembers its outer variables.',
      nextReviewAt: null, // Due immediately
      interval: 0,
    });
    expect(card1.id).toBeDefined();

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 24);

    await flashcardRepository.addFlashcard({
      knowledgeItemId: 'item-2',
      front: 'What is JSX?',
      back: 'Syntax extension for JavaScript used in React.',
      nextReviewAt: futureDate.toISOString(), // Not due
      interval: 1,
    });

    // 2. Query due cards
    const dueCards = await flashcardRepository.getDueCards();
    expect(dueCards.length).toBe(1);
    expect(dueCards[0].front).toBe('What is a closure?');

    // 3. Update review state
    const newReviewDate = new Date();
    newReviewDate.setHours(newReviewDate.getHours() + 48);
    await flashcardRepository.updateReviewState(dueCards[0].id, newReviewDate.toISOString(), 2);

    const postReviewDue = await flashcardRepository.getDueCards();
    expect(postReviewDue.length).toBe(0); // All cards now reviewed and moved to future
  });

  it('saves and processes quiz schemas correctly', async () => {
    const savedQuiz = await quizRepository.saveQuiz({
      title: 'JavaScript Fundamentals',
      questions: [
        {
          question: 'What is the output of typeof null?',
          options: ['object', 'null', 'undefined', 'string'],
          correctAnswer: 'object'
        }
      ],
      score: 100,
    });

    expect(savedQuiz.id).toBeDefined();
    expect(savedQuiz.title).toBe('JavaScript Fundamentals');
    expect(savedQuiz.questions[0].correctAnswer).toBe('object');

    const quizzes = await quizRepository.getQuizzes();
    expect(quizzes.length).toBe(1);
    expect(quizzes[0].title).toBe('JavaScript Fundamentals');
    expect(quizzes[0].questions).toHaveLength(1);
  });

  it('integrates with AI provider via LearningAgent to generate custom study roadmaps', async () => {
    TestAIProvider.setResponse('Step 1: Learn HTML. Step 2: Learn CSS. Step 3: Learn JavaScript.');

    const roadmap = await learningAgent.generateRoadmap('Web Development');
    expect(roadmap).toContain('Step 1: Learn HTML.');
    expect(roadmap).toContain('JavaScript');

    const task = await learningAgent.generateDailyTask();
    expect(task).toBeDefined();
    expect(typeof task).toBe('string');
  });
});
