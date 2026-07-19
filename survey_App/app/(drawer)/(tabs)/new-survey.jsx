import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSurveys } from '../../../context/surveyContext';
import { hapticSubmit, hapticButtonPress } from '../../../utils/haptics';
import { useAppTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import ConfettiOverlay from '../../../components/ui/ConfettiOverlay';
import { Audio } from 'expo-av';

// ─── Auto-priority keyword logic ─────────────────────────────────────────────
const HIGH_KEYWORDS = ["urgent", "critical", "leak", "broken", "emergency", "danger", "severe", "immediate"];
const LOW_KEYWORDS = ["minor", "routine", "check", "inspection", "review", "normal"];

function suggestPriority(text) {
  const lower = (text || "").toLowerCase();
  if (HIGH_KEYWORDS.some(k => lower.includes(k))) return "High";
  if (LOW_KEYWORDS.some(k => lower.includes(k))) return "Low";
  return null;
}

const PRIORITY_COLORS = { Low: "#10B981", Medium: "#F59E0B", High: "#EF4444" };

export default function NewSurvey() {
  const router = useRouter();
  const {
    addSurvey,
    activePhotos,
    activeLocation,
    activeContact,
    resetActiveMedia,
  } = useSurveys();
  const { theme } = useAppTheme();
  const { showToast } = useToast();

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Smart suggestions
  const [prioritySuggestion, setPrioritySuggestion] = useState(null);
  const suggestionAnim = useRef(new Animated.Value(0)).current;

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Audio Recording (expo-av)
  const [recording, setRecording] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  // Load draft on mount
  useEffect(() => {
    (async () => {
      try {
        const draft = await AsyncStorage.getItem('@survey_draft');
        if (draft) {
          const data = JSON.parse(draft);
          setSiteName(data.siteName ?? '');
          setClientName(data.clientName ?? '');
          setDescription(data.description ?? '');
          setPriority(data.priority ?? 'Medium');
          setDate(data.date ?? new Date().toISOString().slice(0, 10));
          setNotes(data.notes ?? '');
          setVoiceUri(data.voiceUri ?? null);
          showToast("Draft restored", { type: "info" });
        }
      } catch (e) {
        console.warn('Failed to load draft', e);
      }
    })();
  }, []);

  // Auto-save draft on change
  useEffect(() => {
    const saveDraft = async () => {
      try {
        const payload = { siteName, clientName, description, priority, date, notes, voiceUri };
        await AsyncStorage.setItem('@survey_draft', JSON.stringify(payload));
      } catch (e) {
        console.warn('Failed to save draft', e);
      }
    };
    saveDraft();
  }, [siteName, clientName, description, priority, date, notes, voiceUri]);

  // Auto-priority suggestion when description changes
  useEffect(() => {
    const suggestion = suggestPriority(description);
    if (suggestion && suggestion !== priority) {
      setPrioritySuggestion(suggestion);
      Animated.spring(suggestionAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
    } else {
      Animated.timing(suggestionAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setPrioritySuggestion(null));
    }
  }, [description]);

  // Real-time inline validation
  const validateField = (field, value) => {
    let err = "";
    if (field === 'siteName' && !value.trim()) {
      err = "Site Name is required";
    }
    if (field === 'clientName' && !value.trim()) {
      err = "Client Name is required";
    }
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'siteName') validateField('siteName', siteName);
    if (field === 'clientName') validateField('clientName', clientName);
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      await hapticButtonPress();
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        showToast("Audio permission denied", { type: "error" });
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      showToast("Recording voice remarks...", { type: "info" });
    } catch (e) {
      console.error(e);
      showToast("Failed to start recording", { type: "error" });
    }
  };

  const stopRecording = async () => {
    try {
      await hapticButtonPress();
      if (!recording) return;
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setVoiceUri(uri);
      setRecording(null);
      showToast("Voice note attached!", { type: "success" });
    } catch (e) {
      console.error(e);
      showToast("Failed to stop recording", { type: "error" });
    }
  };

  const playVoiceNote = async () => {
    try {
      await hapticButtonPress();
      if (!voiceUri) return;
      if (isPlaying) {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setIsPlaying(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.error(e);
      showToast("Playback error", { type: "error" });
    }
  };

  const deleteVoiceNote = async () => {
    await hapticButtonPress();
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }
    setVoiceUri(null);
    setIsPlaying(false);
    showToast("Voice note removed", { type: "info" });
  };

  async function handleSubmit() {
    setTouched({ siteName: true, clientName: true });
    validateField('siteName', siteName);
    validateField('clientName', clientName);

    if (!siteName.trim() || !clientName.trim()) {
      showToast("Please fill in required fields", { type: "warning" });
      return;
    }

    await hapticButtonPress();
    setSubmitting(true);
    try {
      await addSurvey({
        siteName,
        clientName,
        description,
        priority,
        date,
        notes,
        photos: activePhotos,
        location: activeLocation || null,
        contact: activeContact || null,
        voiceUri: voiceUri || null,
      });
      await hapticSubmit();
      setShowConfetti(true);
      // Confetti callback will redirect
      setSiteName('');
      setClientName('');
      setDescription('');
      setPriority('Medium');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setVoiceUri(null);
      setErrors({});
      setTouched({});
      await AsyncStorage.removeItem('@survey_draft');
      resetActiveMedia();
      showToast("Survey created successfully! 🎉", { type: "success" });
    } catch (_err) {
      showToast("Unable to create survey", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const suggestionColor = prioritySuggestion ? PRIORITY_COLORS[prioritySuggestion] : theme.accent;

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
      marginBottom: 4,
      fontSize: 15,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    inputError: { borderColor: '#EF4444' },
    inputOk: { borderColor: '#10B981' },
    errorText: { color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 },
    textarea: { minHeight: 90, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    priorityButton: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    priorityText: { fontWeight: '700', fontSize: 14 },

    // Smart suggestion banner
    suggestionBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      padding: 10,
      marginBottom: 14,
      gap: 8,
    },
    suggestionText: { fontSize: 13, fontWeight: '600', flex: 1 },

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
    linkedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
    },
    linkedText: { fontSize: 12, fontWeight: '600', color: '#10B981' },

    // Voice card specific action buttons
    voiceActions: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: 'auto',
    },
    voiceRoundBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfettiOverlay visible={showConfetti} onDone={() => { setShowConfetti(false); router.push("/(drawer)/(tabs)/"); }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create New Survey</Text>

        {/* Site Name */}
        <Text style={styles.label}>Site Name *</Text>
        <TextInput
          value={siteName}
          onChangeText={(v) => { setSiteName(v); validateField('siteName', v); }}
          onBlur={() => handleBlur('siteName')}
          placeholder="Enter site name"
          placeholderTextColor={theme.muted}
          style={[
            styles.input,
            touched.siteName && (errors.siteName ? styles.inputError : styles.inputOk)
          ]}
        />
        {touched.siteName && errors.siteName ? <Text style={styles.errorText}>⚠ {errors.siteName}</Text> : null}

        {/* Client Name */}
        <Text style={styles.label}>Client Name *</Text>
        <TextInput
          value={clientName}
          onChangeText={(v) => { setClientName(v); validateField('clientName', v); }}
          onBlur={() => handleBlur('clientName')}
          placeholder="Enter client name"
          placeholderTextColor={theme.muted}
          style={[
            styles.input,
            touched.clientName && (errors.clientName ? styles.inputError : styles.inputOk)
          ]}
        />
        {touched.clientName && errors.clientName ? <Text style={styles.errorText}>⚠ {errors.clientName}</Text> : null}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the site or issues (e.g. Broken water pipe, routine check...)"
          placeholderTextColor={theme.muted}
          style={[styles.input, styles.textarea]}
          multiline
        />

        {/* Smart suggestion */}
        {prioritySuggestion && (
          <Animated.View style={[styles.suggestionBanner, { backgroundColor: `${suggestionColor}15`, opacity: suggestionAnim }]}>
            <MaterialIcons name="auto-awesome" size={18} color={suggestionColor} />
            <Text style={[styles.suggestionText, { color: suggestionColor }]}>
              Suggestion: Set priority to <Text style={{ fontWeight: '800' }}>{prioritySuggestion}</Text>
            </Text>
            <Pressable
              onPress={() => setPriority(prioritySuggestion)}
              style={{ backgroundColor: suggestionColor, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>Apply</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Priority */}
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

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.muted}
          style={styles.input}
        />

        {/* Notes */}
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
              {activePhotos && activePhotos.length > 0 ? (
                <Image
                  source={{ uri: activePhotos[0] }}
                  style={{ width: 42, height: 42, borderRadius: 10 }}
                />
              ) : (
                <MaterialIcons name="photo-camera" size={22} color="#3B82F6" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attachLabel}>Photo</Text>
              <Text style={styles.attachValue}>
                {activePhotos && activePhotos.length > 0
                  ? `${activePhotos.length} photo${activePhotos.length > 1 ? 's' : ''} captured`
                  : 'No photo'}
              </Text>
            </View>
            {activePhotos && activePhotos.length > 0 ? (
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
                {activeContact ? activeContact.name : 'No contact'}
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

          {/* Voice Notes */}
          <View style={styles.attachCard}>
            <View style={[styles.attachIconBox, { backgroundColor: '#EC489918' }]}>
              <MaterialIcons name={isRecording ? "fiber-manual-record" : "mic"} size={22} color={isRecording ? "#EF4444" : "#EC4899"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attachLabel}>Voice Note Remarks</Text>
              <Text style={styles.attachValue}>
                {isRecording ? "Recording..." : (voiceUri ? "Voice Note Attached" : "No voice note")}
              </Text>
            </View>
            {isRecording ? (
              <Pressable style={[styles.attachAction, { backgroundColor: '#EF444418' }]} onPress={stopRecording}>
                <Text style={[styles.attachActionText, { color: '#EF4444' }]}>Stop</Text>
              </Pressable>
            ) : (
              voiceUri ? (
                <View style={styles.voiceActions}>
                  <Pressable
                    style={[styles.voiceRoundBtn, { backgroundColor: `${theme.accent}15` }]}
                    onPress={playVoiceNote}
                  >
                    <MaterialIcons name={isPlaying ? "stop" : "play-arrow"} size={20} color={theme.accent} />
                  </Pressable>
                  <Pressable
                    style={[styles.voiceRoundBtn, { backgroundColor: '#EF444415' }]}
                    onPress={deleteVoiceNote}
                  >
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.attachAction} onPress={startRecording}>
                  <Text style={styles.attachActionText}>Record</Text>
                </Pressable>
              )
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
