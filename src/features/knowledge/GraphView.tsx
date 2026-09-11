import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { graphRepository } from './GraphRepository';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';

export const GraphView = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });

  useEffect(() => {
    graphRepository.getGraphData().then(setData);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Concepts</Text>
      <FlatList
        data={data.nodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.nodeCard}>
            <Text style={[styles.nodeName, { color: theme.colors.text }]}>{item.name}</Text>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  nodeCard: { marginBottom: 8 },
  nodeName: { fontWeight: '500' },
});
