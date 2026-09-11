import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/design/theme/ThemeContext';
import { TextInput } from '@/design/components/TextInput';
import { Button } from '@/design/components/Button';
import { noteRepository } from '@/features/notes/NoteRepository';
import { logger } from '@/core/logging/Logger';

export default function CreateNoteScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await noteRepository.create(title, content);
      router.back();
    } catch (error) {
      logger.error('Failed to save note', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <TextInput
          label="Title"
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          label="Content"
          placeholder="Write something..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          inputStyle={styles.contentInput}
        />
        <Button
          title="Save Note"
          onPress={handleSave}
          loading={isSaving}
          disabled={!title.trim()}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 24 },
  contentInput: { minHeight: 200, textAlignVertical: 'top' },
  saveButton: { marginTop: 24 },
});
