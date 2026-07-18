import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppTheme } from '../../context/ThemeContext';

export default function CameraScreen() {
  const { theme, spacing } = useAppTheme();
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
    camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    controls: { padding: spacing.md, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    btn: { padding: 12, borderRadius: 10, backgroundColor: theme.surface },
    btnText: { color: theme.text, fontWeight: '700' },
    preview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface },
    previewImage: { width: '92%', height: '70%', borderRadius: 12 },
    meta: { marginTop: 12, color: theme.muted },
    center: { justifyContent: 'center', alignItems: 'center' },
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
      { text: 'Delete', style: 'destructive', onPress: () => { setPhoto(null); setPhotoTime(null); } },
    ]);
  };

  const toggleFacing = () => {
    setIsCameraReady(false);
    setCameraError(null);
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  if (isPermissionLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.center, { flex: 1 }]}> 
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={{ color: theme.muted, marginTop: 12 }}>Checking camera permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPermissionGranted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.center, { flex: 1, padding: spacing.md }]}> 
          <Text style={{ color: theme.text, marginBottom: 12 }}>Camera permission is required.</Text>
          <Pressable style={styles.btn} onPress={handleRequestPermission}>
            <Text style={styles.btnText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {photo ? (
          <View style={styles.preview}>
            <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />
            <Text style={styles.meta}>Taken: {photoTime ? new Date(photoTime).toLocaleString() : ''}</Text>

            <View style={styles.controls}>
              <Pressable style={styles.btn} onPress={handleRetake}>
                <Text style={styles.btnText}>Retake</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={handleDelete}>
                <Text style={[styles.btnText, { color: '#e11d48' }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              onCameraReady={onCameraReady}
              onMountError={onMountError}
            />

            {isOpening && (
              <View style={[styles.center, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}> 
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={{ color: theme.muted, marginTop: 12 }}>Opening camera...</Text>
              </View>
            )}

            <View style={styles.controls}>
              <Pressable style={styles.btn} onPress={toggleFacing}>
                <Text style={styles.btnText}>Flip</Text>
              </Pressable>

              <Pressable
                style={[styles.btn, { backgroundColor: isCameraReady ? theme.accent : theme.muted }]}
                onPress={takePicture}
                disabled={!isCameraReady}
              >
                <Text style={[styles.btnText, { color: theme.surface }]}>Capture</Text>
              </Pressable>

              <Pressable style={styles.btn} onPress={() => { setPhoto(null); setPhotoTime(null); }}>
                <Text style={styles.btnText}>Clear</Text>
              </Pressable>
            </View>
            {cameraError ? (
              <Text style={[styles.meta, { textAlign: 'center', color: '#ef4444' }]}>{cameraError}</Text>
            ) : null}
            {!isCameraReady && (
              <Text style={[styles.meta, { textAlign: 'center' }]}>Preparing camera, please wait…</Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
