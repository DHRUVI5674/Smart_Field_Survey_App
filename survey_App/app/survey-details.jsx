import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSurveys } from '../context/surveyContext';
import { useAppTheme } from '../context/ThemeContext';

export default function SurveyDetailsScreen() {
  const router = useRouter();
  const { surveyId } = useLocalSearchParams();
  const { surveys, updateSurvey } = useSurveys();
  const { theme, mode, toggleTheme } = useAppTheme();

  const [isEditing, setIsEditing] = useState(false);

  // Find the survey
  const survey = surveys.find((s) => s.id === surveyId);

  // Editable fields
  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (survey) {
      setSiteName(survey.siteName || '');
      setClientName(survey.clientName || '');
      setDescription(survey.description || '');
      setPriority(survey.priority || 'Medium');
      setNotes(survey.notes || '');
    }
  }, [survey]);

  if (!survey) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="error-outline" size={64} color={theme.muted} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginTop: 16 }}>
          Survey Not Found
        </Text>
        <Text style={{ color: theme.muted, marginTop: 8 }}>
          This survey may have been deleted.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            backgroundColor: theme.accent,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!siteName.trim()) {
      Alert.alert('Validation', 'Site Name cannot be empty.');
      return;
    }
    if (!clientName.trim()) {
      Alert.alert('Validation', 'Client Name cannot be empty.');
      return;
    }
    updateSurvey({
      ...survey,
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      description: description.trim(),
      priority,
      notes: notes.trim(),
    });
    setIsEditing(false);
    Alert.alert('Saved', 'Survey details have been updated.');
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Survey',
      'Are you sure you want to submit this survey? Once submitted, it will be marked as complete.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            updateSurvey({ ...survey, status: 'submitted' });
            Alert.alert('Success', 'Survey has been submitted successfully!', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const PRIORITY_COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
  };

  const formatDateTime = (str) => {
    if (!str) return 'N/A';
    try {
      return new Date(str).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return str;
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    header: {
      height: 64,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    // Section
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // Detail card
    detailCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    detailIconBox: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: `${theme.accent}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    detailLabel: { fontSize: 12, color: theme.muted },
    detailValue: { fontSize: 15, fontWeight: '600', color: theme.text, marginTop: 2 },
    divider: {
      height: 1,
      backgroundColor: `${theme.muted}15`,
      marginHorizontal: 16,
    },

    // Editable input
    editInput: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginTop: 2,
      borderBottomWidth: 1.5,
      borderBottomColor: theme.accent,
      paddingBottom: 2,
      paddingHorizontal: 0,
    },

    // Priority pills
    priorityRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    priorityPill: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    priorityPillText: { fontWeight: '700', fontSize: 13 },

    // Photo section
    photoContainer: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    photoImage: {
      width: '100%',
      height: 220,
    },
    noPhotoBox: {
      height: 140,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${theme.muted}10`,
    },
    noPhotoText: { fontSize: 13, color: theme.muted, marginTop: 8 },

    // Notes
    notesCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    notesText: { fontSize: 14, color: theme.text, lineHeight: 22 },
    notesInput: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      minHeight: 80,
      textAlignVertical: 'top',
      borderWidth: 1.5,
      borderColor: theme.accent,
      borderRadius: 10,
      padding: 12,
    },
    notesPlaceholder: { fontSize: 14, color: theme.muted, fontStyle: 'italic' },

    // Status badge
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginBottom: 10,
    },
    statusText: { fontSize: 13, fontWeight: '700' },

    // Buttons
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 30,
      marginBottom: 20,
    },
    editBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    editBtnText: { fontSize: 15, fontWeight: '700', color: theme.accent },
    submitBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: '#10B981',
    },
    submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    saveBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.accent,
    },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    cancelBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.muted,
    },
    cancelBtnText: { fontSize: 15, fontWeight: '700', color: theme.muted },
  });

  const isSubmitted = survey.status === 'submitted';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color={theme.accentDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Survey Details</Text>
        <Pressable onPress={toggleTheme}>
          <MaterialIcons
            name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
            size={24}
            color={theme.accentDark}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        {isSubmitted ? (
          <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
            <MaterialIcons name="check-circle" size={18} color="#10B981" />
            <Text style={[styles.statusText, { color: '#10B981' }]}>Submitted</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: '#F59E0B20' }]}>
            <MaterialIcons name="pending" size={18} color="#F59E0B" />
            <Text style={[styles.statusText, { color: '#F59E0B' }]}>Draft</Text>
          </View>
        )}

        {/* ─── Site Details ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="business" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Site Details</Text>
        </View>

        <View style={styles.detailCard}>
          {/* Site Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MaterialIcons name="place" size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Site Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={siteName}
                  onChangeText={setSiteName}
                  placeholder="Site Name"
                  placeholderTextColor={theme.muted}
                />
              ) : (
                <Text style={styles.detailValue}>{survey.siteName}</Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />

          {/* Client */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MaterialIcons name="person" size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Client</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="Client Name"
                  placeholderTextColor={theme.muted}
                />
              ) : (
                <Text style={styles.detailValue}>{survey.clientName}</Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MaterialIcons name="description" size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description"
                  placeholderTextColor={theme.muted}
                />
              ) : (
                <Text style={styles.detailValue}>
                  {survey.description || 'No description provided'}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />

          {/* Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MaterialIcons name="event" size={20} color={theme.accent} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {survey.date || formatDateTime(survey.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Priority */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MaterialIcons name="flag" size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Priority</Text>
              {isEditing ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  {['Low', 'Medium', 'High'].map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityPill,
                        {
                          backgroundColor:
                            priority === p
                              ? PRIORITY_COLORS[p]
                              : `${theme.muted}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          {
                            color:
                              priority === p ? '#FFFFFF' : theme.muted,
                          },
                        ]}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 2,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: PRIORITY_COLORS[survey.priority] || theme.muted,
                    }}
                  />
                  <Text style={styles.detailValue}>{survey.priority}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Survey ID */}
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MaterialIcons name="fingerprint" size={20} color={theme.accent} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Survey ID</Text>
              <Text style={styles.detailValue}>{survey.id}</Text>
            </View>
          </View>
        </View>

        {/* ─── Photo ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="photo-camera" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Photo</Text>
        </View>

        <View style={styles.photoContainer}>
          {survey.photo ? (
            <Image source={{ uri: survey.photo }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <View style={styles.noPhotoBox}>
              <MaterialIcons name="image" size={40} color={theme.muted} />
              <Text style={styles.noPhotoText}>No photo attached</Text>
            </View>
          )}
        </View>

        {/* ─── Contact ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="contacts" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Contact</Text>
        </View>

        <View style={styles.detailCard}>
          {survey.contact ? (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialIcons name="phone" size={20} color={theme.accent} />
              </View>
              <View>
                <Text style={styles.detailLabel}>{survey.contact.name}</Text>
                <Text style={styles.detailValue}>{survey.contact.phone}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialIcons name="person-off" size={20} color={theme.muted} />
              </View>
              <View>
                <Text style={[styles.detailValue, { color: theme.muted }]}>
                  No contact linked
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ─── Location ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="my-location" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>

        <View style={styles.detailCard}>
          {survey.location ? (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <MaterialIcons name="place" size={20} color={theme.accent} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Coordinates</Text>
                  <Text style={styles.detailValue}>
                    {survey.location.coords
                      ? `${survey.location.coords.latitude.toFixed(6)}, ${survey.location.coords.longitude.toFixed(6)}`
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              {survey.location.coords?.accuracy && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                      <MaterialIcons name="gps-fixed" size={20} color={theme.accent} />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Accuracy</Text>
                      <Text style={styles.detailValue}>
                        ±{survey.location.coords.accuracy.toFixed(1)}m
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialIcons name="location-off" size={20} color={theme.muted} />
              </View>
              <View>
                <Text style={[styles.detailValue, { color: theme.muted }]}>
                  No location attached
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ─── Notes ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="sticky-note-2" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Notes</Text>
        </View>

        <View style={styles.notesCard}>
          {isEditing ? (
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={theme.muted}
              multiline
            />
          ) : survey.notes ? (
            <Text style={styles.notesText}>{survey.notes}</Text>
          ) : (
            <Text style={styles.notesPlaceholder}>No notes added</Text>
          )}
        </View>

        {/* ─── Action Buttons ─── */}
        {!isSubmitted && (
          <View style={styles.buttonRow}>
            {isEditing ? (
              <>
                <Pressable style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                  <MaterialIcons name="close" size={20} color={theme.muted} />
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleSave}>
                  <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.editBtn} onPress={() => setIsEditing(true)}>
                  <MaterialIcons name="edit" size={20} color={theme.accent} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                  <MaterialIcons name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
