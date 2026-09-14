import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/design/theme/ThemeContext';
import { useSettingsStore } from '@/features/settings/SettingsStore';
import { useAIModelStore } from '@/ai/AIModelManager';
import { Card } from '@/design/components/Card';
import { Icon } from '@/design/components/Icon';

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { inferenceMode, setInferenceMode } = useSettingsStore();
  const { state, deleteModel } = useAIModelStore();

  const isModelReady = state === 'READY' || state === 'LOADED';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>AI Configuration</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Use Local AI</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                Process data on-device (Privacy First)
              </Text>
            </View>
            <Switch
              value={inferenceMode === 'LOCAL'}
              onValueChange={(val) => setInferenceMode(val ? 'LOCAL' : 'CLOUD')}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          {inferenceMode === 'LOCAL' && (
            <View style={[styles.modelStatusContainer, { borderTopColor: theme.colors.border }]}>
              <View style={styles.modelInfo}>
                <Icon
                  name={isModelReady ? "check-circle" : "alert-circle"}
                  size={20}
                  color={isModelReady ? theme.colors.success : theme.colors.warning}
                />
                <View style={styles.modelNameContainer}>
                  <Text style={[styles.modelName, { color: theme.colors.text }]}>Qwen 2.5 1.5B</Text>
                  <Text style={[styles.modelStatus, { color: theme.colors.textSecondary }]}>
                    {isModelReady ? 'Downloaded & Ready' : 'Not Downloaded'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => isModelReady ? deleteModel() : router.push('/ai-model')}
                style={[styles.modelActionButton, { backgroundColor: isModelReady ? theme.colors.error + '20' : theme.colors.primary + '20' }]}
              >
                <Text style={[styles.modelActionText, { color: isModelReady ? theme.colors.error : theme.colors.primary }]}>
                  {isModelReady ? 'Delete' : 'Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  settingCard: { padding: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTextContainer: { flex: 1, marginRight: 16 },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 2 },
  modelStatusContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modelInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modelNameContainer: { marginLeft: 12 },
  modelName: { fontSize: 14, fontWeight: 'bold' },
  modelStatus: { fontSize: 12 },
  modelActionButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  modelActionText: { fontSize: 12, fontWeight: '600' },
});
