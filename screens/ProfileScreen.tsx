import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '../lib/mockBackend';
import { a0 } from '../lib/a0';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../convex/_generated/api';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { useDemo } from '../lib/DemoContext';
import AdminScreen from './AdminScreen';

const COUNTRIES = [
  'Botswana', 'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Rwanda',
  'Ethiopia', 'Tanzania', 'Uganda', 'Senegal', 'Egypt',
  'Morocco', 'Cameroon', 'DRC', 'Mozambique', 'Zimbabwe', 'Other',
];

const INDUSTRIES = [
  'FinTech', 'AgriTech', 'HealthTech', 'EdTech', 'CleanTech',
  'E-Commerce', 'Logistics', 'Media', 'Real Estate', 'Manufacturing', 'Other',
];

export default function ProfileScreen() {
  const { isDemo, exitDemo, signOut } = useDemo();
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const ensureUser = useMutation(api.users.ensureCurrentUser);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImage = useMutation(api.users.updateProfileImage);

  const [editing, setEditing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [website, setWebsite] = useState('');

  const pickAndUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setUploadingImage(true);
      const asset = result.assets[0];

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Fetch the image as a blob
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Upload to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
        body: blob,
      });

      const { storageId } = await uploadResponse.json();

      // Update user profile with storage ID
      await updateProfileImage({ storageId });
      setUploadingImage(false);
    } catch (e: any) {
      setUploadingImage(false);
      Alert.alert('Upload Failed', e.message || 'Could not upload image. Please try again.');
    }
  };

  const handleAdminAccess = () => {
    if (pin === '1977') {
      setShowPinModal(false);
      setPin('');
      setPinError(false);
      setShowAdmin(true);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  useEffect(() => {
    if (user === null && !isDemo) {
      ensureUser();
    }
  }, [user, isDemo]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setCompany(user.company || '');
      setRole(user.role || '');
      setIndustry(user.industry || '');
      setCountry(user.country || '');
      setCity(user.city || '');
      setLinkedIn(user.linkedIn || '');
      setWebsite(user.website || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        industry: industry || undefined,
        country: country || undefined,
        city: city.trim() || undefined,
        linkedIn: linkedIn.trim() || undefined,
        website: website.trim() || undefined,
        onboarded: true,
      });
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  // If admin dashboard is open, render it
  if (showAdmin) {
    return <AdminScreen onBack={() => setShowAdmin(false)} />;
  }

  if (isDemo) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Admin Dashboard Button — no PIN required for guest/demo (App Store review) */}
            <TouchableOpacity
              style={styles.adminBanner}
              onPress={() => setShowAdmin(true)}
              activeOpacity={0.8}
            >
              <View style={styles.adminIconWrap}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Admin Dashboard</Text>
                <Text style={styles.adminBannerDesc}>
                  Manage members, events, payments & reports
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xl }}>
              <View style={styles.avatarLarge}>
                <Ionicons name="person-outline" size={36} color="#000" />
              </View>
              <Text style={[styles.profileName, { marginTop: spacing.md }]}>Guest Explorer</Text>
              <Text style={[styles.profileEmail, { marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 }]}>
                You're browsing as a guest.{'\n'}Create an account to unlock all features.
              </Text>
              <TouchableOpacity
                style={[styles.signUpPromptButton, { marginTop: spacing.xl }]}
                onPress={exitDemo}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpPromptText}>Create Account / Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Loading state — query hasn't resolved yet
  if (user === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <SafeAreaView edges={['top']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person-outline" size={36} color="#000" />
          </View>
          <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>Loading profile...</Text>
        </SafeAreaView>
      </View>
    );
  }

  // No user record yet — show sign in prompt with admin access
  if (user === null) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Admin Dashboard Button — always accessible */}
            <TouchableOpacity
              style={styles.adminBanner}
              onPress={() => { setPin(''); setPinError(false); setShowPinModal(true); }}
              activeOpacity={0.8}
            >
              <View style={styles.adminIconWrap}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Admin Dashboard</Text>
                <Text style={styles.adminBannerDesc}>
                  Manage members, events, payments & reports
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <View style={styles.avatarLarge}>
                <Ionicons name="person-outline" size={36} color="#000" />
              </View>
              <Text style={[styles.profileName, { marginTop: spacing.md }]}>Welcome</Text>
              <Text style={[styles.profileEmail, { marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 }]}>
                Sign in to access your full profile{'\n'}and connect with fellow entrepreneurs.
              </Text>
              <TouchableOpacity
                style={[styles.signUpPromptButton, { marginTop: spacing.xl }]}
                onPress={() => a0.auth.signInWithGoogle()}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpPromptText}>Sign In with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signUpPromptButton, { marginTop: spacing.sm, backgroundColor: colors.text }]}
                onPress={() => a0.auth.signInWithApple()}
                activeOpacity={0.8}
              >
                <Text style={[styles.signUpPromptText, { color: colors.background }]}>Sign In with Apple</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* PIN Modal */}
          <Modal visible={showPinModal} animationType="fade" transparent>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={1}
              onPress={() => setShowPinModal(false)}
            >
              <TouchableOpacity activeOpacity={1} style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
                width: '80%',
                maxWidth: 320,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: colors.primary + '20',
                    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
                  }}>
                    <Ionicons name="lock-closed" size={26} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.text }}>Admin Access</Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }}>
                    Enter the super PIN to continue
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 24,
                    fontWeight: '800',
                    textAlign: 'center',
                    letterSpacing: 12,
                    borderWidth: 1,
                    borderColor: pinError ? colors.error : colors.border,
                  }}
                  value={pin}
                  onChangeText={(t) => { setPin(t); setPinError(false); }}
                  placeholder="----"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  autoFocus
                />
                {pinError && (
                  <Text style={{ color: colors.error, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.sm }}>
                    Incorrect PIN. Try again.
                  </Text>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.md,
                    alignItems: 'center',
                    marginTop: spacing.lg,
                  }}
                  onPress={handleAdminAccess}
                >
                  <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.black }}>Unlock</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: 'center', marginTop: spacing.md }}
                  onPress={() => setShowPinModal(false)}
                >
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Cancel</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={editing ? handleSave : () => setEditing(true)}>
              <Text style={styles.editButton}>{editing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Admin Dashboard Button */}
            {!editing && (
              <TouchableOpacity
                style={styles.adminBanner}
                onPress={() => { setPin(''); setPinError(false); setShowPinModal(true); }}
                activeOpacity={0.8}
              >
                <View style={styles.adminIconWrap}>
                  <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminBannerTitle}>Admin Dashboard</Text>
                  <Text style={styles.adminBannerDesc}>
                    Manage members, events, payments & reports
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}

            {/* Avatar & Name */}
            <View style={styles.profileTop}>
              <TouchableOpacity onPress={pickAndUploadImage} activeOpacity={0.7} style={styles.avatarTouchable}>
                {uploadingImage ? (
                  <View style={styles.avatarLarge}>
                    <ActivityIndicator color={colors.black} />
                  </View>
                ) : user?.image ? (
                  <Image source={{ uri: user.image }} style={styles.avatarLarge} />
                ) : (
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>
                      {(user.name || user.email || 'A').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={14} color={colors.text} />
                </View>
              </TouchableOpacity>
              {editing ? (
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <>
                  <Text style={styles.profileName}>{user.name || 'Set your name'}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                  {user.role && user.company && (
                    <Text style={styles.profileRole}>
                      {user.role} at {user.company}
                    </Text>
                  )}
                </>
              )}
            </View>

            {editing ? (
              <>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself and your entrepreneurial journey..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                <Text style={styles.label}>Company</Text>
                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Company name"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Role</Text>
                <TextInput
                  style={styles.input}
                  value={role}
                  onChangeText={setRole}
                  placeholder="e.g. Founder, CEO, CTO"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Industry</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {INDUSTRIES.map((ind) => (
                    <TouchableOpacity
                      key={ind}
                      style={[styles.chip, industry === ind && styles.chipActive]}
                      onPress={() => setIndustry(ind)}
                    >
                      <Text style={[styles.chipText, industry === ind && styles.chipTextActive]}>
                        {ind}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Country</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {COUNTRIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.chip, country === c && styles.chipActive]}
                      onPress={() => setCountry(c)}
                    >
                      <Text style={[styles.chipText, country === c && styles.chipTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Your city"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>LinkedIn URL</Text>
                <TextInput
                  style={styles.input}
                  value={linkedIn}
                  onChangeText={setLinkedIn}
                  placeholder="https://linkedin.com/in/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </>
            ) : (
              <>
                {user.bio && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>About</Text>
                    <Text style={styles.infoText}>{user.bio}</Text>
                  </View>
                )}

                <View style={styles.infoGrid}>
                  {user.industry && (
                    <View style={styles.infoItem}>
                      <Ionicons name="briefcase" size={16} color={colors.primary} />
                      <Text style={styles.infoItemText}>{user.industry}</Text>
                    </View>
                  )}
                  {user.country && (
                    <View style={styles.infoItem}>
                      <Ionicons name="location" size={16} color={colors.primary} />
                      <Text style={styles.infoItemText}>
                        {user.city ? `${user.city}, ` : ''}{user.country}
                      </Text>
                    </View>
                  )}
                  {user.linkedIn && (
                    <View style={styles.infoItem}>
                      <Ionicons name="logo-linkedin" size={16} color={colors.primary} />
                      <Text style={styles.infoItemText}>LinkedIn</Text>
                    </View>
                  )}
                  {user.website && (
                    <View style={styles.infoItem}>
                      <Ionicons name="globe" size={16} color={colors.primary} />
                      <Text style={styles.infoItemText}>{user.website}</Text>
                    </View>
                  )}
                </View>

                {!user.onboarded && (
                  <TouchableOpacity
                    style={styles.completeProfileBanner}
                    onPress={() => setEditing(true)}
                  >
                    <Ionicons name="person-circle" size={24} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.completeBannerTitle}>Complete Your Profile</Text>
                      <Text style={styles.completeBannerText}>
                        Add your details to connect with fellow entrepreneurs
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* PIN Modal */}
          <Modal visible={showPinModal} animationType="fade" transparent>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={1}
              onPress={() => setShowPinModal(false)}
            >
              <TouchableOpacity activeOpacity={1} style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
                width: '80%',
                maxWidth: 320,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: colors.primary + '20',
                    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
                  }}>
                    <Ionicons name="lock-closed" size={26} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.text }}>Admin Access</Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }}>
                    Enter the super PIN to continue
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    color: colors.text,
                    fontSize: 24,
                    fontWeight: '800',
                    textAlign: 'center',
                    letterSpacing: 12,
                    borderWidth: 1,
                    borderColor: pinError ? colors.error : colors.border,
                  }}
                  value={pin}
                  onChangeText={(t) => { setPin(t); setPinError(false); }}
                  placeholder="----"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  autoFocus
                />
                {pinError && (
                  <Text style={{ color: colors.error, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.sm }}>
                    Incorrect PIN. Try again.
                  </Text>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.md,
                    alignItems: 'center',
                    marginTop: spacing.lg,
                  }}
                  onPress={handleAdminAccess}
                >
                  <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.black }}>Unlock</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: 'center', marginTop: spacing.md }}
                  onPress={() => setShowPinModal(false)}
                >
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Cancel</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  editButton: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  content: { paddingHorizontal: spacing.lg },
  profileTop: { alignItems: 'center', marginBottom: spacing.xl },
  avatarTouchable: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarLargeText: { fontSize: 32, fontWeight: '800', color: colors.black },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  nameInput: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
    minWidth: 200,
  },
  profileName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  profileRole: { fontSize: fontSize.sm, color: colors.primary, marginTop: 4, fontWeight: '500' },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipScroll: { marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.black, fontWeight: '600' },
  infoSection: { marginBottom: spacing.lg },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  infoText: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
  infoGrid: { gap: spacing.sm, marginBottom: spacing.lg },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoItemText: { fontSize: fontSize.sm, color: colors.textSecondary },
  completeProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: spacing.lg,
  },
  completeBannerTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  completeBannerText: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOutText: { fontSize: fontSize.md, color: colors.error, fontWeight: '600' },
  signUpPromptButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  signUpPromptText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: spacing.lg,
  },
  adminIconWrap: {
    marginRight: spacing.sm,
  },
  adminBannerTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  adminBannerDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
