import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';
import { useHomeStore } from '@/features/home/HomeStore';
import { Icon } from '@/design/components/Icon';
import { Button } from '@/design/components/Button';
import { EmptyState } from '@/design/components/EmptyState';
import { Platform } from '@/platform/Platform';
import { knowledgePipeline } from '@/features/knowledge/KnowledgePipeline';

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { stats, recentItems, isLoading, fetchHomeData } = useHomeStore();

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchHomeData} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Hello,</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your Knowledge</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          label="Total"
          value={stats.totalItems.toString()}
          icon="database"
        />
        <StatCard
          label="This Week"
          value={stats.itemsThisWeek.toString()}
          icon="calendar-week"
        />
        <StatCard
          label="Gaps"
          value={stats.knowledgeGaps.toString()}
          icon="alert-circle-outline"
          color={theme.colors.warning}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Capture</Text>
        <View style={styles.captureGrid}>
          <CaptureButton
            icon="note-plus"
            label="Note"
            onPress={() => router.push('/notes/create')}
          />
          <CaptureButton
            icon="file-pdf-box"
            label="PDF"
            onPress={async () => {
              const res = await Platform.FilePicker.pickDocument({ type: 'application/pdf' });
              if (res) await knowledgePipeline.ingestPDF(res.uri, res.name);
            }}
          />
          <CaptureButton
            icon="camera"
            label="Scan"
            onPress={async () => {
              const res = await Platform.Camera.takePhoto();
              if (res) await knowledgePipeline.ingestImage(res.uri);
            }}
          />
          <CaptureButton
            icon="microphone"
            label="Voice"
            onPress={() => {}}
          />
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
              <Text>{item.title}</Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
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

const CaptureButton = ({ icon, label, onPress }: any) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.captureButton} onPress={onPress}>
      <View style={[styles.captureIcon, { backgroundColor: theme.colors.secondary }]}>
        <Icon name={icon} color={theme.colors.primary} />
      </View>
      <Text style={[styles.captureLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

import { TouchableOpacity } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
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
