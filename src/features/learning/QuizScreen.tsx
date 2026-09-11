import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Quiz, QuizQuestion } from './models/Learning';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';

export const QuizScreen = () => {
  const { theme } = useTheme();
  const [currentQuestionIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock quiz
  const mockQuiz: Quiz = {
    id: 'q1',
    title: 'General Knowledge',
    createdAt: '',
    questions: [
      { id: '1', type: 'MCQ', question: 'What is Recall?', options: ['An app', 'A bird', 'A car'], correctAnswer: 'An app' },
      { id: '2', type: 'TRUE_FALSE', question: 'Recall is powered by AI.', correctAnswer: 'true' },
    ],
  };

  const currentQuestion = mockQuiz.questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < mockQuiz.questions.length - 1) {
      setCurrentIndex(currentQuestionIndex + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Quiz Complete!</Text>
        <Button title="Back to Learning" onPress={() => {}} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.questionCard}>
        <Text style={[styles.questionText, { color: theme.colors.text }]}>
          {currentQuestion.question}
        </Text>

        {currentQuestion.options?.map(option => (
          <Button
            key={option}
            title={option}
            variant={answers[currentQuestion.id] === option ? 'primary' : 'outline'}
            onPress={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
            style={styles.optionButton}
          />
        ))}
      </Card>

      <Button
        title={currentQuestionIndex === mockQuiz.questions.length - 1 ? "Finish" : "Next"}
        onPress={handleNext}
        disabled={!answers[currentQuestion.id]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  questionCard: { padding: 24, marginBottom: 24 },
  questionText: { fontSize: 18, marginBottom: 24 },
  optionButton: { marginBottom: 12 },
});
