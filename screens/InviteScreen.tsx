import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import QRCodeStyled from 'react-native-qrcode-styled';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

const REGISTER_URL = 'https://app.aoeafrica.org.za';

type Props = {
  onClose: () => void;
};

export default function InviteScreen({ onClose }: Props) {
  const qrRef = useRef<any>(null);

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Join AOE Africa',
        message: `Join AOE Africa — Art of Entrepreneurship! Register here to connect with Africa's premier entrepreneurship network: ${REGISTER_URL}`,
        url: REGISTER_URL,
      });
    } catch (error) {
      // User cancelled
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(REGISTER_URL);
    Alert.alert('Link Copied', 'Registration link has been copied to your clipboard.');
  };

  const captureQR = async (): Promise<string | null> => {
    try {
      if (qrRef.current && qrRef.current.capture) {
        const uri = await qrRef.current.capture();
        return uri;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSaveToPhotos = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to save the QR code.');
        return;
      }
      const uri = await captureQR();
      if (!uri) {
        Alert.alert('Error', 'Could not capture QR code. Please try again.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'QR code has been saved to your photo library.');
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save QR code to photos.');
    }
  };

  const handleShareQRImage = async () => {
    try {
      const uri = await captureQR();
      if (!uri) {
        Alert.alert('Error', 'Could not capture QR code. Please try again.');
        return;
      }
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share AOE Africa Registration QR Code',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to share QR code image.');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Members</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Grow the Network</Text>
            <Text style={styles.subtitle}>
              Share the registration link or QR code with potential members to join AOE Africa.
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>Scan to Register</Text>
            <ViewShot ref={qrRef} options={{ format: 'png', quality: 1.0 }}>
              <View style={styles.qrContainer}>
                <QRCodeStyled
                  data={REGISTER_URL}
                  style={{ backgroundColor: 'white' }}
                  padding={12}
                  pieceSize={5}
                  pieceBorderRadius={2}
                  color={'#000'}
                />
                <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#888', fontWeight: '500' }}>app.aoeafrica.org.za</Text>
              </View>
            </ViewShot>
            <Text style={styles.qrHint}>
              Point your camera at this QR code to open the registration page
            </Text>
          </View>

          {/* QR Code Actions */}
          <View style={styles.qrActions}>
            <TouchableOpacity style={styles.qrActionBtn} onPress={handleShareQRImage}>
              <View style={[styles.qrActionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="share-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.qrActionText}>Share QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qrActionBtn} onPress={handleSaveToPhotos}>
              <View style={[styles.qrActionIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="download-outline" size={20} color={colors.success} />
              </View>
              <Text style={styles.qrActionText}>Save to Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qrActionBtn} onPress={handleCopyLink}>
              <View style={[styles.qrActionIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="copy-outline" size={20} color={colors.info} />
              </View>
              <Text style={styles.qrActionText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          {/* Registration Link */}
          <View style={styles.linkSection}>
            <Text style={styles.linkLabel}>Registration Link</Text>
            <View style={styles.linkBox}>
              <Ionicons name="link-outline" size={18} color={colors.primary} />
              <Text style={styles.linkText} numberOfLines={1}>
                {REGISTER_URL}
              </Text>
              <TouchableOpacity onPress={handleCopyLink} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color="#000" />
              <Text style={styles.shareButtonText}>Share Registration Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.copyButton} onPress={handleShareQRImage}>
              <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
              <Text style={styles.copyButtonText}>Share QR Code as Image</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            {[
              { icon: 'link-outline', text: 'Share the link or QR code with potential members' },
              { icon: 'list-outline', text: 'They choose a membership category' },
              { icon: 'create-outline', text: 'They fill in their details and create an account' },
              { icon: 'mail-outline', text: 'They receive a welcome email' },
              { icon: 'rocket-outline', text: 'They can explore the platform immediately' },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <View style={styles.infoStep}>
                  <Text style={styles.infoStepText}>{i + 1}</Text>
                </View>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  qrContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  qrHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 240,
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrActionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrActionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  linkSection: {
    marginBottom: spacing.xl,
  },
  linkLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  linkText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  copyBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.sm,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  shareButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 15,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  copyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  infoStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoStepText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});