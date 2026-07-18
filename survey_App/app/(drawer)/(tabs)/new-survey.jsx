import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSurveys } from '../../../context/surveyContext';
import { useAppTheme } from '../../../context/ThemeContext';

export default function NewSurvey() {
  const router = useRouter();
  const { addSurvey } = useSurveys();
  const { theme } = useAppTheme();

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, padding: 20 },
    label: { color: theme.muted, fontSize: 13, marginBottom: 6 },
    input: { backgroundColor: theme.surface, color: theme.text, padding: 12, borderRadius: 10, marginBottom: 14 },
    textarea: { minHeight: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    priorityButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
    priorityText: { fontWeight: '700' },
    submitBtn: { marginTop: 8, backgroundColor: theme.accent, padding: 14, borderRadius: 12, alignItems: 'center' },
    submitText: { color: theme.surface, fontWeight: '700' },
  });

  function validate() {
    if (!siteName.trim()) {
      Alert.alert('Validation', 'Site Name is required');
      return false;
    }
    if (!clientName.trim()) {
      Alert.alert('Validation', 'Client Name is required');
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      addSurvey({ siteName, clientName, description, priority, date });
      // reset form fields
      setSiteName('');
      setClientName('');
      setDescription('');
      setPriority('Medium');
      setDate(new Date().toISOString().slice(0, 10));

      Alert.alert('Success', 'Survey created successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(drawer)/(tabs)/Dashboard'),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Unable to create survey');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Site Name *</Text>
        <TextInput value={siteName} onChangeText={setSiteName} placeholder="Enter site name" placeholderTextColor={theme.muted} style={styles.input} />

        <Text style={styles.label}>Client Name *</Text>
        <TextInput value={clientName} onChangeText={setClientName} placeholder="Enter client name" placeholderTextColor={theme.muted} style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Describe the site or notes" placeholderTextColor={theme.muted} style={[styles.input, styles.textarea]} multiline />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {['Low', 'Medium', 'High'].map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityButton,
                { backgroundColor: priority === p ? theme.accent : theme.surface },
              ]}
            >
              <Text style={[styles.priorityText, { color: priority === p ? theme.surface : theme.text }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={theme.muted} style={styles.input} />

        <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Create Survey'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
