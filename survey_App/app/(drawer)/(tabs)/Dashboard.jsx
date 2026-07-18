import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useSurveys } from '../../../context/surveyContext';
import StatCard from '../../../components/ui/StatCard';
import ActionCard from '../../../components/ui/ActionCard';
import ListCard from '../../../components/ui/ListCard';
import { useAppTheme } from '../../../context/ThemeContext';

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation();

  const { surveys } = useSurveys();
  const { theme, spacing, mode, toggleTheme } = useAppTheme();

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const today = new Date().toDateString();
  const todaySurveys = surveys.filter((survey) => new Date(survey.createdAt).toDateString() === today);

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: 'transparent' },
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
    avatarText: { fontSize: 20, fontWeight: '700', color: theme.surface },
    studentInfo: { flex: 1, marginLeft: 14 },
    studentName: { fontSize: 17, fontWeight: '700', color: theme.text },
    studentDetails: { fontSize: 13, color: theme.muted, marginTop: 3 },
    viewProfile: { color: theme.accentDark, fontWeight: '700' },

    sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 15 },

    recentHeader: { paddingHorizontal: 20, marginTop: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAll: { color: theme.accent, fontWeight: '700' },

    emptyCard: { marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 16, padding: 22, alignItems: 'center' },
    emptyIcon: { fontSize: 44, color: theme.muted },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginTop: 10 },
    emptyText: { textAlign: 'center', color: theme.muted, marginTop: 8 },
    createButton: { backgroundColor: theme.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 18 },
    createButtonText: { color: theme.surface, fontWeight: '700' },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Smart Field Survey</Text>
          </View>

          <Pressable style={styles.notificationButton} onPress={toggleTheme}>
            <Text style={styles.notificationIcon}>{mode === 'light' ? '🌙' : '☀️'}</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, Dhruvi 👋</Text>
            <Text style={styles.welcomeSubText}>Manage your field inspections easily</Text>
          </View>

          <View style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              <Text style={styles.avatarText}>D</Text>
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

          <StatCard label={"Today's Surveys"} value={todaySurveys.length} icon={'📊'} description={'Surveys completed today'} />

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <ActionCard title="New Survey" subtitle="Create inspection" icon={'📝'} onPress={() => router.push('/(drawer)/(tabs)/new-survey')} />
            <ActionCard title="Camera" subtitle="Capture photo" icon={'📷'} onPress={() => router.push('../camera')} />
            <ActionCard title="Location" subtitle="Get coordinates" icon={'📍'} onPress={() => router.push('../location')} />
            <ActionCard title="Contacts" subtitle="Select client" icon={'👥'} onPress={() => router.push('../contacts')} />
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Surveys</Text>
            <Pressable onPress={() => router.push('/(drawer)/(tabs)/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          {surveys.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Surveys Yet</Text>
              <Text style={styles.emptyText}>Create your first field survey to see it here.</Text>
              <Pressable style={styles.createButton} onPress={() => router.push('/(drawer)/(tabs)/new-survey')}>
                <Text style={styles.createButtonText}>Create Survey</Text>
              </Pressable>
            </View>
          )}

          {surveys.slice(0, 5).map((survey) => (
            <ListCard key={survey.id} survey={survey} onPress={() => router.push('/survey-details')} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
