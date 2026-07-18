import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSurveys } from '../../../context/surveyContext';
import StatCard from '../../../components/ui/StatCard';
import ActionCard from '../../../components/ui/ActionCard';
import ListCard from '../../../components/ui/ListCard';
import { useAppTheme } from '../../../context/ThemeContext';

const avatarImg = require('../../../assets/images/avatar.png');

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation();

  const { surveys, activePhotos, activeLocation, activeContact } = useSurveys();
  const { theme, mode, toggleTheme } = useAppTheme();

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const today = new Date().toDateString();
  const todaySurveys = surveys.filter((survey) => new Date(survey.createdAt).toDateString() === today);

  const hasPhotos = activePhotos && activePhotos.length > 0;
  const hasLocation = !!activeLocation;
  const hasContact = !!activeContact;
  const draftInProgress = hasPhotos || hasLocation || hasContact;

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 30 },
    header: { height: 75, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    menuButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    menuIcon: { fontSize: 26, color: theme.accentDark },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text, textAlign: 'center' },
    headerSubtitle: { fontSize: 11, color: theme.muted, textAlign: 'center', marginTop: 2 },
    notificationButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    notificationIcon: { fontSize: 20, color: theme.accentDark },

    welcomeSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
    welcomeText: { fontSize: 24, fontWeight: '700', color: theme.text },
    welcomeSubText: { fontSize: 14, color: theme.muted, marginTop: 5 },

    studentCard: { marginHorizontal: 20, padding: 18, backgroundColor: theme.surface, borderRadius: 16, flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: theme.cardShadow, shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
    studentAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: 56, height: 56, borderRadius: 28 },
    avatarText: { fontSize: 20, fontWeight: '700', color: theme.surface },
    studentInfo: { flex: 1, marginLeft: 14 },
    studentName: { fontSize: 17, fontWeight: '700', color: theme.text },
    studentDetails: { fontSize: 13, color: theme.muted, marginTop: 3 },
    viewProfile: { color: theme.accentDark, fontWeight: '700' },

    sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 15,
    },
    gridCard: {
      width: '48%',
      height: 155,
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: 14,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: mode === 'light' ? '#EBF3FC' : '#1e293b',
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      marginBottom: 16,
    },
    actionIconBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginTop: 8,
    },
    actionDescription: {
      fontSize: 12,
      color: theme.muted,
      marginTop: 3,
      lineHeight: 16,
    },
    actionSubtitle: {
      fontSize: 11,
      color: theme.muted,
      marginTop: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
    },

    recentHeader: { paddingHorizontal: 20, marginTop: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAll: { color: theme.accent, fontWeight: '700' },

    emptyCard: { marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 16, padding: 22, alignItems: 'center' },
    emptyIcon: { fontSize: 44, color: theme.muted },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginTop: 10 },
    emptyText: { textAlign: 'center', color: theme.muted, marginTop: 8 },
    createButton: { backgroundColor: theme.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 18 },
    createButtonText: { color: theme.surface, fontWeight: '700' },

    // Persistent create survey banner
    createSurveyBanner: {
      marginHorizontal: 20,
      marginTop: 18,
      marginBottom: 4,
      backgroundColor: theme.accent,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 6,
      shadowColor: theme.accent,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    createSurveyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    createSurveyBannerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    createSurveyBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    createSurveyArrow: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 6 },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <MaterialIcons name="menu" size={26} color={theme.accentDark} />
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Smart Field Survey</Text>
          </View>

          <Pressable style={styles.notificationButton} onPress={toggleTheme}>
            <MaterialIcons
              name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
              size={24}
              color={theme.accentDark}
            />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, Dhruvi 👋</Text>
            <Text style={styles.welcomeSubText}>Manage your field inspections easily</Text>
          </View>

          <View style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              <Image source={avatarImg} style={styles.avatarImage} />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>Dhruvi Patel</Text>
              <Text style={styles.studentDetails}>Computer Engineering</Text>
              <Text style={styles.studentDetails}>Semester 1</Text>
            </View>
            <Pressable onPress={() => router.push('/(drawer)/(tabs)/profile')}>
              <Text style={styles.viewProfile}>View</Text>
            </Pressable>
          </View>

          <StatCard label={"Today's Surveys"} value={todaySurveys.length} icon={'bar-chart'} description={'Surveys completed today'} />

          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionsContainer}>
            {/* New Survey Card */}
            <Pressable
              style={styles.gridCard}
              onPress={() => router.push('/(drawer)/(tabs)/new-survey')}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={[styles.actionIconBox, { backgroundColor: '#3B82F615' }]}>
                  <MaterialIcons name="assignment" size={20} color="#3B82F6" />
                </View>
                {draftInProgress && <View style={styles.statusDot} />}
              </View>
              <View>
                <Text style={styles.actionTitle} numberOfLines={1}>New Survey</Text>
                <Text style={styles.actionDescription} numberOfLines={2}>Log inspection details & select priority</Text>
                <Text style={[styles.actionSubtitle, draftInProgress && { color: '#3B82F6', fontWeight: '600' }]} numberOfLines={1}>
                  {draftInProgress ? 'Draft Active' : 'Ready'}
                </Text>
              </View>
            </Pressable>

            {/* Camera Card */}
            <Pressable
              style={styles.gridCard}
              onPress={() => router.push('../camera')}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={[styles.actionIconBox, { backgroundColor: '#8B5CF615' }]}>
                  <MaterialIcons name="photo-camera" size={20} color="#8B5CF6" />
                </View>
                {hasPhotos && <View style={styles.statusDot} />}
              </View>
              <View>
                <Text style={styles.actionTitle} numberOfLines={1}>Camera</Text>
                <Text style={styles.actionDescription} numberOfLines={2}>Capture photos and link to current draft</Text>
                <Text style={[styles.actionSubtitle, hasPhotos && { color: '#8B5CF6', fontWeight: '600' }]} numberOfLines={1}>
                  {hasPhotos ? `${activePhotos.length} Photo${activePhotos.length > 1 ? 's' : ''}` : 'Ready'}
                </Text>
              </View>
            </Pressable>

            {/* Location Card */}
            <Pressable
              style={styles.gridCard}
              onPress={() => router.push('../location')}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={[styles.actionIconBox, { backgroundColor: '#10B98115' }]}>
                  <MaterialIcons name="my-location" size={20} color="#10B981" />
                </View>
                {hasLocation && <View style={styles.statusDot} />}
              </View>
              <View>
                <Text style={styles.actionTitle} numberOfLines={1}>Location</Text>
                <Text style={styles.actionDescription} numberOfLines={2}>Fetch current GPS coordinates & accuracy</Text>
                <Text style={[styles.actionSubtitle, hasLocation && { color: '#10B981', fontWeight: '600' }]} numberOfLines={1}>
                  {hasLocation ? `${activeLocation.coords.latitude.toFixed(3)}, ${activeLocation.coords.longitude.toFixed(3)}` : 'Ready'}
                </Text>
              </View>
            </Pressable>

            {/* Contacts Card */}
            <Pressable
              style={styles.gridCard}
              onPress={() => router.push('../contacts')}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={[styles.actionIconBox, { backgroundColor: '#F59E0B15' }]}>
                  <MaterialIcons name="contacts" size={20} color="#F59E0B" />
                </View>
                {hasContact && <View style={styles.statusDot} />}
              </View>
              <View>
                <Text style={styles.actionTitle} numberOfLines={1}>Contacts</Text>
                <Text style={styles.actionDescription} numberOfLines={2}>Import client contact from address book</Text>
                <Text style={[styles.actionSubtitle, hasContact && { color: '#F59E0B', fontWeight: '600' }]} numberOfLines={1}>
                  {hasContact ? activeContact.name : 'Ready'}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* ── Always-visible Create Survey button ── */}
          <Pressable
            style={styles.createSurveyBanner}
            onPress={() => router.push('/(drawer)/(tabs)/new-survey')}
          >
            <View style={styles.createSurveyBannerLeft}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}>
                <MaterialIcons name="add-circle" size={28} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.createSurveyBannerTitle}>Create New Survey</Text>
                <Text style={styles.createSurveyBannerSub}>Tap to start a field inspection</Text>
              </View>
            </View>
            <View style={styles.createSurveyArrow}>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Surveys</Text>
            <Pressable onPress={() => router.push('/(drawer)/(tabs)/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          {surveys.length === 0 && (
            <View style={styles.emptyCard}>
              <MaterialIcons name="assignment-late" size={44} color={theme.muted} />
              <Text style={styles.emptyTitle}>No Surveys Yet</Text>
              <Text style={styles.emptyText}>Create your first field survey to see it here.</Text>
              <Pressable style={styles.createButton} onPress={() => router.push('/(drawer)/(tabs)/new-survey')}>
                <Text style={styles.createButtonText}>Create Survey</Text>
              </Pressable>
            </View>
          )}

          {surveys.slice(0, 5).map((survey) => (
            <ListCard key={survey.id} survey={survey} onPress={() => router.push({ pathname: '/survey-details', params: { surveyId: survey.id } })} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
