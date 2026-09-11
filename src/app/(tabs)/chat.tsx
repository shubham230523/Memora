import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform as RNPlatform } from 'react-native';
import { useTheme } from '@/design/theme/ThemeContext';
import { useChatStore } from '@/features/chat/ChatStore';
import { TextInput } from '@/design/components/TextInput';
import { Button } from '@/design/components/Button';
import { Card } from '@/design/components/Card';

export default function ChatScreen() {
  const { theme } = useTheme();
  const { currentConversation, messages, isLoading, startNewChat, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!currentConversation) {
      startNewChat();
    }
  }, [currentConversation, startNewChat]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.role === 'user' ? styles.userMessage : styles.assistantMessage
          ]}>
            <Card style={[
              styles.messageCard,
              { backgroundColor: item.role === 'user' ? theme.colors.primary : theme.colors.surface }
            ]}>
              <Text style={{ color: item.role === 'user' ? '#FFF' : theme.colors.text }}>
                {item.content}
              </Text>
            </Card>
          </View>
        )}
      />

      <View style={[styles.inputArea, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TextInput
          placeholder="Ask Recall about your knowledge..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.textInput}
          multiline
        />
        <Button
          title="Send"
          onPress={handleSend}
          loading={isLoading}
          disabled={!inputText.trim()}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { padding: 16 },
  messageContainer: { marginBottom: 12, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end' },
  assistantMessage: { alignSelf: 'flex-start' },
  messageCard: { padding: 12, borderRadius: 16 },
  inputArea: { padding: 16, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  textInput: { flex: 1, marginBottom: 0 },
  sendButton: { paddingVertical: 10 },
});
