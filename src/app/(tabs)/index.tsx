import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Linking } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/design/theme/ThemeContext';
import { Card } from '@/design/components/Card';
import { useHomeStore } from '@/features/home/HomeStore';
import { Icon } from '@/design/components/Icon';
import { EmptyState } from '@/design/components/EmptyState';
import { Platform } from '@/platform/Platform';
import { knowledgePipeline } from '@/features/knowledge/KnowledgePipeline';
import { useKnowledgeStore } from '@/features/knowledge/KnowledgeStore';
import { logger } from '@/core/logging/Logger';
import { Loading } from '@/design/components/Loading';
import { MemoraLogo } from '@/design/components/MemoraLogo';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, recentItems, isLoading: isHomeLoading, fetchHomeData } = useHomeStore();
  const { isLoading: isKnowledgeLoading, loadingLabel, setLoading } = useKnowledgeStore();

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  const handleCapture = async (type: 'PDF' | 'IMAGE' | 'VOICE') => {
    try {
      if (type === 'PDF') {
        Alert.alert(
          'Beta Feature',
          'PDF text extraction is in beta. For best results, use simple documents without complex layouts or multiple columns.',
          [
            {
              text: 'Continue',
              onPress: async () => {
                const res = await Platform.FilePicker.pickDocument({ type: 'application/pdf' });
                if (res) {
                  await knowledgePipeline.ingestPDF(res.uri, res.name);
                  await fetchHomeData();
                  Alert.alert('Success', 'PDF ingested successfully');
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else if (type === 'IMAGE') {
        const hasPermission = await Platform.Camera.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Camera access is required to scan documents. Please enable it in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }

        const res = await Platform.Camera.takePhoto();
        if (res) {
          setLoading(true, 'Processing image...');
          await knowledgePipeline.ingestImage(res.uri);
          await fetchHomeData();
          setLoading(false);
          Alert.alert('Success', 'Image processed via OCR');
        }
      } else if (type === 'VOICE') {
        router.push('/notes/voice-record');
      }
    } catch (error) {
      setLoading(false);
      logger.error(`Failed to capture ${type}`, error);
      Alert.alert('Error', `Failed to process ${type.toLowerCase()}`);
    }
  };

  if (isKnowledgeLoading) {
    return <Loading message={loadingLabel || "Ingesting knowledge..."} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isHomeLoading} onRefresh={fetchHomeData} />
      }
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.brandRow}>
          <MemoraLogo size={32} showText={false} />
          <Text style={[styles.greeting, { color: theme.colors.textSecondary, marginLeft: 8 }]}>Hello,</Text>
        </View>
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
            onPress={() => handleCapture('PDF')}
          />
          <CaptureButton
            icon="camera"
            label="Scan"
            onPress={() => handleCapture('IMAGE')}
          />
          <CaptureButton
            icon="microphone"
            label="Voice"
            onPress={() => handleCapture('VOICE')}
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
              <View style={styles.recentItemRow}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
                  <Icon name={getIconForType(item.type)} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
                      {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={[styles.itemSnippet, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {item.content}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
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
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemSnippet: {
    fontSize: 13,
    lineHeight: 18
  },
  itemDate: {
    fontSize: 11,
    marginLeft: 8
  },
  empty: { paddingVertical: 40 },
});
