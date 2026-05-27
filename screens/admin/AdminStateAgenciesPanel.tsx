import React, { useState } from 'react';
import { Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STATE_AGENCIES, StateAgency } from '../../data/stateAgencies';
import { borderRadius, colors, fontSize, spacing } from '../../lib/theme';

const { width } = Dimensions.get('window');

type AdminStateAgenciesPanelProps = {
  styles: any;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onBackToCategories: () => void;
};

export default function AdminStateAgenciesPanel({
  styles,
  searchQuery,
  setSearchQuery,
  onBackToCategories,
}: AdminStateAgenciesPanelProps) {
  const [selectedAgency, setSelectedAgency] = useState<StateAgency | null>(null);
  const agencyFiltered = STATE_AGENCIES.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.acronym.toLowerCase().includes(q) || a.focus.toLowerCase().includes(q) || a.ceoName.toLowerCase().includes(q);
  });

  return (
    <View style={styles.tabContent}>
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={onBackToCategories} style={{ marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { flex: 1, marginBottom: 0 }]}>State Agencies</Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>{agencyFiltered.length} agencies</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search agencies, acronyms, CEO..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        data={agencyFiltered}
        keyExtractor={(item: StateAgency) => item.acronym}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 8 }}
        renderItem={({ item }: { item: StateAgency }) => (
          <TouchableOpacity
            style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: '#8B5CF6' }]}
            onPress={() => setSelectedAgency(item)}
          >
            <View style={[styles.categoryIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
              {item.logo ? (
                <Image source={{ uri: item.logo }} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
              ) : (
                <Ionicons name="business" size={22} color="#8B5CF6" />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={[styles.memberSub, { color: '#8B5CF6', fontWeight: '600' }]}>{item.acronym} - {item.type}</Text>
              <Text style={styles.memberSub} numberOfLines={1}>{item.focus}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                <Ionicons name="person" size={12} color={colors.primary} />
                <Text style={[styles.memberSub, { color: colors.primary, fontWeight: '500', marginTop: 0 }]} numberOfLines={1}>{item.ceoName}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 }}>
                <Ionicons name="location" size={12} color={colors.textMuted} />
                <Text style={[styles.memberSub, { marginTop: 0 }]}>{item.city}, {item.country}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No agencies found</Text>}
      />

      <Modal visible={!!selectedAgency} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedAgency?.acronym}</Text>
              <TouchableOpacity onPress={() => setSelectedAgency(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {selectedAgency && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#8B5CF6' + '20', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedAgency.logo ? (
                      <Image source={{ uri: selectedAgency.logo }} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                    ) : (
                      <Ionicons name="business" size={32} color="#8B5CF6" />
                    )}
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: 12, textAlign: 'center' }}>{selectedAgency.name}</Text>
                  <Text style={{ fontSize: fontSize.md, color: '#8B5CF6', fontWeight: '600', marginTop: 4 }}>{selectedAgency.acronym}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#8B5CF6' + '20', marginTop: 8 }]}>
                    <Text style={[styles.statusText, { color: '#8B5CF6' }]}>{selectedAgency.type}</Text>
                  </View>
                </View>

                <View style={{ backgroundColor: colors.primary + '10', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 4 }}>Leadership / Head of Agency</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="person" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text }}>{selectedAgency.ceoName}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>CEO / Head of Agency</Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 }}>About</Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>{selectedAgency.description}</Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 }}>Focus Area</Text>
                  <View style={{ backgroundColor: '#8B5CF6' + '15', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.md, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: fontSize.sm, color: '#8B5CF6', fontWeight: '600' }}>{selectedAgency.focus}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <View style={{ backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 12, minWidth: (width - 68) / 2, flex: 1, borderWidth: 1, borderColor: colors.border }}>
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 }}>Location</Text>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: 2 }}>{selectedAgency.city}</Text>
                  </View>
                  <View style={{ backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 12, minWidth: (width - 68) / 2, flex: 1, borderWidth: 1, borderColor: colors.border }}>
                    <Ionicons name="calendar" size={16} color={colors.primary} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 }}>Founded</Text>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: 2 }}>{selectedAgency.founded}</Text>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Contact Information</Text>

                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }} onPress={() => Linking.openURL(`mailto:${selectedAgency.email}`)}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="mail" size={16} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: fontSize.sm, color: colors.primary, flex: 1 }}>{selectedAgency.email}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }} onPress={() => Linking.openURL(`tel:${selectedAgency.phone}`)}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success + '15', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="call" size={16} color={colors.success} />
                    </View>
                    <Text style={{ fontSize: fontSize.sm, color: colors.text, flex: 1 }}>{selectedAgency.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }} onPress={() => Linking.openURL(`https://${selectedAgency.website}`)}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.info + '15', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="globe" size={16} color={colors.info} />
                    </View>
                    <Text style={{ fontSize: fontSize.sm, color: colors.info, flex: 1 }}>{selectedAgency.website}</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.warning + '15', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="map" size={16} color={colors.warning} />
                    </View>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 }}>{selectedAgency.address}, {selectedAgency.city}</Text>
                  </View>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}