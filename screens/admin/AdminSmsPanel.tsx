import React from 'react';
import { Alert, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import { borderRadius, colors, fontSize } from '../../lib/theme';

type SmsTargetMode = 'category' | 'group' | 'individual';
type SmsGroupType = 'industry' | 'country';

type MemberType = { key: string; label: string; color: string };

type AdminSmsPanelProps = {
  styles: any;
  smsShowHistory: boolean;
  setSmsShowHistory: (value: boolean) => void;
  smsLogs: any[];
  smsMembers: any[];
  reportData: any;
  memberTypes: MemberType[];
  industries: string[];
  smsTargetMode: SmsTargetMode;
  setSmsTargetMode: (value: SmsTargetMode) => void;
  smsCategoryFilter: string | null;
  setSmsCategoryFilter: (value: string | null) => void;
  smsGroupType: SmsGroupType;
  setSmsGroupType: (value: SmsGroupType) => void;
  smsGroupValue: string | null;
  setSmsGroupValue: (value: string | null) => void;
  smsMessage: string;
  setSmsMessage: (value: string) => void;
  smsSelectedIds: Set<string>;
  setSmsSelectedIds: (value: Set<string>) => void;
  smsSearchQuery: string;
  setSmsSearchQuery: (value: string) => void;
  logBulkSmsMut: (args: {
    message: string;
    recipientCount: number;
    targetType: SmsTargetMode;
    targetLabel: string;
  }) => Promise<any>;
};

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function AdminSmsPanel({
  styles,
  smsShowHistory,
  setSmsShowHistory,
  smsLogs,
  smsMembers,
  reportData,
  memberTypes,
  industries,
  smsTargetMode,
  setSmsTargetMode,
  smsCategoryFilter,
  setSmsCategoryFilter,
  smsGroupType,
  setSmsGroupType,
  smsGroupValue,
  setSmsGroupValue,
  smsMessage,
  setSmsMessage,
  smsSelectedIds,
  setSmsSelectedIds,
  smsSearchQuery,
  setSmsSearchQuery,
  logBulkSmsMut,
}: AdminSmsPanelProps) {
  const allSmsMembers = smsMembers || [];
  const filteredSmsMembers = smsSearchQuery
    ? allSmsMembers.filter((m: any) => {
        const q = smsSearchQuery.toLowerCase();
        return (
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.phone && m.phone.includes(q)) ||
          (m.company && m.company.toLowerCase().includes(q))
        );
      })
    : allSmsMembers;

  const selectedCount = smsTargetMode === 'individual' ? smsSelectedIds.size : allSmsMembers.length;

  const handleSendBulkSms = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS Not Available', 'SMS is not available on this device.');
      return;
    }
    if (!smsMessage.trim()) {
      Alert.alert('Required', 'Please enter a message to send.');
      return;
    }

    let recipients: string[] = [];
    let targetLabel = '';

    if (smsTargetMode === 'individual') {
      const selected = (smsMembers || []).filter((m: any) => smsSelectedIds.has(m._id));
      recipients = selected.map((m: any) => m.phone).filter(Boolean);
      targetLabel = selected.map((m: any) => m.name || m.phone).slice(0, 5).join(', ');
      if (selected.length > 5) targetLabel += ` +${selected.length - 5} more`;
    } else {
      recipients = (smsMembers || []).map((m: any) => m.phone).filter(Boolean);
      if (smsTargetMode === 'category') {
        targetLabel = memberTypes.find((t) => t.key === smsCategoryFilter)?.label || 'All Members';
      } else {
        targetLabel = smsGroupValue || 'All';
      }
    }

    if (recipients.length === 0) {
      Alert.alert('No Recipients', 'No members with phone numbers found for this selection.');
      return;
    }

    Alert.alert(
      'Send Bulk SMS',
      `Send to ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}?\n\nMessage: "${smsMessage.substring(0, 80)}${smsMessage.length > 80 ? '...' : ''}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open SMS',
          onPress: async () => {
            try {
              const { result } = await SMS.sendSMSAsync(recipients, smsMessage);
              if (result === 'sent' || result === 'unknown') {
                await logBulkSmsMut({
                  message: smsMessage,
                  recipientCount: recipients.length,
                  targetType: smsTargetMode,
                  targetLabel,
                });
                Alert.alert('SMS Sent', `Message sent to ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}.`);
                setSmsMessage('');
              }
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to send SMS');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.searchRow}>
        <Text style={styles.sectionTitle}>Bulk SMS</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={() => setSmsShowHistory(!smsShowHistory)}>
          <Ionicons name={smsShowHistory ? 'create-outline' : 'time-outline'} size={16} color={colors.primary} />
          <Text style={styles.exportBtnText}>{smsShowHistory ? 'Compose' : 'History'}</Text>
        </TouchableOpacity>
      </View>

      {smsShowHistory ? (
        <FlatList
          data={smsLogs || []}
          keyExtractor={(item: any) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <View style={styles.memberCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName} numberOfLines={2}>
                  {item.message}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.primary }]}>{item.targetType}</Text>
                  </View>
                  <Text style={styles.memberSub}>{item.targetLabel}</Text>
                </View>
                <Text style={styles.memberSub}>
                  {item.recipientCount} recipient{item.recipientCount !== 1 ? 's' : ''} | {formatDate(item._creationTime)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSmsMessage(item.message);
                  setSmsShowHistory(false);
                }}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No SMS history yet</Text>}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Send To</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'category' as const, label: 'Category', icon: 'layers-outline' },
              { key: 'group' as const, label: 'Group', icon: 'people-outline' },
              { key: 'individual' as const, label: 'Individual', icon: 'person-outline' },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 12,
                  borderRadius: borderRadius.md,
                  backgroundColor: smsTargetMode === mode.key ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: smsTargetMode === mode.key ? colors.primary : colors.border,
                }}
                onPress={() => {
                  setSmsTargetMode(mode.key);
                  setSmsSelectedIds(new Set());
                  setSmsSearchQuery('');
                  setSmsCategoryFilter(null);
                }}
              >
                <Ionicons
                  name={mode.icon as any}
                  size={16}
                  color={smsTargetMode === mode.key ? '#000' : colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: '600',
                    color: smsTargetMode === mode.key ? '#000' : colors.textSecondary,
                  }}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {smsTargetMode === 'category' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Member Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                <TouchableOpacity style={[styles.chip, !smsCategoryFilter && styles.chipActive]} onPress={() => setSmsCategoryFilter(null)}>
                  <Text style={[styles.chipText, !smsCategoryFilter && styles.chipTextActive]}>All Members</Text>
                </TouchableOpacity>
                {memberTypes.filter((t) => t.key !== 'state_agencies').map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.chip, smsCategoryFilter === type.key && { backgroundColor: type.color, borderColor: type.color }]}
                    onPress={() => setSmsCategoryFilter(type.key)}
                  >
                    <Text style={[styles.chipText, smsCategoryFilter === type.key && { color: '#fff', fontWeight: '600' }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {smsTargetMode === 'group' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Group By</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TouchableOpacity
                  style={[styles.chip, smsGroupType === 'industry' && styles.chipActive]}
                  onPress={() => {
                    setSmsGroupType('industry');
                    setSmsGroupValue(null);
                  }}
                >
                  <Text style={[styles.chipText, smsGroupType === 'industry' && styles.chipTextActive]}>Industry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, smsGroupType === 'country' && styles.chipActive]}
                  onPress={() => {
                    setSmsGroupType('country');
                    setSmsGroupValue(null);
                  }}
                >
                  <Text style={[styles.chipText, smsGroupType === 'country' && styles.chipTextActive]}>Country</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.chip, !smsGroupValue && styles.chipActive]} onPress={() => setSmsGroupValue(null)}>
                  <Text style={[styles.chipText, !smsGroupValue && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                {smsGroupType === 'industry'
                  ? industries.map((ind) => (
                      <TouchableOpacity key={ind} style={[styles.chip, smsGroupValue === ind && styles.chipActive]} onPress={() => setSmsGroupValue(ind)}>
                        <Text style={[styles.chipText, smsGroupValue === ind && styles.chipTextActive]}>{ind}</Text>
                      </TouchableOpacity>
                    ))
                  : (reportData?.membersByCountry || []).map((c: any) => (
                      <TouchableOpacity key={c.country} style={[styles.chip, smsGroupValue === c.country && styles.chipActive]} onPress={() => setSmsGroupValue(c.country)}>
                        <Text style={[styles.chipText, smsGroupValue === c.country && styles.chipTextActive]}>{c.country}</Text>
                      </TouchableOpacity>
                    ))}
              </ScrollView>
            </View>
          )}

          {smsTargetMode === 'individual' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Filter by Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.chip, !smsCategoryFilter && styles.chipActive]}
                  onPress={() => {
                    setSmsCategoryFilter(null);
                    setSmsSelectedIds(new Set());
                  }}
                >
                  <Text style={[styles.chipText, !smsCategoryFilter && styles.chipTextActive]}>All Members</Text>
                </TouchableOpacity>
                {memberTypes.filter((t) => t.key !== 'state_agencies').map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.chip, smsCategoryFilter === type.key && { backgroundColor: type.color, borderColor: type.color }]}
                    onPress={() => {
                      setSmsCategoryFilter(type.key);
                      setSmsSelectedIds(new Set());
                    }}
                  >
                    <Text style={[styles.chipText, smsCategoryFilter === type.key && { color: '#fff', fontWeight: '600' }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={smsSearchQuery}
                  onChangeText={setSmsSearchQuery}
                  placeholder="Search members by name, phone, company..."
                  placeholderTextColor={colors.textMuted}
                />
                {smsSearchQuery ? (
                  <TouchableOpacity onPress={() => setSmsSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
                <Text style={styles.helpText}>{smsSelectedIds.size} selected of {allSmsMembers.length}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setSmsSelectedIds(new Set(filteredSmsMembers.map((m: any) => m._id)))}>
                    <Text style={{ fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' }}>Select All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSmsSelectedIds(new Set())}>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ maxHeight: 200 }}>
                <FlatList
                  data={filteredSmsMembers}
                  keyExtractor={(item: any) => item._id}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  renderItem={({ item }: any) => {
                    const isSelected = smsSelectedIds.has(item._id);
                    return (
                      <TouchableOpacity
                        style={[styles.memberCard, { marginBottom: 4, borderLeftWidth: 3, borderLeftColor: isSelected ? colors.primary : 'transparent' }]}
                        onPress={() => {
                          const next = new Set(smsSelectedIds);
                          if (isSelected) next.delete(item._id);
                          else next.add(item._id);
                          setSmsSelectedIds(next);
                        }}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={isSelected ? colors.primary : colors.textMuted}
                          style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.memberName}>{item.name || 'Unnamed'}</Text>
                          <Text style={styles.memberSub}>{item.phone}</Text>
                          {item.company && <Text style={styles.memberSub}>{item.company}</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={<Text style={styles.emptyText}>No members with phone numbers</Text>}
                />
              </View>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: selectedCount > 0 ? colors.success + '15' : colors.surface,
              borderRadius: borderRadius.md,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: selectedCount > 0 ? colors.success + '40' : colors.border,
            }}
          >
            <Ionicons name="people" size={20} color={selectedCount > 0 ? colors.success : colors.textMuted} />
            <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: selectedCount > 0 ? colors.success : colors.textMuted }}>
              {selectedCount} recipient{selectedCount !== 1 ? 's' : ''} with phone numbers
            </Text>
          </View>

          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.input, { height: 120, textAlignVertical: 'top', marginBottom: 4 }]}
            value={smsMessage}
            onChangeText={setSmsMessage}
            multiline
            placeholder="Type your message here..."
            placeholderTextColor={colors.textMuted}
            maxLength={480}
          />
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right', marginBottom: 16 }}>
            {smsMessage.length}/480 characters
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'center',
                opacity: selectedCount > 0 && smsMessage.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handleSendBulkSms}
            disabled={selectedCount === 0 || !smsMessage.trim()}
          >
            <Ionicons name="send" size={18} color="#000" />
            <Text style={styles.primaryBtnText}>Send SMS to {selectedCount} Recipient{selectedCount !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>

          <Text style={[styles.helpText, { marginTop: 12, textAlign: 'center' }]}>
            This will open your device's SMS app with the recipients and message pre-filled.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}
