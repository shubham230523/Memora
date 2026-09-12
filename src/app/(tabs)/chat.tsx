import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform as RNPlatform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/design/theme/ThemeContext';
import { useChatStore } from '@/features/chat/ChatStore';
import { useAIModelStore } from '@/ai/AIModelManager';
import { useSettingsStore } from '@/features/settings/SettingsStore';
import { TextInput } from '@/design/components/TextInput';
import { Button } from '@/design/components/Button';
import { Card } from '@/design/components/Card';
import { Icon } from '@/design/components/Icon';

export default function ChatScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentConversation, messages, isLoading: isSending, startNewChat, sendMessage } = useChatStore();
  const { state: modelState, loadModel } = useAIModelStore();
  const { inferenceMode } = useSettingsStore();
  const [inputText, setInputText] = useState('');

  const isLocalMode = inferenceMode === 'LOCAL';
  const isModelLoading = modelState === 'LOADING';
  const isModelReady = modelState === 'LOADED' || modelState === 'READY';
  const needsSetup = isLocalMode && (modelState === 'NOT_INSTALLED' || modelState === 'FAILED');

  useEffect(() => {
    if (!currentConversation) {
      startNewChat();
    }
  }, [currentConversation, startNewChat]);

  const handleSend = () => {
    if (!inputText.trim() || isSending || (isLocalMode && !isModelReady)) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={RNPlatform.OS === 'ios' ? 90 : 120}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messageList, { paddingTop: insets.top + 16 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.role === 'user' ? styles.userMessage : styles.assistantMessage
            ]}>
              <Card style={[
                styles.messageCard,
                { backgroundColor: item.role === 'user' ? theme.colors.primary : theme.colors.surface }
              ] as any}>
                <Text style={{ color: item.role === 'user' ? '#FFF' : theme.colors.text }}>
                  {item.content}
                </Text>
              </Card>
            </View>
          )}
        />

        {isLocalMode && (
          <View style={[styles.statusBanner, { backgroundColor: theme.colors.surface }]}>
            {isModelLoading ? (
              <View style={styles.bannerContent}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>Loading local AI model...</Text>
              </View>
            ) : needsSetup ? (
              <View style={styles.bannerContent}>
                <Icon name="alert-circle" size={16} color={theme.colors.warning} />
                <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>Local AI needs setup</Text>
                <Button title="Fix" onPress={() => loadModel()} variant="ghost" style={styles.fixButton} textStyle={{ fontSize: 12 }} />
              </View>
            ) : null}
          </View>
        )}

        <View style={[styles.inputArea, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            placeholder={needsSetup ? "AI Setup Required" : "Ask Memora about your knowledge..."}
            value={inputText}
            onChangeText={setInputText}
            containerStyle={styles.textInputContainer}
            style={styles.textInput}
            multiline
            editable={!needsSetup && !isModelLoading}
          />
          <Button
            title="Send"
            onPress={handleSend}
            loading={isSending}
            disabled={!inputText.trim() || needsSetup || isModelLoading}
            style={styles.sendButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { padding: 16 },
  messageContainer: { marginBottom: 12, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end' },
  assistantMessage: { alignSelf: 'flex-start' },
  messageCard: { padding: 12, borderRadius: 16 },
  statusBanner: { paddingVertical: 4, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#00000010' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 12 },
  fixButton: { paddingVertical: 4, paddingHorizontal: 8 },
  inputArea: {
    padding: 16,
    paddingBottom: RNPlatform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12
  },
  textInputContainer: { flex: 1, marginBottom: 0 },
  textInput: { maxHeight: 120, paddingTop: 10, paddingBottom: 10 },
  sendButton: { paddingVertical: 10 },
});
