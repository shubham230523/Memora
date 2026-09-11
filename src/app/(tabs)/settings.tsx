import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';
import { useSettingsStore } from '@/features/settings/SettingsStore';
import { Card } from '@/design/components/Card';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { inferenceMode, setInferenceMode } = useSettingsStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>AI Configuration</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
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
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  settingCard: { padding: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 2 },
});
