import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { useDemo } from '../lib/DemoContext';

const EVENT_CATEGORIES = [
  { id: 'dinner_tour', label: 'Dinner Tour Events', icon: 'restaurant' },
  { id: 'ai_masterclass', label: 'AI Masterclasses', icon: 'school' },
  { id: 'finance_tax', label: 'Finance & Tax', icon: 'calculator' },
];

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPACT_FILTER_BREAKPOINT = 640;

export default function EventsScreen() {
  const { isDemo, exitDemo } = useDemo();
  const [selectedCategory, setSelectedCategory] = useState('dinner_tour');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const events = useQuery(api.events.listEvents, { category: selectedCategory });
  const rsvpEvent = useMutation(api.events.rsvpEvent);
  const isCompactScreen = SCREEN_WIDTH < COMPACT_FILTER_BREAKPOINT;
  const activeCategory =
    EVENT_CATEGORIES.find((category) => category.id === selectedCategory) ?? EVENT_CATEGORIES[0];

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
      Alert.alert('Success', 'You have been registered for this event.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to RSVP');
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'ai_masterclass') return 'school';
    if (cat === 'finance_tax') return 'calculator';
    return 'restaurant';
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleListScroll = (event: any) => {
    if (!isCompactScreen) return;
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 32 && !filtersCollapsed) {
      setFiltersCollapsed(true);
    } else if (offsetY <= 8 && filtersCollapsed) {
      setFiltersCollapsed(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AOE Events 2026</Text>
          <Text style={styles.headerCount}>{events?.length ?? 0} events</Text>
        </View>

        {/* Category Tabs */}
        {isCompactScreen && filtersCollapsed ? (
          <View style={styles.compactFilterWrap}>
            <TouchableOpacity
              style={styles.compactFilterButton}
              onPress={() => setFiltersCollapsed(false)}
              activeOpacity={0.8}
            >
              <Ionicons name={activeCategory.icon as any} size={16} color={colors.primary} />
              <Text style={styles.compactFilterText} numberOfLines={1}>
                {activeCategory.label}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {EVENT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.tab,
                  selectedCategory === category.id && styles.tabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    selectedCategory === category.id && styles.tabLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
        >
          {events?.map((event) => (
            <TouchableOpacity
              key={event._id}
              style={styles.eventCard}
              activeOpacity={0.7}
              onPress={() => setSelectedEvent(event)}
            >
              <View style={styles.eventTop}>
                <View style={styles.eventIcon}>
                  <Ionicons
                    name={getCategoryIcon(selectedCategory) as any}
                    size={24}
                    color={colors.primary}
                  />
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
                  <Ionicons name="calendar" size={16} color={colors.primary} />
                  <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                  <Text style={styles.detailText}>
                    {event.rsvpCount} / {event.capacity} attendees
                  </Text>
                </View>
              </View>

              <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>

              {event.ticketPrice && (
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>
                    {event.currency} {event.ticketPrice}
                  </Text>
                </View>
              )}

              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Tap for details</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}

          {(!events || events.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No events available</Text>
              <Text style={styles.emptySubtext}>Check back soon for upcoming events</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Event Detail Modal */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={modalStyles.container}>
          {selectedEvent && (
            <>
              {/* Modal Header */}
              <View style={modalStyles.header}>
                <TouchableOpacity
                  style={modalStyles.closeBtn}
                  onPress={() => setSelectedEvent(null)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={modalStyles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.statusText, { color: colors.success }]}>
                      {selectedEvent.status}
                    </Text>
                  </View>
                  {selectedEvent.ticketPrice && (
                    <View style={modalStyles.priceBadge}>
                      <Text style={modalStyles.priceText}>
                        {selectedEvent.currency} {selectedEvent.ticketPrice}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={modalStyles.content}
              >
                {/* Title & Icon */}
                <View style={modalStyles.titleRow}>
                  <View style={[styles.eventIcon, { width: 56, height: 56, borderRadius: 28 }]}>
                    <Ionicons
                      name={getCategoryIcon(selectedEvent.category || selectedCategory) as any}
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={modalStyles.title}>{selectedEvent.title}</Text>
                </View>

                {/* Details Grid */}
                <View style={modalStyles.detailsCard}>
                  <View style={modalStyles.detailItem}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.detailLabel}>Venue</Text>
                      <Text style={modalStyles.detailValue}>{selectedEvent.venue}</Text>
                    </View>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Ionicons name="globe" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.detailLabel}>Location</Text>
                      <Text style={modalStyles.detailValue}>
                        {selectedEvent.city}, {selectedEvent.country}
                      </Text>
                    </View>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Ionicons name="calendar" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.detailLabel}>Date</Text>
                      <Text style={modalStyles.detailValue}>{formatDate(selectedEvent.date)}</Text>
                    </View>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Ionicons name="time" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.detailLabel}>Time</Text>
                      <Text style={modalStyles.detailValue}>{formatTime(selectedEvent.date)}</Text>
                    </View>
                  </View>
                  <View style={modalStyles.detailItem}>
                    <Ionicons name="people" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.detailLabel}>Capacity</Text>
                      <Text style={modalStyles.detailValue}>
                        {selectedEvent.rsvpCount} / {selectedEvent.capacity} attendees
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Capacity Bar */}
                <View style={modalStyles.capacitySection}>
                  <View style={styles.capacityBar}>
                    <View
                      style={[
                        styles.capacityFill,
                        { width: `${Math.min(100, (selectedEvent.rsvpCount / selectedEvent.capacity) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={modalStyles.capacityText}>
                    {selectedEvent.capacity - selectedEvent.rsvpCount} spots remaining
                  </Text>
                </View>

                {/* Description */}
                <View style={modalStyles.section}>
                  <Text style={modalStyles.sectionTitle}>About This Event</Text>
                  <Text style={modalStyles.description}>{selectedEvent.description}</Text>
                </View>

                {/* Guest Speakers */}
                {selectedEvent.guestSpeakers && selectedEvent.guestSpeakers.length > 0 && (
                  <View style={modalStyles.section}>
                    <Text style={modalStyles.sectionTitle}>Guest Speakers</Text>
                    {selectedEvent.guestSpeakers.map((speaker: any, index: number) => (
                      <View key={index} style={modalStyles.speakerCard}>
                        <View style={modalStyles.speakerAvatar}>
                          <Ionicons name="person" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.speakerName}>{speaker.name}</Text>
                          {speaker.designation && (
                            <Text style={modalStyles.speakerRole}>{speaker.designation}</Text>
                          )}
                          {speaker.company && (
                            <Text style={modalStyles.speakerCompany}>{speaker.company}</Text>
                          )}
                        </View>
                        <View style={[
                          modalStyles.speakerStatus,
                          { backgroundColor: speaker.status === 'confirmed' ? colors.success + '20' : colors.primary + '20' },
                        ]}>
                          <Text style={[
                            modalStyles.speakerStatusText,
                            { color: speaker.status === 'confirmed' ? colors.success : colors.primary },
                          ]}>
                            {speaker.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Sponsors */}
                {selectedEvent.sponsors && selectedEvent.sponsors.length > 0 && (
                  <View style={modalStyles.section}>
                    <Text style={modalStyles.sectionTitle}>Sponsored By</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {selectedEvent.sponsors.map((sp: any, si: number) => (
                        <TouchableOpacity
                          key={si}
                          style={modalStyles.sponsorChip}
                          onPress={() => sp.website && Linking.openURL(sp.website)}
                        >
                          <Ionicons
                            name="diamond"
                            size={14}
                            color={
                              sp.tier === 'title' ? colors.primary :
                              sp.tier === 'gold' ? '#FFD700' :
                              sp.tier === 'silver' ? '#C0C0C0' : '#CD7F32'
                            }
                          />
                          <Text style={modalStyles.sponsorName}>{sp.name}</Text>
                          <Text style={modalStyles.sponsorTier}>{sp.tier}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ height: 100 }} />
              </ScrollView>

              {/* Fixed Bottom RSVP */}
              <View style={modalStyles.bottomBar}>
                <TouchableOpacity
                  style={[
                    modalStyles.rsvpBtn,
                    selectedEvent.rsvpCount >= selectedEvent.capacity && modalStyles.rsvpBtnDisabled,
                  ]}
                  onPress={() => {
                    handleRsvp(selectedEvent._id);
                  }}
                  disabled={selectedEvent.rsvpCount >= selectedEvent.capacity}
                >
                  <Ionicons name="ticket" size={20} color="#000" />
                  <Text style={modalStyles.rsvpBtnText}>
                    {selectedEvent.rsvpCount >= selectedEvent.capacity
                      ? 'Sold Out'
                      : selectedEvent.ticketPrice
                        ? `Register & Pay ${selectedEvent.currency} ${selectedEvent.ticketPrice}`
                        : 'RSVP Now — Free'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: { flexShrink: 1, fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  headerCount: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600', flexShrink: 0 },
  compactFilterWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  compactFilterButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactFilterText: {
    maxWidth: SCREEN_WIDTH - spacing.lg * 2 - 72,
    fontSize: fontSize.sm,
    lineHeight: 18,
    color: colors.text,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: colors.background,
    flexGrow: 0,
    minHeight: 60,
    overflow: 'visible',
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: 8,
    paddingRight: spacing.xl,
    gap: spacing.xs,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  tabActive: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  tabLabel: { fontSize: fontSize.sm, lineHeight: 18, fontWeight: '600', color: colors.textMuted },
  tabLabelActive: { color: colors.primary },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
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
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.full, gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: {
    fontSize: fontSize.xs, color: colors.textSecondary,
    fontWeight: '600', textTransform: 'capitalize',
  },
  eventTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  eventDetails: { gap: 6, marginBottom: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: fontSize.sm, color: colors.textSecondary },
  eventDesc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  priceTagText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  tapHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
  },
  tapHintText: { fontSize: fontSize.xs, color: colors.textMuted },
  capacityBar: {
    height: 4, backgroundColor: colors.surfaceLight,
    borderRadius: 2, overflow: 'hidden',
  },
  capacityFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '600', marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  priceBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  priceText: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  titleRow: { marginBottom: spacing.lg },
  title: {
    fontSize: fontSize.xl, fontWeight: '800', color: colors.text,
    marginTop: spacing.md, lineHeight: 28,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  detailLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500', marginTop: 2 },
  capacitySection: { marginBottom: spacing.lg },
  capacityText: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 6, textAlign: 'right' },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.md, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  description: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
  speakerCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  speakerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  speakerName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  speakerRole: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  speakerCompany: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600', marginTop: 1 },
  speakerStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full },
  speakerStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  sponsorChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
  },
  sponsorName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  sponsorTier: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '600' },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  rsvpBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, gap: spacing.sm,
  },
  rsvpBtnDisabled: { backgroundColor: colors.surfaceLight },
  rsvpBtnText: { fontSize: fontSize.md, fontWeight: '800', color: '#000' },
});
