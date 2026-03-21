import React, { useEffect } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Alert,
Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '../lib/mockBackend';
import { api } from '../convex/_generated/api';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { useDemo } from '../lib/DemoContext';

export default function EventsScreen() {
  const { isDemo, exitDemo } = useDemo();
  const events = useQuery(api.events.listEvents, {});
  const rsvpEvent = useMutation(api.events.rsvpEvent);
  const seedData = useMutation(api.init.seedData);

  useEffect(() => {
    seedData().catch(() => {});
  }, [seedData]);

  const handleRsvp = async (eventId: any) => {
    if (isDemo) {
      Alert.alert('Account Required', 'Create an account to RSVP for events.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: exitDemo },
      ]);
      return;
    }
    try {
      await rsvpEvent({ eventId });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to RSVP');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>The Future is Here</Text>
          <Text style={styles.headerSubtitle}>Dinner Tour Events</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {events?.map((event) => (
            <View key={event._id} style={styles.eventCard}>
              <View style={styles.eventTop}>
                <View style={styles.eventIcon}>
                  <Ionicons name="restaurant" size={24} color={colors.primary} />
                </View>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: event.status === 'upcoming' ? colors.success : colors.primary },
                    ]}
                  />
                  <Text style={styles.statusText}>{event.status}</Text>
                </View>
              </View>

              <Text style={styles.eventTitle}>{event.title}</Text>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={styles.detailText}>{event.venue}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="globe" size={16} color={colors.primary} />
                  <Text style={styles.detailText}>{event.city}, {event.country}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color={colors.primary} />
                  <Text style={styles.detailText}>
                    {new Date(event.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                  <Text style={styles.detailText}>
                    {event.rsvpCount} / {event.capacity} attendees
                  </Text>
                </View>
              </View>

              <Text style={styles.eventDesc} numberOfLines={3}>
                {event.description}
              </Text>

              {/* Sponsors */}
              {event.sponsors && event.sponsors.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs, marginBottom: spacing.xs }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, width: '100%' }}>
                    Sponsored by
                  </Text>
                  {event.sponsors.map((sp: any, si: number) => (
                    <TouchableOpacity
                      key={si}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        backgroundColor: sp.tier === 'title' ? colors.primary + '20' :
                          sp.tier === 'gold' ? '#FFD700' + '15' :
                          sp.tier === 'silver' ? '#C0C0C0' + '15' : colors.surface,
                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                        borderWidth: 1,
                        borderColor: sp.tier === 'title' ? colors.primary + '40' :
                          sp.tier === 'gold' ? '#FFD700' + '30' : colors.border,
                      }}
                      onPress={() => sp.website && Linking.openURL(sp.website)}
                    >
                      <Ionicons name="diamond" size={12} color={
                        sp.tier === 'title' ? colors.primary :
                        sp.tier === 'gold' ? '#FFD700' :
                        sp.tier === 'silver' ? '#C0C0C0' :
                        sp.tier === 'bronze' ? '#CD7F32' : colors.textMuted
                      } />
                      <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.text }}>{sp.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Capacity bar */}
              <View style={styles.capacityBar}>
                <View
                  style={[
                    styles.capacityFill,
                    { width: `${Math.min(100, (event.rsvpCount / event.capacity) * 100)}%` },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={styles.rsvpButton}
                onPress={() => handleRsvp(event._id)}
                disabled={event.rsvpCount >= event.capacity}
              >
                <Text style={styles.rsvpButtonText}>
                  {event.ticketPrice 
                    ? `Register & Pay ${event.ticketPrice} ${event.currency}` 
                    : 'RSVP Now'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {(!events || events.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No events available yet</Text>
              <Text style={styles.emptySubtext}>Check back soon for upcoming dinner tours</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 2 },
  list: { paddingHorizontal: spacing.lg },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  eventDetails: { gap: 8, marginBottom: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: fontSize.sm, color: colors.textSecondary },
  eventDesc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  capacityBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  capacityFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    gap: 8,
  },
  rsvpButtonText: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '600', marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  priceContainer: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  price: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
