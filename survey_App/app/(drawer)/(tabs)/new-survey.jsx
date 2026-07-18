import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSurveys } from '../../../context/surveyContext';
import { useAppTheme } from '../../../context/ThemeContext';

export default function NewSurvey() {
  const router = useRouter();
  const {
    addSurvey,
    activePhoto,
    activeLocation,
    activeContact,
    resetActiveMedia,
  } = useSurveys();
  const { theme } = useAppTheme();

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
    title: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 20 },
    label: { color: theme.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
    input: {
      backgroundColor: theme.surface,
      color: theme.text,
      padding: 14,
      borderRadius: 12,
      marginBottom: 16,
      fontSize: 15,
    },
    textarea: { minHeight: 90, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    priorityButton: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    priorityText: { fontWeight: '700', fontSize: 14 },

    // Attachments section
    attachSection: { marginBottom: 16 },
    attachHeader: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 8,
    },
    attachCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      gap: 12,
    },
    attachIconBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    attachLabel: { fontSize: 12, color: theme.muted },
    attachValue: { fontSize: 14, fontWeight: '600', color: theme.text, marginTop: 2 },
    attachAction: {
      marginLeft: 'auto',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: `${theme.accent}18`,
    },
    attachActionText: { fontSize: 12, fontWeight: '700', color: theme.accent },
    attachPhoto: { width: 42, height: 42, borderRadius: 10 },
    linkedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
    },
    linkedText: { fontSize: 12, fontWeight: '600', color: '#10B981' },

    submitBtn: {
      marginTop: 10,
      backgroundColor: theme.accent,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  });

  const PRIORITY_COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
  };

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
      addSurvey({
        siteName,
        clientName,
        description,
        priority,
        date,
        notes,
        photo: activePhoto || null,
        location: activeLocation || null,
        contact: activeContact || null,
      });
      // reset form fields
      setSiteName('');
      setClientName('');
      setDescription('');
      setPriority('Medium');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      resetActiveMedia();

      Alert.alert('Success', 'Survey created successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(drawer)/(tabs)/'),
        },
      ]);
    } catch (_err) {
      Alert.alert('Error', 'Unable to create survey');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create New Survey</Text>

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
                {
                  backgroundColor: priority === p ? PRIORITY_COLORS[p] : theme.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: priority === p ? '#FFF' : theme.text },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={theme.muted} style={styles.input} />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={theme.muted}
          style={[styles.input, styles.textarea]}
          multiline
        />

        {/* Attachments */}
        <View style={styles.attachSection}>
          <Text style={styles.attachHeader}>Attachments</Text>

          {/* Photo */}
          <View style={styles.attachCard}>
            <View style={[styles.attachIconBox, { backgroundColor: '#3B82F618' }]}>
              {activePhoto ? (
                <Image source={{ uri: activePhoto }} style={styles.attachPhoto} />
              ) : (
                <MaterialIcons name="photo-camera" size={22} color="#3B82F6" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attachLabel}>Photo</Text>
              <Text style={styles.attachValue}>
                {activePhoto ? 'Photo captured' : 'No photo'}
              </Text>
            </View>
            {activePhoto ? (
              <View style={styles.linkedBadge}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.linkedText}>Linked</Text>
              </View>
            ) : (
              <Pressable
                style={styles.attachAction}
                onPress={() => router.push('/(drawer)/camera')}
              >
                <Text style={styles.attachActionText}>Capture</Text>
              </Pressable>
            )}
          </View>

          {/* Location */}
          <View style={styles.attachCard}>
            <View style={[styles.attachIconBox, { backgroundColor: '#10B98118' }]}>
              <MaterialIcons name="my-location" size={22} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attachLabel}>Location</Text>
              <Text style={styles.attachValue} numberOfLines={1}>
                {activeLocation
                  ? `${activeLocation.coords.latitude.toFixed(4)}, ${activeLocation.coords.longitude.toFixed(4)}`
                  : 'No location'}
              </Text>
            </View>
            {activeLocation ? (
              <View style={styles.linkedBadge}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.linkedText}>Linked</Text>
              </View>
            ) : (
              <Pressable
                style={styles.attachAction}
                onPress={() => router.push('/(drawer)/location')}
              >
                <Text style={styles.attachActionText}>Fetch</Text>
              </Pressable>
            )}
          </View>

          {/* Contact */}
          <View style={styles.attachCard}>
            <View style={[styles.attachIconBox, { backgroundColor: '#8B5CF618' }]}>
              <MaterialIcons name="contacts" size={22} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attachLabel}>Contact</Text>
              <Text style={styles.attachValue} numberOfLines={1}>
                {activeContact ? `${activeContact.name}` : 'No contact'}
              </Text>
            </View>
            {activeContact ? (
              <View style={styles.linkedBadge}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.linkedText}>Linked</Text>
              </View>
            ) : (
              <Pressable
                style={styles.attachAction}
                onPress={() => router.push('/(drawer)/contacts')}
              >
                <Text style={styles.attachActionText}>Select</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          <MaterialIcons name="save" size={20} color="#FFF" />
          <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Create Survey'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
