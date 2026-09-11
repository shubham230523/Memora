import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';
import { Icon } from '@/design/components/Icon';
import { EmptyState } from '@/design/components/EmptyState';
import { mockStats, mockRecentItems, mockEmptyItems, mockLongTitleItems } from './MockData';

type PreviewState = 'DEFAULT' | 'EMPTY' | 'LOADING' | 'LONG_CONTENT';

export default function HomeScreenPreview() {
  const { theme } = useTheme();
  const [currentState, setCurrentState] = useState<PreviewState>('DEFAULT');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data based on state
  const stats = currentState === 'EMPTY' ? { totalItems: 0, itemsThisWeek: 0, knowledgeGaps: 0 } : mockStats;
  const recentItems = currentState === 'EMPTY' ? mockEmptyItems :
                      currentState === 'LONG_CONTENT' ? mockLongTitleItems : mockRecentItems;

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
  };

  return (
    <View style={[styles.fullContainer, { backgroundColor: theme.colors.background }]}>
      {/* State Selector Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.toolbarTitle, { color: theme.colors.text }]}>Preview State:</Text>
        <View style={styles.buttonRow}>
          {(['DEFAULT', 'EMPTY', 'LOADING', 'LONG_CONTENT'] as PreviewState[]).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.stateBtn, currentState === s && { backgroundColor: theme.colors.primary }]}
              onPress={() => setCurrentState(s)}
            >
              <Text style={[styles.stateBtnText, currentState === s && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading || currentState === 'LOADING'} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Your Knowledge (Preview)</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard label="Total" value={stats.totalItems.toString()} icon="database" />
          <StatCard label="This Week" value={stats.itemsThisWeek.toString()} icon="calendar-week" />
          <StatCard label="Gaps" value={stats.knowledgeGaps.toString()} icon="alert-circle-outline" color={theme.colors.warning} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Capture</Text>
          <View style={styles.captureGrid}>
            <CaptureButton icon="note-plus" label="Note" />
            <CaptureButton icon="file-pdf-box" label="PDF" />
            <CaptureButton icon="camera" label="Scan" />
            <CaptureButton icon="microphone" label="Voice" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Knowledge</Text>
          {recentItems.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              message="Capture your first piece of knowledge to see it here."
              style={styles.empty}
            />
          ) : (
            recentItems.map(item => (
              <Card key={item.id} style={styles.itemCard}>
                <Text style={{ color: theme.colors.text }}>{item.title}</Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const StatCard = ({ label, value, icon, color }: any) => {
  const { theme } = useTheme();
  return (
    <Card style={styles.statCard}>
      <Icon name={icon} size={24} color={color || theme.colors.primary} />
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </Card>
  );
};

const CaptureButton = ({ icon, label }: any) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.captureButton}>
      <View style={[styles.captureIcon, { backgroundColor: theme.colors.secondary }]}>
        <Icon name={icon} color={theme.colors.primary} />
      </View>
      <Text style={[styles.captureLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullContainer: { flex: 1 },
  toolbar: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarTitle: { fontSize: 12, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 4 },
  stateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  stateBtnText: { fontSize: 10 },
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 40 },
  greeting: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 2 },
  section: { marginTop: 32, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  captureGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  captureButton: { alignItems: 'center', flex: 1 },
  captureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  captureLabel: { fontSize: 12, fontWeight: '500' },
  itemCard: { marginBottom: 12 },
  empty: { paddingVertical: 40 },
});
