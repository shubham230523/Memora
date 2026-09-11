import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { flashcardRepository } from './FlashcardRepository';
import { Flashcard } from './models/Learning';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Loading } from '@/design/components/Loading';
import { EmptyState } from '@/design/components/EmptyState';

export const FlashcardScreen = () => {
  const { theme } = useTheme();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    const dueCards = await flashcardRepository.getDueCards();
    setCards(dueCards);
    setIsLoading(false);
  };

  const currentCard = cards[currentIndex];

  if (isLoading) return <Loading />;
  if (cards.length === 0) return <EmptyState title="No cards due for review" />;
  if (!currentCard) return <EmptyState title="All caught up!" />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setIsFlipped(!isFlipped)}
        style={styles.cardContainer}
      >
        <Card style={styles.card}>
          <Text style={[styles.sideLabel, { color: theme.colors.textSecondary }]}>
            {isFlipped ? 'BACK' : 'FRONT'}
          </Text>
          <Text style={[styles.content, { color: theme.colors.text }]}>
            {isFlipped ? currentCard.back : currentCard.front}
          </Text>
        </Card>
      </TouchableOpacity>

      <View style={styles.actions}>
        {isFlipped ? (
          <>
            <Button
              title="Still learning"
              variant="outline"
              onPress={() => {
                setIsFlipped(false);
                setCurrentIndex(currentIndex + 1);
              }}
            />
            <Button
              title="Got it!"
              onPress={() => {
                setIsFlipped(false);
                setCurrentIndex(currentIndex + 1);
              }}
            />
          </>
        ) : (
          <Text style={{ color: theme.colors.textSecondary }}>Tap card to see answer</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  cardContainer: { height: 300, marginBottom: 40 },
  card: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sideLabel: { position: 'absolute', top: 16, left: 16, fontSize: 10, fontWeight: 'bold' },
  content: { fontSize: 24, textAlign: 'center', padding: 24 },
  actions: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
});
