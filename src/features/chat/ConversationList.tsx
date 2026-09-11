import React, { useEffect, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from './models/Conversation';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';

interface ConversationListProps {
  onSelect: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    // This should ideally be in the store
    const db = await (await import('../../database/db')).getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM conversations ORDER BY lastMessageAt DESC');
    setConversations(rows);
  };

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelect(item)}>
          <Card style={styles.card}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {item.title || 'Untitled Conversation'}
            </Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {new Date(item.lastMessageAt).toLocaleString()}
            </Text>
          </Card>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { fontWeight: 'bold', fontSize: 16 },
  date: { fontSize: 12, marginTop: 4 },
});
