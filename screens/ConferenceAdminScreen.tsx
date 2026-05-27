import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  SectionList, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convexApi';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

const ADMIN_ACTIVE_CUTOFF = new Date(2026, 4, 18).getTime();

type ConferenceFilter = 'active' | 'past' | 'archived';

const parseAdminConferenceDate = (dateStr: string) => {
  const value = (dateStr || '').trim();
  if (!value || value.startsWith('TBA')) return null;

  const monthMap: Record<string, number> = {
    Jan: 0, January: 0,
    Feb: 1, February: 1,
    Mar: 2, March: 2,
    Apr: 3, April: 3,
    May: 4,
    Jun: 5, June: 5,
    Jul: 6, July: 6,
    Aug: 7, August: 7,
    Sep: 8, September: 8,
    Oct: 9, October: 9,
    Nov: 10, November: 10,
    Dec: 11, December: 11,
  };

  const getMonthIndex = (month: string) => monthMap[month.slice(0, 3)] ?? monthMap[month];
  const normalisedValue = value.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

  const singleDateMatch = normalisedValue.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (singleDateMatch) {
    const monthIndex = getMonthIndex(singleDateMatch[1]);
    if (monthIndex !== undefined) return new Date(parseInt(singleDateMatch[3]), monthIndex, parseInt(singleDateMatch[2])).getTime();
  }

  const rangeMatch = normalisedValue.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),\s*(\d{4})$/);
  if (rangeMatch) {
    const monthIndex = getMonthIndex(rangeMatch[1]);
    if (monthIndex !== undefined) return new Date(parseInt(rangeMatch[4]), monthIndex, parseInt(rangeMatch[2])).getTime();
  }

  const crossMonthRangeMatch = normalisedValue.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (crossMonthRangeMatch) {
    const monthIndex = getMonthIndex(crossMonthRangeMatch[1]);
    if (monthIndex !== undefined) return new Date(parseInt(crossMonthRangeMatch[5]), monthIndex, parseInt(crossMonthRangeMatch[2])).getTime();
  }

  const monthOnly = normalisedValue.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthOnly) {
    const monthIndex = getMonthIndex(monthOnly[1]);
    if (monthIndex !== undefined) return new Date(parseInt(monthOnly[2]), monthIndex, 1).getTime();
  }

  return null;
};

export default function ConferenceAdminScreen() {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedConference, setSelectedConference] = useState<any>(null);
  const [conferenceFilter, setConferenceFilter] = useState<ConferenceFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    focus: 'Technology',
    date: '',
    location: '',
    country: 'South Africa',
    description: '',
    website: '',
    attendees: '',
    icon: 'calendar',
    contactEmail: '',
    speakerEmail: '',
    speakerContact: '',
  });

  const toEditableConferencePayload = (data: any) => ({
    name: data?.name ?? '',
    focus: data?.focus ?? 'Technology',
    date: data?.date ?? '',
    location: data?.location ?? '',
    country: data?.country ?? 'South Africa',
    description: data?.description ?? '',
    website: data?.website ?? '',
    attendees: data?.attendees ?? '',
    icon: data?.icon ?? 'calendar',
    contactEmail: data?.contactEmail ?? '',
    speakerEmail: data?.speakerEmail ?? '',
    speakerContact: data?.speakerContact ?? '',
  });

  const conferences = useQuery(api.conferences.listAdmin, {}) || [];
  const sortedConferences = [...conferences].sort((a: any, b: any) => {
    const aTime = parseAdminConferenceDate(a.date);
    const bTime = parseAdminConferenceDate(b.date);
    const aSortTime = aTime ?? Number.MAX_SAFE_INTEGER;
    const bSortTime = bTime ?? Number.MAX_SAFE_INTEGER;
    if (aSortTime !== bSortTime) return aSortTime - bSortTime;
    return String(a._id).localeCompare(String(b._id));
  });
  const archivedConferences = sortedConferences.filter((conference: any) => conference.isArchived);
  const activeConferences = sortedConferences.filter((conference: any) => {
    if (conference.isArchived) return false;
    const dateTime = parseAdminConferenceDate(conference.date);
    return dateTime === null || dateTime >= ADMIN_ACTIVE_CUTOFF;
  });
  const pastConferences = sortedConferences.filter((conference: any) => {
    if (conference.isArchived) return false;
    const dateTime = parseAdminConferenceDate(conference.date);
    return dateTime !== null && dateTime < ADMIN_ACTIVE_CUTOFF;
  });
  const visibleConferences = (conferenceFilter === 'active' ? activeConferences : conferenceFilter === 'past' ? pastConferences : archivedConferences).filter((conference: any) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const haystack = [
      conference.name,
      conference.date,
      conference.country,
      conference.location,
      conference.focus,
      conference.description,
      conference.website,
      conference.attendees,
      conference.contactEmail,
      conference.speakerEmail,
      conference.speakerContact,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
  const sections = visibleConferences.length ? [{ data: visibleConferences }] : [];
  const createConference = useMutation(api.conferences.create);
  const updateConference = useMutation(api.conferences.update);
  const deleteConference = useMutation(api.conferences.remove);
  const publishConference = useMutation(api.conferences.publish);
  const unpublishConference = useMutation(api.conferences.unpublish);

  const handleAddNew = () => {
    setFormData({
      name: '',
      focus: 'Technology',
      date: '',
      location: '',
      country: 'South Africa',
      description: '',
      website: '',
      attendees: '',
      icon: 'calendar',
      contactEmail: '',
      speakerEmail: '',
      speakerContact: '',
    });
    setSelectedConference(null);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.date.trim()) {
      Alert.alert('Required Fields', 'Please fill in Name and Date');
      return;
    }

    try {
      const payload = toEditableConferencePayload(formData);

      if (selectedConference) {
        await updateConference({
          id: selectedConference._id,
          ...payload,
        });
        Alert.alert('Success', 'Conference updated');
      } else {
        await createConference(payload as any);
        Alert.alert('Success', 'Conference added');
      }
      setIsAdding(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Conference', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteConference({ id });
            Alert.alert('Success', 'Conference deleted');
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleTogglePublish = async (item: any) => {
    try {
      if (item.isPublished) {
        await unpublishConference({ id: item._id });
        Alert.alert('Success', 'Conference unpublished');
      } else {
        await publishConference({ id: item._id });
        Alert.alert('Success', 'Conference published');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update publish status');
    }
  };

  const renderConferenceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conferenceItem}
      onPress={() => {
        setSelectedConference(item);
        setFormData(toEditableConferencePayload(item));
        setIsAdding(true);
      }}
    >
      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>{item.focus} • {item.country}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.publishButton}
            onPress={(e: any) => {
              e?.stopPropagation?.();
              handleTogglePublish(item);
            }}
          >
            <Text style={styles.publishButtonText}>
              {item.isPublished ? 'Unpublish' : 'Publish'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e: any) => {
              e?.stopPropagation?.();
              handleDelete(item._id);
            }}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemDate}>{item.date}</Text>
      {!!item.contactEmail && (
        <Text style={[styles.itemContact, { marginTop: 6 }]} numberOfLines={1}>
          Delegate Email: {item.contactEmail}
        </Text>
      )}
      {!!item.speakerEmail && (
        <Text style={[styles.itemContact, { marginTop: 4 }]} numberOfLines={1}>
          Speaker Email: {item.speakerEmail}
        </Text>
      )}
      {item.speakerContact && (
        <Text style={[styles.itemDate, { marginTop: 4, color: colors.primary }]}>
          Speaker: {item.speakerContact}
        </Text>
      )}
    </TouchableOpacity>
  );

  const filterCounts = {
    active: activeConferences.length,
    past: pastConferences.length,
    archived: archivedConferences.length,
  };

  const renderFilterChip = (key: ConferenceFilter, label: string) => (
    <TouchableOpacity
      style={[styles.tabCard, conferenceFilter === key && styles.tabCardActive]}
      onPress={() => setConferenceFilter(key)}
      activeOpacity={0.85}
    >
      <View style={styles.tabCardTopRow}>
        <Text style={[styles.tabCardLabel, conferenceFilter === key && styles.tabCardLabelActive]}>
          {label}
        </Text>
        <View style={[styles.tabCountPill, conferenceFilter === key && styles.tabCountPillActive]}>
          <Text style={[styles.tabCountText, conferenceFilter === key && styles.tabCountTextActive]}>
            {filterCounts[key]}
          </Text>
        </View>
      </View>
      <Text style={[styles.tabCardSubtext, conferenceFilter === key && styles.tabCardSubtextActive]}>
        {key === 'active' ? 'Visible now' : key === 'past' ? 'Completed events' : 'Hidden from public'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conference Management</Text>
          <View style={styles.searchBarWrap}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, date, country, location..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.tabsGrid}>
            {renderFilterChip('active', 'Active Conferences')}
            {renderFilterChip('past', 'Past Conferences')}
            {renderFilterChip('archived', 'Archived Conferences')}
            <TouchableOpacity style={styles.addTabCard} onPress={handleAddNew} activeOpacity={0.85}>
              <View style={styles.addTabIconWrap}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addTabTitle}>Add Conference</Text>
                <Text style={styles.addTabSubtitle}>Create a new event entry</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={renderConferenceItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No conferences found.</Text>
            </View>
          }
        />

        <Modal visible={isAdding} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsAdding(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedConference ? 'Edit' : 'Add'} Conference</Text>
                <TouchableOpacity onPress={handleSave}>
                  <Ionicons name="checkmark" size={28} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.fieldLabel}>Conference Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Africa Tech Festival 2026"
                    placeholderTextColor={colors.textMuted}
                    value={formData.name}
                    onChangeText={(text: string) => setFormData({ ...formData, name: text })}
                  />

                  <Text style={styles.fieldLabel}>Focus Area *</Text>
                  <View style={styles.buttonGroup}>
                    {['AI', 'Technology', 'Investment', 'Entrepreneurship', 'Infrastructure'].map(
                      (focus) => (
                        <TouchableOpacity
                          key={focus}
                          style={[styles.focusButton, formData.focus === focus && styles.focusButtonActive]}
                          onPress={() => setFormData({ ...formData, focus })}
                        >
                          <Text style={[styles.focusButtonText, formData.focus === focus && styles.focusButtonTextActive]}>
                            {focus}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <Text style={styles.fieldLabel}>Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Feb 12-15, 2026"
                    placeholderTextColor={colors.textMuted}
                    value={formData.date}
                    onChangeText={(text: string) => setFormData({ ...formData, date: text })}
                  />

                  <Text style={styles.fieldLabel}>Location *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cape Town, CTICC"
                    placeholderTextColor={colors.textMuted}
                    value={formData.location}
                    onChangeText={(text: string) => setFormData({ ...formData, location: text })}
                  />

                  <Text style={styles.fieldLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="South Africa"
                    placeholderTextColor={colors.textMuted}
                    value={formData.country}
                    onChangeText={(text: string) => setFormData({ ...formData, country: text })}
                  />

                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Conference description..."
                    placeholderTextColor={colors.textMuted}
                    value={formData.description}
                    onChangeText={(text: string) => setFormData({ ...formData, description: text })}
                    multiline
                  />

                  <Text style={styles.fieldLabel}>Website</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.website}
                    onChangeText={(text: string) => setFormData({ ...formData, website: text })}
                  />

                  <Text style={styles.fieldLabel}>Expected Attendees</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2,000+"
                    placeholderTextColor={colors.textMuted}
                    value={formData.attendees}
                    onChangeText={(text: string) => setFormData({ ...formData, attendees: text })}
                  />

                  <Text style={styles.fieldLabel}>Contact Email (Delegates)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="delegates@event.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.contactEmail}
                    onChangeText={(text: string) => setFormData({ ...formData, contactEmail: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.fieldLabel}>Speaker Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="speakers@event.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.speakerEmail}
                    onChangeText={(text: string) => setFormData({ ...formData, speakerEmail: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.fieldLabel}>Speaker Contact Person</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe – Head of Content"
                    placeholderTextColor={colors.textMuted}
                    value={formData.speakerContact}
                    onChangeText={(text: string) => setFormData({ ...formData, speakerContact: text })}
                  />

                  <View style={{ height: 40 }} />
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    paddingVertical: 0,
  },
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabCard: {
    width: '48%',
    minHeight: 78,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  tabCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tabCardLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.textSecondary,
    lineHeight: fontSize.sm + 3,
  },
  tabCardLabelActive: {
    color: colors.black,
  },
  tabCountPill: {
    minWidth: 30,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabCountPillActive: {
    backgroundColor: colors.black + '18',
    borderColor: colors.black + '18',
  },
  tabCountText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: colors.black,
  },
  tabCardSubtext: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabCardSubtextActive: {
    color: colors.black,
    opacity: 0.7,
  },
  addTabCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  addTabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '18',
  },
  addTabTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  addTabSubtitle: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  conferenceItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  publishButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  publishButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  itemDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemContact: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  focusButtonText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  focusButtonTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
});