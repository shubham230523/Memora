import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/design/theme/ThemeContext';
import { knowledgeRepository } from '@/features/knowledge/KnowledgeRepository';
import { KnowledgeItem } from '@/features/knowledge/models/KnowledgeItem';
import { Loading } from '@/design/components/Loading';
import { Button } from '@/design/components/Button';

export default function KnowledgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    setIsLoading(true);
    const items = await knowledgeRepository.getAll();
    const found = items.find(i => i.id === id);
    setItem(found || null);
    setIsLoading(false);
  };

  if (isLoading) return <Loading />;
  if (!item) return <View><Text>Not found</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
        <View style={styles.meta}>
          <Text style={{ color: theme.colors.textSecondary }}>{item.type}</Text>
          <Text style={{ color: theme.colors.textSecondary }}> • </Text>
          <Text style={{ color: theme.colors.textSecondary }}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.contentText, { color: theme.colors.text }]}>{item.content}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Summarize (AI)" onPress={() => {}} variant="secondary" />
        <Button title="Edit" onPress={() => {}} variant="outline" />
        <Button title="Delete" onPress={async () => {
          await knowledgeRepository.delete(item.id);
          router.back();
        }} variant="ghost" style={{ marginTop: 8 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  content: { padding: 24 },
  contentText: { fontSize: 16, lineHeight: 24 },
  actions: { padding: 24, gap: 12 },
});
