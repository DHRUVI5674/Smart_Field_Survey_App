import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSurveys } from '../../../context/surveyContext';
import { useAppTheme } from '../../../context/ThemeContext';

const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

const PRIORITY_COLORS = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { surveys, deleteSurvey } = useSurveys();
  const { theme, mode, toggleTheme } = useAppTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Filter and search logic
  const filteredSurveys = surveys.filter((survey) => {
    const matchesPriority =
      activeFilter === 'All' || survey.priority === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      survey.siteName?.toLowerCase().includes(query) ||
      survey.clientName?.toLowerCase().includes(query) ||
      survey.id?.toLowerCase().includes(query);
    return matchesPriority && matchesSearch;
  });

  const handleDelete = (survey) => {
    Alert.alert(
      'Delete Survey',
      `Are you sure you want to delete the survey for "${survey.siteName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSurvey(survey.id),
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
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

    // Search bar
    searchWrapper: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      marginLeft: 10,
    },
    clearBtn: { padding: 4 },

    // Filter pills
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 10,
    },
    filterPill: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
    },
    filterPillActive: {
      backgroundColor: theme.accent,
    },
    filterText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.muted,
    },
    filterTextActive: {
      color: '#FFFFFF',
    },

    // Count badge
    countBadge: {
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    countText: {
      fontSize: 13,
      color: theme.muted,
      fontWeight: '600',
    },

    // Survey card
    card: {
      marginHorizontal: 20,
      marginBottom: 14,
      backgroundColor: theme.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    cardTop: {
      flexDirection: 'row',
      padding: 16,
    },
    cardIconBox: {
      width: 50,
      height: 50,
      borderRadius: 14,
      backgroundColor: `${theme.accent}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    cardInfo: { flex: 1 },
    cardSiteName: { fontSize: 16, fontWeight: '700', color: theme.text },
    cardClient: { fontSize: 13, color: theme.muted, marginTop: 3 },
    cardPhotoThumb: {
      width: 50,
      height: 50,
      borderRadius: 10,
      marginLeft: 8,
    },
    cardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 14,
      paddingTop: 4,
    },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: theme.muted },
    priorityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    priorityText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
    cardActions: { flexDirection: 'row', gap: 6 },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${theme.muted}15`,
    },

    // Empty state
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
    emptyIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${theme.accent}12`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    emptyText: {
      fontSize: 14,
      color: theme.muted,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 40,
    },
    emptyBtn: {
      marginTop: 24,
      backgroundColor: theme.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyBtnText: { color: '#FFFFFF', fontWeight: '700' },
  });

  const renderSurveyCard = ({ item }) => {
    const pColor = PRIORITY_COLORS[item.priority] || theme.muted;

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/survey-details',
            params: { surveyId: item.id },
          })
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.cardIconBox}>
            <MaterialIcons name="assignment" size={26} color={theme.accent} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardSiteName} numberOfLines={1}>
              {item.siteName}
            </Text>
            <Text style={styles.cardClient} numberOfLines={1}>
              {item.clientName}
            </Text>
          </View>
          {item.photo && (
            <Image source={{ uri: item.photo }} style={styles.cardPhotoThumb} />
          )}
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="event" size={14} color={theme.muted} />
              <Text style={styles.metaText}>{formatDate(item.date || item.createdAt)}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: pColor }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
            {item.status === 'submitted' && (
              <View style={styles.metaItem}>
                <MaterialIcons name="check-circle" size={14} color="#10B981" />
                <Text style={[styles.metaText, { color: '#10B981' }]}>Submitted</Text>
              </View>
            )}
          </View>
          <View style={styles.cardActions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: '/survey-details',
                  params: { surveyId: item.id },
                })
              }
            >
              <MaterialIcons name="visibility" size={18} color={theme.accent} />
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: '#EF444418' }]}
              onPress={() => handleDelete(item)}
            >
              <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialIcons name="inbox" size={48} color={theme.accent} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery || activeFilter !== 'All'
          ? 'No Matches Found'
          : 'No Surveys Yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery || activeFilter !== 'All'
          ? 'Try adjusting your search or filter to find surveys.'
          : 'Create your first field survey to see it appear here.'}
      </Text>
      {!searchQuery && activeFilter === 'All' && (
        <Pressable
          style={styles.emptyBtn}
          onPress={() => router.push('/(drawer)/(tabs)/new-survey')}
        >
          <Text style={styles.emptyBtnText}>Create Survey</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={openDrawer}>
          <MaterialIcons name="menu" size={26} color={theme.accentDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Survey History</Text>
        <Pressable onPress={toggleTheme}>
          <MaterialIcons
            name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
            size={24}
            color={theme.accentDark}
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color={theme.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by site, client, or ID..."
            placeholderTextColor={theme.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              style={styles.clearBtn}
              onPress={() => setSearchQuery('')}
            >
              <MaterialIcons name="close" size={20} color={theme.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Priority Filter Pills */}
      <View style={styles.filterRow}>
        {PRIORITIES.map((p) => (
          <Pressable
            key={p}
            style={[
              styles.filterPill,
              activeFilter === p && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(p)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === p && styles.filterTextActive,
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Result Count */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {filteredSurveys.length}{' '}
          {filteredSurveys.length === 1 ? 'survey' : 'surveys'} found
        </Text>
      </View>

      {/* Survey List */}
      <FlatList
        data={filteredSurveys}
        keyExtractor={(item) => item.id}
        renderItem={renderSurveyCard}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
