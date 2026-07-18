import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '../../context/ThemeContext';

export default function ContactsScreen() {
  const navigation = useNavigation();
  const { theme, spacing, mode, toggleTheme } = useAppTheme();

  const [permissionStatus, setPermissionStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const checkPermission = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        loadContacts();
      }
    } catch (_err) {
      console.error('Error checking contacts permission', _err);
    }
  };

  const askPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        loadContacts();
      } else {
        Alert.alert(
          'Permission Denied',
          'Access to contacts is required to display your client list.'
        );
      }
    } catch (_err) {
      Alert.alert('Error', 'An error occurred while requesting permission.');
    }
  };

  const loadContacts = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      if (data && data.length > 0) {
        // Sort contacts alphabetically
        const sortedData = data.sort((a, b) => {
          const nameA = a.name ? a.name.toLowerCase() : '';
          const nameB = b.name ? b.name.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });
        setContacts(sortedData);
        setFilteredContacts(sortedData);
      } else {
        setContacts([]);
        setFilteredContacts([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Contacts Error', 'Could not retrieve device contacts list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter contacts based on search query in real-time
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const query = text.toLowerCase();
    const filtered = contacts.filter((contact) => {
      const nameMatch = contact.name && contact.name.toLowerCase().includes(query);
      
      // Check phone numbers
      const numberMatch = contact.phoneNumbers && contact.phoneNumbers.some(
        (num) => num.number && num.number.replace(/\s+/g, '').includes(query)
      );

      return nameMatch || numberMatch;
    });
    
    setFilteredContacts(filtered);
  };

  // Copy contact number to Clipboard
  const copyContactNumber = async (contact) => {
    const numbers = contact.phoneNumbers;
    if (!numbers || numbers.length === 0 || !numbers[0].number) {
      Alert.alert('No Phone Number', `${contact.name} has no available phone numbers.`);
      return;
    }
    
    const phone = numbers[0].number;
    await Clipboard.setStringAsync(phone);
    setToastMessage(`Copied: ${phone} (${contact.name})`);
    setShowToast(true);
  };

  // Auto-hide the custom toast notification
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Extract initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get dynamic procedural color for avatar
  const getAvatarBgColor = (name) => {
    if (!name) return '#4B6B91';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#064A78', // Theme Accent Blue
      '#0D9488', // Teal
      '#059669', // Emerald
      '#4F46E5', // Indigo
      '#7C3AED', // Violet
      '#DB2777', // Pink
      '#EA580C', // Orange
      '#1E293B', // Slate
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    header: {
      height: 75,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: theme.surface,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 11,
      color: theme.muted,
      textAlign: 'center',
      marginTop: 2,
    },
    themeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: theme.surface,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    searchSection: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      width: '100%',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: spacing.sm,
      height: 48,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    searchIcon: {
      marginRight: spacing.xs,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      height: '100%',
    },
    counterSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    counterLabel: {
      fontSize: 13,
      color: theme.muted,
      fontWeight: '600',
    },
    counterBadge: {
      backgroundColor: theme.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    counterBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.accent,
    },
    list: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    contactNumber: {
      fontSize: 13,
      color: theme.muted,
      marginTop: 2,
    },
    noNumberText: {
      fontSize: 13,
      color: '#EF4444',
      fontWeight: '600',
      marginTop: 2,
    },
    copyBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(6, 74, 120, 0.06)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderText: {
      marginTop: spacing.sm,
      color: theme.muted,
      fontSize: 14,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    permissionIcon: {
      marginBottom: spacing.md,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    permissionText: {
      fontSize: 14,
      color: theme.muted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.lg,
    },
    primaryBtn: {
      backgroundColor: theme.accent,
      paddingVertical: 14,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: theme.accent,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
    },
    primaryBtnText: {
      color: theme.surface,
      fontWeight: '700',
      fontSize: 16,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg * 2,
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.muted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    emptyBtn: {
      backgroundColor: theme.accent,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginTop: spacing.xs,
    },
    emptyBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    toastContainer: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      zIndex: 999,
      alignItems: 'center',
    },
    toastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderLeftWidth: 5,
      borderLeftColor: '#10B981', // Premium Emerald Green
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      width: '100%',
      elevation: 6,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    toastIcon: {
      marginRight: 12,
    },
    toastTextContent: {
      flex: 1,
    },
    toastTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    toastMessage: {
      fontSize: 12,
      color: theme.muted,
      marginTop: 2,
    },
  });

  // Render checking permissions state
  if (permissionStatus === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loaderText}>Checking directory permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render permission request fallback view
  if (permissionStatus !== 'granted') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color={theme.accentDark} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Contacts Directory</Text>
            <Text style={styles.headerSubtitle}>Smart Field Survey</Text>
          </View>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <MaterialIcons
              name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
              size={20}
              color={theme.accentDark}
            />
          </Pressable>
        </View>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="contacts" size={64} color={theme.muted} style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Contacts Permission Required</Text>
          <Text style={styles.permissionText}>
            We require access to your device directory to display the client contacts list, search through them, and copy their mobile numbers.
          </Text>
          <Pressable style={[styles.primaryBtn, { width: '80%' }]} onPress={askPermission}>
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Copy Success Toast */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <MaterialIcons name="check-circle" size={22} color="#10B981" style={styles.toastIcon} />
            <View style={styles.toastTextContent}>
              <Text style={styles.toastTitle}>Number Copied!</Text>
              <Text style={styles.toastMessage}>{toastMessage}</Text>
            </View>
            <Pressable onPress={() => setShowToast(false)} style={{ padding: 6 }}>
              <MaterialIcons name="close" size={18} color={theme.muted} />
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.container}>
        
        {/* Custom App Header */}
        <View style={styles.header}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color={theme.accentDark} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Contacts Directory</Text>
            <Text style={styles.headerSubtitle}>Smart Field Survey</Text>
          </View>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <MaterialIcons
              name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
              size={20}
              color={theme.accentDark}
            />
          </Pressable>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={22} color={theme.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts by name or number..."
              placeholderTextColor={theme.muted}
              value={searchQuery}
              onChangeText={handleSearch}
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => handleSearch('')} style={{ padding: 4 }}>
                <MaterialIcons name="cancel" size={18} color={theme.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Contact Counter Indicator */}
        {!loading && contacts.length > 0 && (
          <View style={styles.counterSection}>
            <Text style={styles.counterLabel}>
              {searchQuery ? 'Search Results' : 'All Directory Contacts'}
            </Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                {filteredContacts.length} found
              </Text>
            </View>
          </View>
        )}

        {/* List Loading State */}
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={styles.loaderText}>Loading contacts directory...</Text>
          </View>
        ) : (
          /* Contacts FlatList */
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id || `contact-${Math.random()}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadContacts(true)}
                colors={[theme.accent]}
                tintColor={theme.accent}
              />
            }
            renderItem={({ item }) => {
              const hasPhone = item.phoneNumbers && item.phoneNumbers.length > 0 && item.phoneNumbers[0].number;
              const phoneText = hasPhone ? item.phoneNumbers[0].number : null;

              return (
                <View style={styles.contactCard}>
                  {/* Circular Initials Avatar */}
                  <View style={[styles.avatar, { backgroundColor: getAvatarBgColor(item.name) }]}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                  </View>

                  {/* Contact Info Details */}
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {item.name || 'Unknown Contact'}
                    </Text>
                    {phoneText ? (
                      <Text style={styles.contactNumber} numberOfLines={1}>
                        {phoneText}
                      </Text>
                    ) : (
                      <Text style={styles.noNumberText}>No Number</Text>
                    )}
                  </View>

                  {/* Copy Button Action */}
                  {phoneText && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.copyBtn,
                        pressed && { opacity: 0.7 }
                      ]}
                      onPress={() => copyContactNumber(item)}
                    >
                      <MaterialIcons name="content-copy" size={16} color={theme.accent} />
                    </Pressable>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
