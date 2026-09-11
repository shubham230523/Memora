import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';
import { useLearningStore } from '@/features/learning/LearningStore';
import { Card } from '@/design/components/Card';
import { Icon } from '@/design/components/Icon';
import { Loading } from '@/design/components/Loading';

export default function LearningScreen() {
  const { theme } = useTheme();
  const { states, isLoading, detectGaps } = useLearningStore();

  useEffect(() => {
    detectGaps();
  }, [detectGaps]);

  if (isLoading) return <Loading />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Knowledge Gaps</Text>
        {states.map((state) => (
          <Card key={state.conceptId} style={styles.stateCard}>
            <View style={styles.stateHeader}>
              <Text style={[styles.conceptName, { color: theme.colors.text }]}>Concept {state.conceptId}</Text>
              <View style={[
                styles.badge,
                { backgroundColor: getBadgeColor(state.state, theme) }
              ]}>
                <Text style={styles.badgeText}>{state.state}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const getBadgeColor = (state: string, theme: any) => {
  switch (state) {
    case 'KNOWN': return theme.colors.success;
    case 'WEAK': return theme.colors.warning;
    case 'MISSING': return theme.colors.error;
    default: return theme.colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  stateCard: { marginBottom: 12 },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conceptName: { fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});
