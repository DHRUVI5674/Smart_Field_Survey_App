import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Animated, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSurveys } from '../../../context/surveyContext';
import StatCard from '../../../components/ui/StatCard';
import ListCard from '../../../components/ui/ListCard';
import { useAppTheme } from '../../../context/ThemeContext';
import { getAchievements, getStreak, getWeeklyCount } from '../../../utils/achievements';

const avatarImg = require('../../../assets/images/avatar.png');
const WEEKLY_GOAL = 5;

// Custom Progress Circle using absolute borders for reliable rendering
function CircularProgress({ progress, value, label, color = "#3B82F6", size = 80, strokeWidth = 6 }) {
  const rotation = new Animated.Value(0);
  
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: progress,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: `${color}20`,
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          position: 'absolute',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: color }}>{value}</Text>
        <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 1, textTransform: 'uppercase', fontWeight: '600' }}>{label}</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation();

  const { surveys, activePhotos, activeLocation, activeContact } = useSurveys();
  const { theme, mode, toggleTheme } = useAppTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const today = new Date().toDateString();
  const todaySurveys = surveys.filter((survey) => new Date(survey.createdAt).toDateString() === today);

  const hasPhotos = activePhotos && activePhotos.length > 0;
  const hasLocation = !!activeLocation;
  const hasContact = !!activeContact;
  const draftInProgress = hasPhotos || hasLocation || hasContact;

  // Derive achievements statistics
  const streak = getStreak(surveys);
  const weeklyCount = getWeeklyCount(surveys);
  const achievements = getAchievements(surveys).filter(a => a.earned);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  // Load recently viewed surveys on dashboard focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('@recently_viewed');
          if (stored && active) {
            setRecentlyViewed(JSON.parse(stored));
          }
        } catch (e) {
          console.warn('Failed to load recently viewed list', e);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  // Map recently viewed IDs back to survey records
  const recentSurveysWithData = recentlyViewed
    .map(id => surveys.find(s => s.id === id))
    .filter(Boolean)
    .slice(0, 3);

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 30 },
    header: { height: 75, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    menuButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text, textAlign: 'center' },
    headerSubtitle: { fontSize: 11, color: theme.muted, textAlign: 'center', marginTop: 2 },
    notificationButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },

    welcomeSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
    welcomeText: { fontSize: 24, fontWeight: '700', color: theme.text },
    welcomeSubText: { fontSize: 14, color: theme.muted, marginTop: 5 },

    // Streak tracker banner
    streakBanner: {
      marginHorizontal: 20,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B15',
      borderRadius: 14,
      padding: 14,
      gap: 12,
      borderWidth: 1.5,
      borderColor: '#F59E0B30',
    },
    streakText: { fontSize: 15, fontWeight: '700', color: '#F59E0B' },
    streakSub: { fontSize: 12, color: '#F59E0B99', marginTop: 2 },

    // Weekly progress card
    weeklyCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    weeklyInfo: { flex: 1 },
    weeklyTitle: { fontSize: 15, fontWeight: '700', color: theme.text },
    weeklySubtitle: { fontSize: 13, color: theme.muted, marginTop: 4 },
    weeklyGoalText: { fontSize: 12, color: theme.accent, fontWeight: '600', marginTop: 6 },

    studentCard: { marginHorizontal: 20, marginTop: 16, padding: 18, backgroundColor: theme.surface, borderRadius: 16, flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: theme.cardShadow, shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
    studentAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: 56, height: 56, borderRadius: 28 },
    studentInfo: { flex: 1, marginLeft: 14 },
    studentName: { fontSize: 17, fontWeight: '700', color: theme.text },
    studentDetails: { fontSize: 13, color: theme.muted, marginTop: 3 },
    viewProfile: { color: theme.accentDark, fontWeight: '700' },

    sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    sectionRow: { paddingHorizontal: 20, marginTop: 22, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAll: { color: theme.accent, fontWeight: '700' },

    // Achievements row
    achievementsScroll: { paddingLeft: 20, paddingBottom: 6 },
    badgeChip: {
      alignItems: 'center',
      marginRight: 14,
      minWidth: 76,
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 12,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    badgeEmoji: { fontSize: 28, marginBottom: 4 },
    badgeTitle: { fontSize: 11, fontWeight: '700', color: theme.text, textAlign: 'center' },

    // Recently Viewed row
    recentViewedScroll: { paddingLeft: 20, gap: 10 },
    recentChip: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      minWidth: 120,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    recentChipTitle: { fontSize: 13, fontWeight: '700', color: theme.text },
    recentChipSub: { fontSize: 11, color: theme.muted, marginTop: 3 },

    // Quick Actions
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
    actionTitle: { fontSize: 14, fontWeight: '700', color: theme.text, marginTop: 8 },
    actionDescription: { fontSize: 12, color: theme.muted, marginTop: 3, lineHeight: 16 },
    actionSubtitle: { fontSize: 11, color: theme.muted, marginTop: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },

    emptyCard: { marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 16, padding: 22, alignItems: 'center' },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginTop: 10 },
    emptyText: { textAlign: 'center', color: theme.muted, marginTop: 8 },
    createButton: { backgroundColor: theme.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 18 },
    createButtonText: { color: theme.surface, fontWeight: '700' },

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, Dhruvi 👋</Text>
            <Text style={styles.welcomeSubText}>Manage your field inspections easily</Text>
          </View>

          {/* Streak Banner */}
          {streak > 0 && (
            <View style={styles.streakBanner}>
              <Text style={{ fontSize: 26 }}>🔥</Text>
              <View>
                <Text style={styles.streakText}>{streak}-Day Active Streak!</Text>
                <Text style={styles.streakSub}>Keep it up — you're doing great!</Text>
              </View>
            </View>
          )}

          {/* Weekly Progress Card */}
          <View style={styles.weeklyCard}>
            <CircularProgress
              progress={Math.min(weeklyCount / WEEKLY_GOAL, 1)}
              value={`${weeklyCount}/${WEEKLY_GOAL}`}
              label="Goal"
              color={theme.accent}
            />
            <View style={styles.weeklyInfo}>
              <Text style={styles.weeklyTitle}>Weekly Progress</Text>
              <Text style={styles.weeklySubtitle}>{weeklyCount} of {WEEKLY_GOAL} surveys completed this week</Text>
              <Text style={styles.weeklyGoalText}>
                {weeklyCount >= WEEKLY_GOAL ? "🏆 Weekly Goal Achieved!" : `${WEEKLY_GOAL - weeklyCount} more to hit your goal`}
              </Text>
            </View>
          </View>

          {/* Student Profile Card */}
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

          {/* Achievements / Badges Section */}
          {achievements.length > 0 && (
            <View>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
                {achievements.map((a) => (
                  <View key={a.id} style={styles.badgeChip}>
                    <Text style={styles.badgeEmoji}>{a.icon}</Text>
                    <Text style={styles.badgeTitle}>{a.title}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recently Viewed Section */}
          {recentSurveysWithData.length > 0 && (
            <View>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentViewedScroll}>
                {recentSurveysWithData.map((s) => (
                  <Pressable
                    key={s.id}
                    style={styles.recentChip}
                    onPress={() => router.push({ pathname: '/survey-details', params: { surveyId: s.id } })}
                  >
                    <Text style={styles.recentChipTitle} numberOfLines={1}>{s.siteName}</Text>
                    <Text style={styles.recentChipSub} numberOfLines={1}>{s.clientName}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

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

          {/* Create Survey Banner */}
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
