import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';
import { useSearchStore } from '@/features/search/SearchStore';
import { TextInput } from '@/design/components/TextInput';
import { Card } from '@/design/components/Card';
import { EmptyState } from '@/design/components/EmptyState';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { query, setQuery, results, isLoading, performSearch } = useSearchStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchHeader}>
        <TextInput
          placeholder="Search your knowledge..."
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            performSearch();
          }}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          query.trim() && !isLoading ? (
            <EmptyState
              title="No results found"
              message={`We couldn't find anything matching "${query}"`}
              icon="magnify-close"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.resultCard}>
            <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.resultContent, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.content}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: { padding: 16 },
  listContent: { padding: 16 },
  resultCard: { marginBottom: 12 },
  resultTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  resultContent: { fontSize: 14 },
  loader: { marginTop: 8 },
});
