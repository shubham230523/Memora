import { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';
import { useKnowledgeStore } from '@/features/knowledge/KnowledgeStore';
import { Card } from '@/design/components/Card';
import { Icon } from '@/design/components/Icon';
import { EmptyState } from '@/design/components/EmptyState';
import { Loading } from '@/design/components/Loading';

export default function KnowledgeScreen() {
  const { theme } = useTheme();
  const { items, isLoading, fetchItems, toggleFavorite } = useKnowledgeStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading && items.length === 0) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchItems} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Your library is empty"
            message="Start capturing knowledge from the Home screen."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.typeTag}>
                <Icon name={getIconForType(item.type)} size={16} color={theme.colors.primary} />
                <Text style={[styles.typeText, { color: theme.colors.primary }]}>{item.type}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                <Icon
                  name={item.isFavorite ? "star" : "star-outline"}
                  size={24}
                  color={item.isFavorite ? theme.colors.warning : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.cardContent, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.content}
            </Text>
            <Text style={[styles.cardDate, { color: theme.colors.textSecondary }]}>
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

function getIconForType(type: string): any {
  switch (type) {
    case 'NOTE': return 'note-text';
    case 'PDF': return 'file-pdf-box';
    case 'IMAGE': return 'image';
    case 'VOICE': return 'microphone';
    case 'WEBPAGE': return 'web';
    default: return 'file-question';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeText: { fontSize: 12, fontWeight: 'bold' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardContent: { fontSize: 14, marginBottom: 8 },
  cardDate: { fontSize: 10 },
});
