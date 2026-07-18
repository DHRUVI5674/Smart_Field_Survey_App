import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppTheme } from '../../context/ThemeContext';
import { useSurveys } from '../../context/surveyContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function CameraScreen() {
  const { theme } = useAppTheme();
  const { setActivePhoto } = useSurveys();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [photoTime, setPhotoTime] = useState(null);
  const [facing, setFacing] = useState('back');
  const [isOpening, setIsOpening] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1 },

    // Header
    header: {
      height: 64,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },

    // Permission & loading screens
    centeredScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      paddingBottom: 60,
    },
    permIcon: { marginBottom: 20 },
    permTitle: { fontSize: 20, fontWeight: '800', color: theme.text, textAlign: 'center' },
    permText: {
      fontSize: 14,
      color: theme.muted,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 22,
    },
    grantBtn: {
      marginTop: 24,
      backgroundColor: theme.accent,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    grantBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

    // Camera view
    camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },

    // Controls bar
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: theme.surface,
    },
    ctrlBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: `${theme.accent}15`,
      alignItems: 'center',
      gap: 4,
    },
    captureBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
    ctrlLabel: { fontSize: 11, color: theme.text, fontWeight: '600' },
    errorText: { textAlign: 'center', color: '#EF4444', fontSize: 13, padding: 8 },
    waitText: { textAlign: 'center', color: theme.muted, fontSize: 13, padding: 8 },

    // Photo preview (inside ScrollView)
    previewScroll: {
      flexGrow: 1,
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    previewTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 14 },
    previewImage: { width: '100%', height: 320, borderRadius: 16 },
    previewMeta: {
      marginTop: 14,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      width: '100%',
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { color: theme.muted, fontSize: 13 },
    linkedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      backgroundColor: '#10B98118',
      padding: 10,
      borderRadius: 10,
    },
    linkedText: { color: '#10B981', fontWeight: '700', fontSize: 13 },
    previewActions: {
      flexDirection: 'row',
      gap: 14,
      marginTop: 24,
      width: '100%',
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    retakeBtn: { backgroundColor: `${theme.accent}18` },
    deleteBtn: { backgroundColor: '#EF444418' },
    retakeBtnText: { color: theme.accent, fontWeight: '700' },
    deleteBtnText: { color: '#EF4444', fontWeight: '700' },
  });

  const isPermissionGranted = permission?.granted;
  const isPermissionLoading = permission === null;

  const handleRequestPermission = async () => {
    setIsOpening(true);
    await requestPermission();
    setIsOpening(false);
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
    setCameraError(null);
    setIsOpening(false);
  };

  const onMountError = ({ nativeEvent }) => {
    const message = nativeEvent?.message || 'Unable to start camera.';
    setCameraError(message);
    setIsOpening(false);
  };

  const takePicture = async () => {
    if (!cameraRef.current?.takePictureAsync || !isCameraReady) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (result?.uri) {
        setPhoto(result.uri);
        setPhotoTime(Date.now());
        setActivePhoto(result.uri);
      }
    } catch (_err) {
      Alert.alert('Error', 'Unable to take photo');
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setPhotoTime(null);
  };

  const handleDelete = () => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { setPhoto(null); setPhotoTime(null); setActivePhoto(null); },
      },
    ]);
  };

  const toggleFacing = () => {
    setIsCameraReady(false);
    setCameraError(null);
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // — Loading permission check —
  if (isPermissionLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.centeredScroll}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.permText, { marginTop: 14 }]}>Checking camera permissions…</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — Permission not granted —
  if (!isPermissionGranted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.centeredScroll}>
          <View style={styles.permIcon}>
            <MaterialIcons name="no-photography" size={72} color={theme.muted} />
          </View>
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permText}>
            Grant camera permission to capture photos for your field surveys. Photos are linked
            directly to the survey you&apos;re creating.
          </Text>
          {isOpening ? (
            <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 24 }} />
          ) : (
            <Pressable style={styles.grantBtn} onPress={handleRequestPermission}>
              <MaterialIcons name="camera-alt" size={20} color="#FFF" />
              <Text style={styles.grantBtnText}>Grant Permission</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — Photo preview —
  if (photo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photo Preview</Text>
        </View>
        <ScrollView contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.previewTitle}>Captured Photo</Text>
          <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewMeta}>
            <View style={styles.metaRow}>
              <MaterialIcons name="access-time" size={16} color={theme.muted} />
              <Text style={styles.metaText}>
                {photoTime ? `Taken: ${new Date(photoTime).toLocaleString()}` : ''}
              </Text>
            </View>
            <View style={styles.linkedBadge}>
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.linkedText}>Photo linked to active survey</Text>
            </View>
          </View>

          <View style={styles.previewActions}>
            <Pressable style={[styles.actionBtn, styles.retakeBtn]} onPress={handleRetake}>
              <MaterialIcons name="replay" size={18} color={theme.accent} />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — Live camera —
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          onCameraReady={onCameraReady}
          onMountError={onMountError}
        />

        {isOpening && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.waitText, { marginTop: 12 }]}>Opening camera…</Text>
          </View>
        )}

        {cameraError ? (
          <Text style={styles.errorText}>{cameraError}</Text>
        ) : !isCameraReady ? (
          <Text style={styles.waitText}>Preparing camera, please wait…</Text>
        ) : null}

        <View style={styles.controls}>
          <Pressable style={styles.ctrlBtn} onPress={toggleFacing}>
            <MaterialIcons name="flip-camera-android" size={22} color={theme.accent} />
            <Text style={styles.ctrlLabel}>Flip</Text>
          </Pressable>

          <Pressable
            style={[styles.captureBtn, !isCameraReady && { opacity: 0.5 }]}
            onPress={takePicture}
            disabled={!isCameraReady}
          >
            <MaterialIcons name="camera-alt" size={32} color="#FFF" />
          </Pressable>

          <Pressable style={styles.ctrlBtn} onPress={() => { setPhoto(null); setPhotoTime(null); }}>
            <MaterialIcons name="clear" size={22} color={theme.accent} />
            <Text style={styles.ctrlLabel}>Clear</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
