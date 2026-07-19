import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Speech from 'expo-speech';
import { useSurveys } from '../context/surveyContext';
import { useAppTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Audio } from 'expo-av';
import { hapticButtonPress } from '../utils/haptics';

// ─── Status config ────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { key: 'draft',       label: 'Draft',       color: '#F59E0B', icon: 'pending'       },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6', icon: 'autorenew'     },
  { key: 'submitted',   label: 'Submitted',   color: '#10B981', icon: 'check-circle'  },
  { key: 'rejected',    label: 'Rejected',    color: '#EF4444', icon: 'cancel'        },
];

function getStatusConfig(status) {
  return STATUS_OPTIONS.find((s) => s.key === status) || STATUS_OPTIONS[0];
}

// ─── Priority config ───────────────────────────────────────────────
const PRIORITY_COLORS = {
  Low:    '#10B981',
  Medium: '#F59E0B',
  High:   '#EF4444',
};

export default function SurveyDetailsScreen() {
  const router        = useRouter();
  const { surveyId }  = useLocalSearchParams();
  const { surveys, updateSurvey, deleteSurvey } = useSurveys();
  const { theme, mode, toggleTheme }             = useAppTheme();
  const { showToast }                            = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const voiceSoundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (voiceSoundRef.current) {
        voiceSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const handlePlayVoice = async () => {
    await hapticButtonPress();
    if (!survey?.voiceUri) return;
    try {
      if (isPlayingVoice) {
        if (voiceSoundRef.current) {
          await voiceSoundRef.current.stopAsync();
          await voiceSoundRef.current.unloadAsync();
          voiceSoundRef.current = null;
        }
        setIsPlayingVoice(false);
        return;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: survey.voiceUri },
        { shouldPlay: true }
      );
      voiceSoundRef.current = sound;
      setIsPlayingVoice(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingVoice(false);
        }
      });
    } catch (e) {
      console.error(e);
      showToast('Playback error', { type: 'error' });
    }
  };

  const survey = surveys.find((s) => s.id === surveyId);

  // Editable fields
  const [siteName,    setSiteName]    = useState('');
  const [clientName,  setClientName]  = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState('Medium');
  const [notes,       setNotes]       = useState('');
  const [status,      setStatus]      = useState('draft');

  useEffect(() => {
    if (survey) {
      setSiteName(survey.siteName     || '');
      setClientName(survey.clientName || '');
      setDescription(survey.description || '');
      setPriority(survey.priority     || 'Medium');
      setNotes(survey.notes           || '');
      setStatus(survey.status         || 'draft');
    }
  }, [survey]);

  // ── Not found ──────────────────────────────────────────────────
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
          style={{ marginTop: 24, backgroundColor: theme.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────
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
      siteName:    siteName.trim(),
      clientName:  clientName.trim(),
      description: description.trim(),
      priority,
      notes:       notes.trim(),
      status,
    });
    setIsEditing(false);
    Alert.alert('Saved', 'Survey details have been updated.');
  };

  const handleDelete = () => {
    const doDelete = () => {
      deleteSurvey(survey.id);
      router.replace('/(drawer)/(tabs)/history');
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete "${survey.siteName}"? This cannot be undone.`
      );
      if (confirmed) doDelete();
    } else {
      Alert.alert(
        'Delete Survey',
        `Are you sure you want to permanently delete "${survey.siteName}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const handleShare = async () => {
    await hapticButtonPress();
    try {
      await Share.share({
        message: `📋 Survey: ${survey.siteName}\nClient: ${survey.clientName}\nPriority: ${survey.priority}\nDate: ${survey.date || 'N/A'}\nStatus: ${survey.status}\nID: ${survey.id}`,
        title: `Survey – ${survey.siteName}`,
      });
    } catch (e) {
      showToast('Unable to share right now.', { type: 'error' });
    }
  };

  const handleQR = () => {
    hapticButtonPress();
    router.push({ pathname: '/(drawer)/qr-survey', params: { surveyId: survey.id } });
  };

  const handleTTS = async () => {
    await hapticButtonPress();
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    const text = `Survey for ${survey.siteName}. Client: ${survey.clientName}. Priority: ${survey.priority}. Status: ${survey.status}. ${survey.description ? 'Description: ' + survey.description : ''} ${survey.notes ? 'Notes: ' + survey.notes : ''}`;
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'en',
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };


  const formatDateTime = (str) => {
    if (!str) return 'N/A';
    try {
      return new Date(str).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return str;
    }
  };

  const currentStatus = getStatusConfig(survey.status);

  // ── Styles ─────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    safeArea:    { flex: 1, backgroundColor: theme.background },
    header: {
      height: 64, paddingHorizontal: 20,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    scroll:      { paddingHorizontal: 20, paddingBottom: 40 },

    // Section headers
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 14 },
    sectionTitle:  { fontSize: 15, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: 1 },

    // Detail card
    detailCard: {
      backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden',
      elevation: 3, shadowColor: theme.cardShadow, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    detailRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    detailIconBox: {
      width: 38, height: 38, borderRadius: 10, backgroundColor: `${theme.accent}15`,
      justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    detailLabel: { fontSize: 12, color: theme.muted },
    detailValue: { fontSize: 15, fontWeight: '600', color: theme.text, marginTop: 2 },
    divider:     { height: 1, backgroundColor: `${theme.muted}15`, marginHorizontal: 16 },

    // Editable input
    editInput: {
      fontSize: 15, fontWeight: '600', color: theme.text, marginTop: 2,
      borderBottomWidth: 1.5, borderBottomColor: theme.accent, paddingBottom: 2, paddingHorizontal: 0,
    },

    // Priority pills
    priorityPill:     { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    priorityPillText: { fontWeight: '700', fontSize: 13 },

    // Status badge (display - top of page)
    statusBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      alignSelf: 'flex-start', marginBottom: 10,
    },
    statusText: { fontSize: 13, fontWeight: '700' },

    // Status card (big display)
    statusCard: {
      borderRadius: 16, padding: 20,
      elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
      flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    statusIconCircle: {
      width: 52, height: 52, borderRadius: 26,
      justifyContent: 'center', alignItems: 'center',
    },
    statusLabel:      { fontSize: 12, fontWeight: '600', color: '#FFFFFF', opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.8 },
    statusValue:      { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },

    // Status pill selector (edit mode)
    statusPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statusPill: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24,
      borderWidth: 2,
    },
    statusPillText: { fontSize: 13, fontWeight: '700' },

    // Photo
    photoContainer: {
      backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden',
      elevation: 3, shadowColor: theme.cardShadow, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    photoImage:  { width: '100%', height: 220 },
    noPhotoBox:  { height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: `${theme.muted}10` },
    noPhotoText: { fontSize: 13, color: theme.muted, marginTop: 8 },

    // Notes
    notesCard: {
      backgroundColor: theme.surface, borderRadius: 16, padding: 16,
      elevation: 3, shadowColor: theme.cardShadow, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    notesText:        { fontSize: 14, color: theme.text, lineHeight: 22 },
    notesInput: {
      fontSize: 14, color: theme.text, lineHeight: 22, minHeight: 80,
      textAlignVertical: 'top', borderWidth: 1.5, borderColor: theme.accent, borderRadius: 10, padding: 12,
    },
    notesPlaceholder: { fontSize: 14, color: theme.muted, fontStyle: 'italic' },

    // Buttons
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 12 },
    editBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 14, borderRadius: 14, backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.accent,
    },
    editBtnText:   { fontSize: 15, fontWeight: '700', color: theme.accent },
    saveBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 14, borderRadius: 14, backgroundColor: theme.accent,
    },
    saveBtnText:   { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    cancelBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 14, borderRadius: 14, backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.muted,
    },
    cancelBtnText: { fontSize: 15, fontWeight: '700', color: theme.muted },
    deleteBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 14, borderRadius: 14, backgroundColor: '#EF444420',
      borderWidth: 1.5, borderColor: '#EF4444', marginBottom: 20,
    },
    deleteBtnText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  });

  // ── Render ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color={theme.accentDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Survey Details</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={handleTTS} style={{ padding: 4 }}>
            <MaterialIcons name={isSpeaking ? 'stop' : 'record-voice-over'} size={22} color={isSpeaking ? '#EF4444' : theme.accentDark} />
          </Pressable>
          <Pressable onPress={handleQR} style={{ padding: 4 }}>
            <MaterialIcons name="qr-code" size={22} color={theme.accentDark} />
          </Pressable>
          <Pressable onPress={handleShare} style={{ padding: 4 }}>
            <MaterialIcons name="share" size={22} color={theme.accentDark} />
          </Pressable>
          <Pressable onPress={toggleTheme} style={{ padding: 4 }}>
            <MaterialIcons
              name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
              size={24}
              color={theme.accentDark}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── Status Badge (view mode) ─── */}
        {!isEditing && (
          <View style={[styles.statusBadge, { backgroundColor: `${currentStatus.color}20` }]}>
            <MaterialIcons name={currentStatus.icon} size={18} color={currentStatus.color} />
            <Text style={[styles.statusText, { color: currentStatus.color }]}>
              {currentStatus.label}
            </Text>
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
                        { backgroundColor: priority === p ? PRIORITY_COLORS[p] : `${theme.muted}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          { color: priority === p ? '#FFFFFF' : theme.muted },
                        ]}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <View
                    style={{
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: PRIORITY_COLORS[survey.priority] || theme.muted,
                    }}
                  />
                  <Text style={styles.detailValue}>{survey.priority}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.divider} />

          {/* Survey ID */}
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

        {/* ─── Status Section ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="label" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Status</Text>
        </View>

        {isEditing ? (
          // Edit mode: big pill selector
          <View style={[styles.detailCard, { padding: 16 }]}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Select Status</Text>
            <View style={styles.statusPillsRow}>
              {STATUS_OPTIONS.map((opt) => {
                const selected = status === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setStatus(opt.key)}
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: selected ? opt.color : `${theme.muted}15`,
                        borderColor:     selected ? opt.color : `${theme.muted}30`,
                      },
                    ]}
                  >
                    <MaterialIcons name={opt.icon} size={16} color={selected ? '#FFFFFF' : theme.muted} />
                    <Text style={[styles.statusPillText, { color: selected ? '#FFFFFF' : theme.muted }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          // View mode: big coloured status card with timestamp
          <View style={[styles.statusCard, { backgroundColor: currentStatus.color }]}>
            {/* Left: icon circle */}
            <View style={[styles.statusIconCircle, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <MaterialIcons name={currentStatus.icon} size={28} color="#FFFFFF" />
            </View>

            {/* Middle: status name */}
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={styles.statusValue}>{currentStatus.label}</Text>
            </View>

            {/* Right: time info */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.statusLabel, { textAlign: 'right' }]}>Created</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginTop: 2, textAlign: 'right' }}>
                {formatDateTime(survey.createdAt)}
              </Text>
            </View>
          </View>
        )}

        {/* ─── Photo ─── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="photo-camera" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Photo</Text>
        </View>

        <View style={styles.photoContainer}>
          {survey.photos && survey.photos.length > 0 ? (
            <>
              <Image source={{ uri: survey.photos[0] }} style={styles.photoImage} resizeMode="cover" />
              {survey.photos.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 10 }}>
                  {survey.photos.map((uri, idx) => (
                    <Image
                      key={idx}
                      source={{ uri }}
                      style={{ width: 64, height: 64, borderRadius: 10, marginRight: 8 }}
                    />
                  ))}
                </ScrollView>
              )}
            </>
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
              <Text style={[styles.detailValue, { color: theme.muted }]}>No contact linked</Text>
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
              <Text style={[styles.detailValue, { color: theme.muted }]}>No location attached</Text>
            </View>
          )}
        </View>

        {/* ─── Voice Note ─── */}
        {survey.voiceUri && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="mic" size={18} color={theme.accent} />
              <Text style={styles.sectionTitle}>Voice Note</Text>
            </View>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Pressable
                  onPress={handlePlayVoice}
                  style={[styles.detailIconBox, { backgroundColor: isPlayingVoice ? '#EF444415' : `${theme.accent}15` }]}
                >
                  <MaterialIcons name={isPlayingVoice ? 'stop' : 'play-arrow'} size={24} color={isPlayingVoice ? '#EF4444' : theme.accent} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Audio Remarks</Text>
                  <Text style={styles.detailValue}>
                    {isPlayingVoice ? 'Playing back voice note...' : 'Voice note attached'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

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

        {/* ─── Edit / Save / Cancel Buttons ─── */}
        <View style={styles.buttonRow}>
          {isEditing ? (
            <>
              <Pressable style={styles.cancelBtn} onPress={() => { setIsEditing(false); setStatus(survey.status || 'draft'); }}>
                <MaterialIcons name="close" size={20} color={theme.muted} />
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <MaterialIcons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={[styles.saveBtn, { flex: 1 }]} onPress={() => setIsEditing(true)}>
              <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Edit Survey</Text>
            </Pressable>
          )}
        </View>

        {/* ─── Delete Button ─── */}
        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <MaterialIcons name="delete-forever" size={20} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Delete Survey</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
