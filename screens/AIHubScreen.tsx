import React, { useState, useCallback, useEffect } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
FlatList, Linking, Dimensions, SectionList, ActivityIndicator, Image,
Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { AFRICAN_VCS, Funder } from '../data/africanVCs';
import { AI_TOOLS, AITool } from '../data/aiTools';
import { AI_GUIDES, Guide } from '../data/aiGuides';
import { CASE_STUDIES, CaseStudy } from '../data/caseStudies';
import { CONFERENCES, ProcessedConference, COUNTRIES } from '../data/conferences';
import { SA_PODCASTS, Podcast, PODCAST_CATEGORIES } from '../data/podcasts';
import { AI_NEWS, AINewsArticle, AI_NEWS_CATEGORIES } from '../data/aiNews';
import { SETAS, SETA } from '../data/setas';
import { STATE_AGENCIES, StateAgency } from '../data/stateAgencies';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '../lib/mockBackend';
import { api } from '../convex/_generated/api';

const { width } = Dimensions.get('window');

type HubTab = 'funders' | 'tools' | 'guides' | 'cases' | 'conferences' | 'podcasts' | 'news' | 'setas' | 'stateAgencies';

// ==================== FUNDERS VIEW ====================
function FundersView() {
const [search, setSearch] = useState('');
const [selectedFunder, setSelectedFunder] = useState<Funder | null>(null);
const [filterCountry, setFilterCountry] = useState('All');
const countries = ['All', ...Array.from(new Set(AFRICAN_VCS.map(f => f.country))).sort()];
const filtered = AFRICAN_VCS.filter(f => {
const ms = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.firm.toLowerCase().includes(search.toLowerCase()) || f.focus.toLowerCase().includes(search.toLowerCase());
const mc = filterCountry === 'All' || f.country === filterCountry;
return ms && mc;
});
return (
<View style={{ flex: 1 }}>
<View style={styles.searchBar}>
<Ionicons name="search" size={18} color={colors.textMuted} />
<TextInput style={styles.searchInput} placeholder="Search funders, firms, or focus areas..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
{search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></TouchableOpacity> : null}
</View>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
{countries.map((c: any) => (
<TouchableOpacity key={c} style={[styles.filterChip, filterCountry === c && styles.filterChipActive]} onPress={() => setFilterCountry(c)}>
<Text style={[styles.filterChipText, filterCountry === c && styles.filterChipTextActive]}>{c}</Text>
</TouchableOpacity>
))}
</ScrollView>
<Text style={styles.resultCount}>{filtered.length} funders found</Text>
<FlatList
data={filtered}
keyExtractor={(item: any, i: number) => `${item.firm}-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
renderItem={({ item, index }: { item: any; index: number }) => (
<TouchableOpacity style={styles.funderCard} onPress={() => setSelectedFunder(item)}>
<View style={styles.funderRank}><Text style={styles.funderRankText}>{index + 1}</Text></View>
<View style={styles.funderInfo}>
<Text style={styles.funderName}>{item.name}</Text>
<Text style={styles.funderFirm}>{item.firm}</Text>
<View style={styles.funderMeta}>
<View style={styles.funderTag}><Ionicons name="location" size={10} color={colors.primary} /><Text style={styles.funderTagText}>{item.country}</Text></View>
<View style={styles.funderTag}><Ionicons name="trending-up" size={10} color={colors.accentLight} /><Text style={[styles.funderTagText, { color: colors.accentLight }]}>{item.stage}</Text></View>
</View>
</View>
<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedFunder} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedFunder(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>Funder Profile</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<View style={styles.funderDetailTop}>
<View style={styles.funderAvatar}><Text style={styles.funderAvatarText}>{selectedFunder?.name.charAt(0)}</Text></View>
<Text style={styles.funderDetailName}>{selectedFunder?.name}</Text>
<Text style={styles.funderDetailFirm}>{selectedFunder?.firm}</Text>
<View style={[styles.funderTag, { alignSelf: 'center', marginTop: spacing.sm }]}><Ionicons name="location" size={12} color={colors.primary} /><Text style={styles.funderTagText}>{selectedFunder?.country}</Text></View>
</View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>About</Text><Text style={styles.detailText}>{selectedFunder?.description}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Investment Focus</Text><Text style={styles.detailText}>{selectedFunder?.focus}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Stage</Text><View style={styles.stagePill}><Ionicons name="trending-up" size={14} color={colors.primary} /><Text style={styles.stagePillText}>{selectedFunder?.stage}</Text></View></View>
<View style={styles.detailSection}>
<Text style={styles.detailLabel}>Contact</Text>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${selectedFunder?.email}`)}><Ionicons name="mail" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedFunder?.email}</Text></TouchableOpacity>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://${selectedFunder?.website}`)}><Ionicons name="globe" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedFunder?.website}</Text></TouchableOpacity>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://${selectedFunder?.linkedin}`)}><Ionicons name="logo-linkedin" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedFunder?.linkedin}</Text></TouchableOpacity>
</View>
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== AI TOOLS VIEW ====================
function ToolsView() {
const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
const [filterCat, setFilterCat] = useState('All');
const categories = ['All', ...Array.from(new Set(AI_TOOLS.map(t => t.category))).sort()];
const filtered = AI_TOOLS.filter(t => filterCat === 'All' || t.category === filterCat);
return (
<View style={{ flex: 1 }}>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
{categories.map((c: any) => (
<TouchableOpacity key={c} style={[styles.filterChip, filterCat === c && styles.filterChipActive]} onPress={() => setFilterCat(c)}>
<Text style={[styles.filterChipText, filterCat === c && styles.filterChipTextActive]}>{c}</Text>
</TouchableOpacity>
))}
</ScrollView>
<FlatList data={filtered} keyExtractor={(item: any, i: number) => `${item.name}-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.toolCard} onPress={() => setSelectedTool(item)}>
<View style={styles.toolHeader}>
<View style={styles.toolIcon}><Ionicons name="construct" size={20} color={colors.primary} /></View>
<View style={{ flex: 1 }}><Text style={styles.toolName}>{item.name}</Text><Text style={styles.toolCategory}>{item.category}</Text></View>
<View style={styles.priceBadge}><Text style={styles.priceText}>{item.pricing.includes('Free') ? 'Free' : 'Paid'}</Text></View>
</View>
<Text style={styles.toolDesc} numberOfLines={2}>{item.description}</Text>
<View style={styles.featureRow}>
{item.features.slice(0, 3).map((f: any) => (<View key={f} style={styles.featureChip}><Text style={styles.featureChipText}>{f}</Text></View>))}
</View>
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedTool} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedTool(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>AI Tool</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<Text style={styles.funderDetailName}>{selectedTool?.name}</Text>
<View style={[styles.funderTag, { alignSelf: 'flex-start', marginTop: spacing.sm }]}><Text style={styles.funderTagText}>{selectedTool?.category}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Description</Text><Text style={styles.detailText}>{selectedTool?.description}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Best Use Case for African Entrepreneurs</Text><Text style={styles.detailText}>{selectedTool?.useCase}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Pricing</Text><Text style={[styles.detailText, { color: colors.primary, fontWeight: '600' }]}>{selectedTool?.pricing}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Key Features</Text>
<View style={styles.featureList}>{selectedTool?.features.map((f: any) => (<View key={f} style={styles.featureItem}><Ionicons name="checkmark-circle" size={16} color={colors.success} /><Text style={styles.featureItemText}>{f}</Text></View>))}</View>
</View>
<TouchableOpacity style={styles.visitButton} onPress={() => Linking.openURL(`https://${selectedTool?.website}`)}>
<Ionicons name="open-outline" size={18} color={colors.black} /><Text style={styles.visitButtonText}>Visit {selectedTool?.name}</Text>
</TouchableOpacity>
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== GUIDES VIEW ====================
function GuidesView() {
const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
return (
<View style={{ flex: 1 }}>
<FlatList data={AI_GUIDES} keyExtractor={(item: any, i: number) => `guide-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.md }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.guideCard} onPress={() => setSelectedGuide(item)}>
<View style={styles.guideIcon}><Ionicons name={item.icon as any} size={28} color={colors.primary} /></View>
<View style={styles.guideInfo}>
<View style={styles.guideBadges}><View style={styles.levelBadge}><Text style={styles.levelBadgeText}>{item.level}</Text></View><Text style={styles.guideDuration}>{item.duration}</Text></View>
<Text style={styles.guideTitle}>{item.title}</Text>
<Text style={styles.guideSummary} numberOfLines={2}>{item.summary}</Text>
</View>
<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedGuide} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedGuide(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>Guide</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<View style={styles.guideBadges}><View style={styles.levelBadge}><Text style={styles.levelBadgeText}>{selectedGuide?.level}</Text></View><Text style={styles.guideDuration}>{selectedGuide?.duration}</Text></View>
<Text style={[styles.funderDetailName, { marginTop: spacing.sm }]}>{selectedGuide?.title}</Text>
<Text style={[styles.detailText, { marginTop: spacing.sm, color: colors.primary }]}>{selectedGuide?.summary}</Text>
{selectedGuide?.sections.map((section: any, i: number) => (
<View key={i} style={styles.guideSection}><Text style={styles.guideSectionHeading}>{section.heading}</Text><Text style={styles.guideSectionContent}>{section.content}</Text></View>
))}
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== CASE STUDIES VIEW ====================
function CaseStudiesView() {
const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
return (
<View style={{ flex: 1 }}>
<FlatList data={CASE_STUDIES} keyExtractor={(item: any, i: number) => `case-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.md }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.caseCard} onPress={() => setSelectedCase(item)}>
<View style={styles.caseTop}><View style={styles.caseIndustryBadge}><Text style={styles.caseIndustryText}>{item.industry}</Text></View><Text style={styles.caseYear}>{item.year}</Text></View>
<Text style={styles.caseTitle}>{item.title}</Text>
<Text style={styles.caseCompany}>{item.company} • {item.country}</Text>
<Text style={styles.caseChallenge} numberOfLines={2}>{item.challenge}</Text>
<View style={styles.caseResults}>
{item.results.slice(0, 2).map((r: any, i: number) => (<View key={i} style={styles.caseResultItem}><Ionicons name="checkmark-circle" size={14} color={colors.success} /><Text style={styles.caseResultText} numberOfLines={1}>{r}</Text></View>))}
</View>
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedCase} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedCase(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>Case Study</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<View style={styles.caseTop}><View style={styles.caseIndustryBadge}><Text style={styles.caseIndustryText}>{selectedCase?.industry}</Text></View><Text style={styles.caseYear}>{selectedCase?.year}</Text></View>
<Text style={[styles.funderDetailName, { marginTop: spacing.sm }]}>{selectedCase?.title}</Text>
<Text style={[styles.funderDetailFirm, { marginTop: 4 }]}>{selectedCase?.company} • {selectedCase?.country}</Text>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Challenge</Text><Text style={styles.detailText}>{selectedCase?.challenge}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>AI Solution</Text><Text style={styles.detailText}>{selectedCase?.solution}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Results</Text>
{selectedCase?.results.map((r: any, i: number) => (<View key={i} style={[styles.caseResultItem, { marginBottom: 8 }]}><Ionicons name="checkmark-circle" size={16} color={colors.success} /><Text style={[styles.caseResultText, { flex: 1 }]}>{r}</Text></View>))}
</View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>AI Tools Used</Text>
<View style={styles.featureRow}>{selectedCase?.aiTools.map((t: any) => (<View key={t} style={styles.featureChip}><Text style={styles.featureChipText}>{t}</Text></View>))}</View>
</View>
<View style={styles.quoteBox}>
<Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
<Text style={styles.quoteText}>"{selectedCase?.quote}"</Text>
<Text style={styles.quoteAuthor}>— {selectedCase?.quoteAuthor}</Text>
</View>
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== CONFERENCES VIEW ====================
function getMonthLabel(dateStr: string): string {
  const months: Record<string, string> = {
    Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
    Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
  };
  if (dateStr.startsWith('TBA')) {
    const yearMatch = dateStr.match(/\d{4}/);
    return yearMatch ? `TBA ${yearMatch[0]}` : 'TBA';
  }
  const match = dateStr.match(/^([A-Za-z]+)\s+.*?(\d{4})/);
  if (match) {
    const monthName = months[match[1]] || match[1];
    return `${monthName} ${match[2]}`;
  }
  return 'Other';
}

function groupByMonth(conferences: ProcessedConference[]): { title: string; data: ProcessedConference[] }[] {
  const groups: Record<string, ProcessedConference[]> = {};
  conferences.forEach(c => {
    const label = c.isLive ? '🔴 Happening Now' : c.passed ? 'Returning in 2027' : getMonthLabel(c.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });
  // Ensure "Happening Now" is always first
  const entries = Object.entries(groups);
  const liveIdx = entries.findIndex(([title]) => title === '🔴 Happening Now');
  if (liveIdx > 0) {
    const [live] = entries.splice(liveIdx, 1);
    entries.unshift(live);
  }
  return entries.map(([title, data]) => ({ title, data }));
}

const DELEGATE_TYPES = [
  { key: 'full_delegate', label: 'Full Delegate' },
  { key: 'day_pass', label: 'Day Pass' },
  { key: 'virtual', label: 'Virtual Attendee' },
  { key: 'speaker', label: 'Speaker' },
  { key: 'exhibitor', label: 'Exhibitor' },
] as const;

function ConferenceDetailModal({ conference, onClose }: { conference: ProcessedConference; onClose: () => void }) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [delegateType, setDelegateType] = useState<string>('full_delegate');
  const [specialReqs, setSpecialReqs] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const existingRequest = useQuery(api.conferenceRequests.getMyRequest, { conferenceName: conference.name });
  const submitRequest = useMutation(api.conferenceRequests.submitRequest);
  const cancelRequest = useMutation(api.conferenceRequests.cancelRequest);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter your full name and email address.');
      return;
    }
    setSubmitting(true);
    try {
      await submitRequest({
        conferenceName: conference.name,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        designation: designation.trim() || undefined,
        delegateType: delegateType as any,
        specialRequirements: specialReqs.trim() || undefined,
      });
      setShowRequestForm(false);
      Alert.alert('Request Submitted', 'Your participation request has been submitted. You will be notified once it is reviewed.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!existingRequest) return;
    Alert.alert('Cancel Request', 'Are you sure you want to cancel your participation request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try { await cancelRequest({ requestId: existingRequest._id }); } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to cancel request.');
          }
        }
      },
    ]);
  };

  const statusColor = existingRequest?.status === 'approved' ? colors.success : existingRequest?.status === 'declined' ? colors.error : colors.warning;
  const statusLabel = existingRequest?.status === 'approved' ? 'Approved' : existingRequest?.status === 'declined' ? 'Declined' : 'Pending Review';
  const info = conference.delegateInfo;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Conference</Text><View style={{ width: 28 }} />
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          {conference.passed && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B18', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.md, marginBottom: spacing.md, gap: 8 }}>
              <Ionicons name="checkmark-done-circle" size={16} color="#FF6B6B" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.sm, color: '#FF6B6B', fontWeight: '700' }}>This conference has passed</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>Originally: {conference.originalDate} — Returning in 2027</Text>
              </View>
            </View>
          )}
          {conference.isLive && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00C85318', paddingHorizontal: 12, paddingVertical: 10, borderRadius: borderRadius.md, marginBottom: spacing.md, gap: 8, borderWidth: 1, borderColor: '#00C85340' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#00C853' }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.sm, color: '#00C853', fontWeight: '800', letterSpacing: 0.5 }}>LIVE — Happening Now</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>This conference is currently taking place today</Text>
              </View>
            </View>
          )}
          <View style={styles.confHeader}>
            <View style={styles.confIcon}><Feather name={conference.icon as any} size={22} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.confName}>{conference.name}</Text><Text style={styles.confFocus}>{conference.focus} • {conference.country}</Text></View>
            <View style={styles.confAttendeeBadge}><Ionicons name="people" size={10} color={colors.primary} /><Text style={styles.confAttendeeText}>{conference.attendees}</Text></View>
          </View>
          <Text style={[styles.confDesc, { marginBottom: spacing.md }]}>{conference.description}</Text>
          <View style={[styles.confFooter, { marginBottom: spacing.lg }]}>
            <View style={[styles.confDateBadge, conference.isLive && { backgroundColor: '#00C85320' }]}>
              <Ionicons name={conference.isLive ? 'radio' : 'calendar'} size={12} color={conference.isLive ? '#00C853' : colors.primary} />
              <Text style={[styles.confDateText, conference.isLive && { color: '#00C853', fontWeight: '700' }]}>{conference.date}</Text>
            </View>
            <View style={styles.confMetaItem}><Ionicons name="location" size={12} color={colors.textSecondary} /><Text style={styles.confMetaText}>{conference.location}</Text></View>
          </View>

          {/* Delegate & Participation Details */}
          <View style={cdStyles.section}>
            <Text style={cdStyles.sectionTitle}>Delegate & Participation Details</Text>
            {info?.delegateFee && (
              <View style={cdStyles.infoRow}>
                <Ionicons name="pricetag" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}><Text style={cdStyles.infoLabel}>Delegate Fee</Text><Text style={cdStyles.infoValue}>{info.delegateFee}</Text></View>
              </View>
            )}
            {info?.earlyBirdDeadline && (
              <View style={cdStyles.infoRow}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}><Text style={cdStyles.infoLabel}>Early Bird Deadline</Text><Text style={cdStyles.infoValue}>{info.earlyBirdDeadline}</Text></View>
              </View>
            )}
            {info?.delegateTypes && info.delegateTypes.length > 0 && (
              <View style={cdStyles.infoRow}>
                <Ionicons name="ticket" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={cdStyles.infoLabel}>Delegate Types</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {info.delegateTypes.map(t => (<View key={t} style={cdStyles.typeBadge}><Text style={cdStyles.typeBadgeText}>{t}</Text></View>))}
                  </View>
                </View>
              </View>
            )}
            {info?.includes && info.includes.length > 0 && (
              <View style={cdStyles.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={cdStyles.infoLabel}>Includes</Text>
                  {info.includes.map((item, i) => (<Text key={i} style={cdStyles.includeItem}>• {item}</Text>))}
                </View>
              </View>
            )}
            {!info && (
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 }}>
                Visit the conference website below for full delegate packages, registration fees, and participation options.
              </Text>
            )}
          </View>

          {/* Website Button */}
          <TouchableOpacity style={cdStyles.websiteBtn} onPress={() => Linking.openURL(conference.website)}>
            <Ionicons name="globe-outline" size={18} color={colors.black} />
            <Text style={cdStyles.websiteBtnText}>Visit Conference Website</Text>
            <Ionicons name="open-outline" size={16} color={colors.black} />
          </TouchableOpacity>

          {/* Existing Request Status */}
          {existingRequest && (
            <View style={[cdStyles.statusCard, { borderColor: statusColor + '40' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name={existingRequest.status === 'approved' ? 'checkmark-circle' : existingRequest.status === 'declined' ? 'close-circle' : 'hourglass'} size={20} color={statusColor} />
                <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: statusColor }}>Request {statusLabel}</Text>
              </View>
              <Text style={cdStyles.statusDetail}>Delegate Type: {DELEGATE_TYPES.find(d => d.key === existingRequest.delegateType)?.label}</Text>
              <Text style={cdStyles.statusDetail}>Name: {existingRequest.fullName}</Text>
              <Text style={cdStyles.statusDetail}>Email: {existingRequest.email}</Text>
              {existingRequest.status === 'pending' && (
                <TouchableOpacity style={cdStyles.cancelBtn} onPress={handleCancel}>
                  <Text style={{ fontSize: fontSize.xs, color: colors.error, fontWeight: '600' }}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Request to Participate */}
          {!existingRequest && !conference.passed && !showRequestForm && (
            <TouchableOpacity style={cdStyles.requestBtn} onPress={() => setShowRequestForm(true)}>
              <Ionicons name="hand-left" size={18} color={colors.white} />
              <Text style={cdStyles.requestBtnText}>Request to Participate</Text>
            </TouchableOpacity>
          )}

          {showRequestForm && (
            <View style={cdStyles.formCard}>
              <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: 4 }}>Participation Request</Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md }}>Fill in your details to request participation.</Text>

              <Text style={cdStyles.fieldLabel}>Full Name *</Text>
              <TextInput style={cdStyles.input} placeholder="Your full name" placeholderTextColor={colors.textMuted} value={fullName} onChangeText={setFullName} />

              <Text style={cdStyles.fieldLabel}>Email Address *</Text>
              <TextInput style={cdStyles.input} placeholder="your@email.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={cdStyles.fieldLabel}>Phone Number</Text>
              <TextInput style={cdStyles.input} placeholder="+27 xxx xxx xxxx" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={cdStyles.fieldLabel}>Company / Organisation</Text>
              <TextInput style={cdStyles.input} placeholder="Your company name" placeholderTextColor={colors.textMuted} value={company} onChangeText={setCompany} />

              <Text style={cdStyles.fieldLabel}>Designation / Role</Text>
              <TextInput style={cdStyles.input} placeholder="e.g. CEO, Director, Engineer" placeholderTextColor={colors.textMuted} value={designation} onChangeText={setDesignation} />

              <Text style={cdStyles.fieldLabel}>Delegate Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                {DELEGATE_TYPES.map(dt => (
                  <TouchableOpacity key={dt.key} style={[cdStyles.delegateChip, delegateType === dt.key && cdStyles.delegateChipActive]} onPress={() => setDelegateType(dt.key)}>
                    <Text style={[cdStyles.delegateChipText, delegateType === dt.key && cdStyles.delegateChipTextActive]}>{dt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={cdStyles.fieldLabel}>Special Requirements</Text>
              <TextInput style={[cdStyles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Dietary, accessibility needs, etc." placeholderTextColor={colors.textMuted} value={specialReqs} onChangeText={setSpecialReqs} multiline />

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.surfaceLight, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center' }} onPress={() => setShowRequestForm(false)}>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 2, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center', opacity: submitting ? 0.6 : 1 }} onPress={handleSubmit} disabled={submitting}>
                  {submitting ? <ActivityIndicator size="small" color={colors.black} /> : <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.black }}>Submit Request</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView></View>
    </Modal>
  );
}

function ConferencesView() {
const [selectedConference, setSelectedConference] = useState<ProcessedConference | null>(null);
const [filterFocus, setFilterFocus] = useState('All');
const [filterCountry, setFilterCountry] = useState('All');
const [search, setSearch] = useState('');
const focuses = ['All', 'AI', 'Technology', 'Investment', 'Entrepreneurship', 'Infrastructure'];
const filtered = CONFERENCES.filter(c => {
const mf = filterFocus === 'All' || c.focus === filterFocus;
const mc = filterCountry === 'All' || c.country === filterCountry;
const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
return mf && mc && ms;
});
const sections = groupByMonth(filtered);
return (
<View style={{ flex: 1 }}>
<View style={styles.searchBar}>
<Ionicons name="search" size={18} color={colors.textMuted} />
<TextInput style={styles.searchInput} placeholder="Search conferences..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
{search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></TouchableOpacity> : null}
</View>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.confFilterSection} contentContainerStyle={styles.confFilterChips}>
{focuses.map((f: any) => (<TouchableOpacity key={f} style={[styles.confChip, filterFocus === f && styles.confChipActive]} onPress={() => setFilterFocus(f)}><Text style={[styles.confChipText, filterFocus === f && styles.confChipTextActive]}>{f}</Text></TouchableOpacity>))}
</ScrollView>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.confFilterSection} contentContainerStyle={styles.confFilterChips}>
{COUNTRIES.map((c: any) => (<TouchableOpacity key={c} style={[styles.confChip, filterCountry === c && styles.confChipActive]} onPress={() => setFilterCountry(c)}><Text style={[styles.confChipText, filterCountry === c && styles.confChipTextActive]}>{c}</Text></TouchableOpacity>))}
</ScrollView>
<Text style={styles.resultCount}>{filtered.length} conferences found</Text>
<SectionList
sections={sections}
keyExtractor={(item: any, i: number) => `${item.name}-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
stickySectionHeadersEnabled={false}
renderSectionHeader={({ section }: { section: { title: string; data: ProcessedConference[] } }) => {
  const isLiveSection = section.title === '🔴 Happening Now';
  const isPastSection = section.title === 'Returning in 2027';
  return (
    <View style={[styles.confSectionHeader, isLiveSection && { backgroundColor: '#00C85320', borderColor: '#00C853', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: 12, paddingVertical: 8 }]}>
      <Ionicons name={isPastSection ? 'time' : isLiveSection ? 'radio' : 'calendar'} size={16} color={isPastSection ? colors.textMuted : isLiveSection ? '#00C853' : colors.primary} />
      <Text style={[styles.confSectionTitle, isPastSection && { color: colors.textMuted }, isLiveSection && { color: '#00C853', fontWeight: '800' }]}>{section.title}</Text>
      <View style={[styles.confSectionCount, isLiveSection && { backgroundColor: '#00C853' }]}><Text style={[styles.confSectionCountText, isLiveSection && { color: '#fff' }]}>{section.data.length}</Text></View>
    </View>
  );
}}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={[styles.confCard, item.passed && { borderColor: colors.borderLight, opacity: 0.75 }, item.isLive && { borderColor: '#00C853', borderWidth: 1.5, shadowColor: '#00C853', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }]} onPress={() => setSelectedConference(item)}>
{item.isLive && (
<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00C85318', paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.sm, marginBottom: spacing.sm, gap: 6 }}>
<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C853' }} />
<Text style={{ fontSize: fontSize.xs, color: '#00C853', fontWeight: '800', letterSpacing: 1 }}>LIVE NOW</Text>
<Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginLeft: 'auto' }}>Happening today</Text>
</View>
)}
{item.passed && (
<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B18', paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.sm, marginBottom: spacing.sm, gap: 6 }}>
<Ionicons name="checkmark-done-circle" size={14} color="#FF6B6B" />
<Text style={{ fontSize: fontSize.xs, color: '#FF6B6B', fontWeight: '700' }}>Passed</Text>
<Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginLeft: 'auto' }}>Was: {item.originalDate}</Text>
</View>
)}
<View style={styles.confHeader}>
<View style={[styles.confIcon, item.passed && { opacity: 0.5 }]}><Feather name={item.icon as any} size={22} color={item.isLive ? '#00C853' : colors.primary} /></View>
<View style={{ flex: 1 }}><Text style={[styles.confName, item.passed && { color: colors.textMuted }]}>{item.name}</Text><Text style={styles.confFocus}>{item.focus} • {item.country}</Text></View>
<View style={styles.confAttendeeBadge}><Ionicons name="people" size={10} color={colors.primary} /><Text style={styles.confAttendeeText}>{item.attendees}</Text></View>
</View>
<Text style={styles.confDesc} numberOfLines={2}>{item.description}</Text>
<View style={styles.confFooter}>
<View style={[styles.confDateBadge, item.passed && { backgroundColor: '#FF6B6B18' }, item.isLive && { backgroundColor: '#00C85320' }]}><Ionicons name={item.passed ? 'time' : item.isLive ? 'radio' : 'calendar'} size={12} color={item.passed ? '#FF6B6B' : item.isLive ? '#00C853' : colors.primary} /><Text style={[styles.confDateText, item.passed && { color: '#FF6B6B' }, item.isLive && { color: '#00C853', fontWeight: '700' }]}>{item.passed ? 'TBA 2027' : item.date}</Text></View>
<View style={styles.confMetaItem}><Ionicons name="location" size={12} color={colors.textSecondary} /><Text style={styles.confMetaText}>{item.location}</Text></View>
</View>
</TouchableOpacity>
)}
/>
{selectedConference && <ConferenceDetailModal conference={selectedConference} onClose={() => setSelectedConference(null)} />}
</View>
);
}

// ==================== PODCASTS VIEW ====================
function PodcastsView() {
const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
const [filterCat, setFilterCat] = useState('All');
const [search, setSearch] = useState('');
const filtered = SA_PODCASTS.filter(p => {
const mc = filterCat === 'All' || p.category === filterCat;
const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.host.toLowerCase().includes(search.toLowerCase()) || p.focus.toLowerCase().includes(search.toLowerCase());
return mc && ms;
});
return (
<View style={{ flex: 1 }}>
<View style={styles.searchBar}>
<Ionicons name="search" size={18} color={colors.textMuted} />
<TextInput style={styles.searchInput} placeholder="Search podcasts..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
{search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></TouchableOpacity> : null}
</View>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
{PODCAST_CATEGORIES.map((c: any) => (
<TouchableOpacity key={c} style={[styles.filterChip, filterCat === c && styles.filterChipActive]} onPress={() => setFilterCat(c)}>
<Text style={[styles.filterChipText, filterCat === c && styles.filterChipTextActive]}>{c}</Text>
</TouchableOpacity>
))}
</ScrollView>
<Text style={styles.resultCount}>{filtered.length} podcasts found</Text>
<FlatList data={filtered} keyExtractor={(item: any, i: number) => `${item.name}-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.podcastCard} onPress={() => setSelectedPodcast(item)}>
<View style={styles.podcastHeader}>
<View style={[styles.podcastIcon, { backgroundColor: colors.primary + '15' }]}><Ionicons name="mic" size={20} color={colors.primary} /></View>
<View style={{ flex: 1 }}><Text style={styles.podcastName}>{item.name}</Text><Text style={styles.podcastHost}>{item.host}</Text></View>
<View style={[styles.podcastCatBadge, { backgroundColor: colors.primary + '15' }]}><Text style={{ fontSize: 10, color: colors.primary, fontWeight: '600' }}>{item.category}</Text></View>
</View>
<Text style={styles.podcastDesc} numberOfLines={2}>{item.description}</Text>
<View style={styles.podcastFooter}>
<View style={styles.podcastFocusTag}><Text style={styles.podcastFocusText}>{item.focus}</Text></View>
{item.website ? <TouchableOpacity onPress={() => Linking.openURL(item.website)}><Ionicons name="open-outline" size={16} color={colors.primary} /></TouchableOpacity> : null}
</View>
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedPodcast} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedPodcast(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>Podcast</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<Text style={styles.funderDetailName}>{selectedPodcast?.name}</Text>
<Text style={[styles.funderDetailFirm, { marginTop: 4 }]}>Hosted by {selectedPodcast?.host}</Text>
<View style={[styles.funderTag, { alignSelf: 'flex-start', marginTop: spacing.sm }]}><Text style={styles.funderTagText}>{selectedPodcast?.category}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Description</Text><Text style={styles.detailText}>{selectedPodcast?.description}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Focus</Text><Text style={styles.detailText}>{selectedPodcast?.focus}</Text></View>
{selectedPodcast?.contact ? <View style={styles.detailSection}><Text style={styles.detailLabel}>Contact</Text><TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${selectedPodcast?.contact}`)}><Ionicons name="mail" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedPodcast?.contact}</Text></TouchableOpacity></View> : null}
<TouchableOpacity style={styles.visitButton} onPress={() => selectedPodcast?.website && Linking.openURL(selectedPodcast.website)}>
<Ionicons name="open-outline" size={18} color={colors.black} /><Text style={styles.visitButtonText}>Listen Now</Text>
</TouchableOpacity>
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== NEWS VIEW ====================
function NewsView() {
const [filterCat, setFilterCat] = useState('All');
const filtered = AI_NEWS.filter(n => filterCat === 'All' || n.category === filterCat);
return (
<View style={{ flex: 1 }}>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
{AI_NEWS_CATEGORIES.map((c: any) => (
<TouchableOpacity key={c} style={[styles.filterChip, filterCat === c && styles.filterChipActive]} onPress={() => setFilterCat(c)}>
<Text style={[styles.filterChipText, filterCat === c && styles.filterChipTextActive]}>{c}</Text>
</TouchableOpacity>
))}
</ScrollView>
<FlatList data={filtered} keyExtractor={(item: any, i: number) => `news-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.caseCard} onPress={() => Linking.openURL(item.url)}>
<View style={styles.caseTop}><View style={styles.caseIndustryBadge}><Text style={styles.caseIndustryText}>{item.category}</Text></View><Text style={styles.caseYear}>{item.date}</Text></View>
<Text style={styles.caseTitle}>{item.title}</Text>
<Text style={styles.caseCompany}>{item.source}</Text>
<Text style={styles.caseChallenge} numberOfLines={3}>{item.summary}</Text>
</TouchableOpacity>
)}
/>
</View>
);
}

// ==================== SETAs VIEW ====================
function SETAsView() {
const [selectedSETA, setSelectedSETA] = useState<SETA | null>(null);
return (
<View style={{ flex: 1 }}>
<FlatList data={SETAS} keyExtractor={(item: any, i: number) => `seta-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.md }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.toolCard} onPress={() => setSelectedSETA(item)}>
<View style={styles.toolHeader}>
<View style={styles.toolIcon}><Ionicons name="school" size={20} color={colors.primary} /></View>
<View style={{ flex: 1 }}><Text style={styles.toolName}>{item.name}</Text><Text style={styles.toolCategory}>{item.sector}</Text></View>
</View>
<Text style={styles.toolDesc} numberOfLines={2}>{item.description}</Text>
<View style={styles.featureRow}>
<View style={styles.featureChip}><Text style={styles.featureChipText}>{item.location}</Text></View>
<View style={styles.featureChip}><Text style={styles.featureChipText}>{item.country}</Text></View>
</View>
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedSETA} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedSETA(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>SETA</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<Text style={styles.funderDetailName}>{selectedSETA?.name}</Text>
<View style={[styles.funderTag, { alignSelf: 'flex-start', marginTop: spacing.sm }]}><Text style={styles.funderTagText}>{selectedSETA?.sector}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Description</Text><Text style={styles.detailText}>{selectedSETA?.description}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Focus</Text><Text style={styles.detailText}>{selectedSETA?.focus}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailText}>{selectedSETA?.location}, {selectedSETA?.country}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Contact</Text>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${selectedSETA?.email}`)}><Ionicons name="mail" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedSETA?.email}</Text></TouchableOpacity>
{selectedSETA?.phone ? <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${selectedSETA?.phone}`)}><Ionicons name="call" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedSETA?.phone}</Text></TouchableOpacity> : null}
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://${selectedSETA?.website}`)}><Ionicons name="globe" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedSETA?.website}</Text></TouchableOpacity>
</View>
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== STATE AGENCIES VIEW ====================
function StateAgenciesView() {
const [selectedAgency, setSelectedAgency] = useState<StateAgency | null>(null);
const [search, setSearch] = useState('');
const filtered = STATE_AGENCIES.filter(a => {
return !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.acronym.toLowerCase().includes(search.toLowerCase()) || a.focus.toLowerCase().includes(search.toLowerCase());
});
return (
<View style={{ flex: 1 }}>
<View style={styles.searchBar}>
<Ionicons name="search" size={18} color={colors.textMuted} />
<TextInput style={styles.searchInput} placeholder="Search agencies..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
{search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></TouchableOpacity> : null}
</View>
<Text style={styles.resultCount}>{filtered.length} agencies found</Text>
<FlatList data={filtered} keyExtractor={(item: any, i: number) => `agency-${i}`}
contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
renderItem={({ item }: { item: any }) => (
<TouchableOpacity style={styles.toolCard} onPress={() => setSelectedAgency(item)}>
<View style={styles.toolHeader}>
<View style={styles.toolIcon}><Ionicons name="business" size={20} color={colors.primary} /></View>
<View style={{ flex: 1 }}><Text style={styles.toolName}>{item.acronym}</Text><Text style={styles.toolCategory}>{item.type}</Text></View>
</View>
<Text style={[styles.toolName, { marginBottom: 4 }]}>{item.name}</Text>
<Text style={styles.toolDesc} numberOfLines={2}>{item.description}</Text>
<View style={styles.featureRow}>
<View style={styles.featureChip}><Text style={styles.featureChipText}>{item.city}</Text></View>
<View style={styles.featureChip}><Text style={styles.featureChipText}>{item.focus}</Text></View>
</View>
</TouchableOpacity>
)}
/>
<Modal visible={!!selectedAgency} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}><SafeAreaView style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedAgency(null)}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
<Text style={styles.modalHeaderTitle}>State Agency</Text><View style={{ width: 28 }} />
</View>
<ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
<Text style={styles.funderDetailName}>{selectedAgency?.name}</Text>
<Text style={[styles.funderDetailFirm, { marginTop: 4 }]}>{selectedAgency?.acronym} • {selectedAgency?.type}</Text>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Description</Text><Text style={styles.detailText}>{selectedAgency?.description}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Focus</Text><Text style={styles.detailText}>{selectedAgency?.focus}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Leadership</Text><Text style={styles.detailText}>{selectedAgency?.ceoName}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailText}>{selectedAgency?.address}, {selectedAgency?.city}</Text></View>
<View style={styles.detailSection}><Text style={styles.detailLabel}>Contact</Text>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${selectedAgency?.email}`)}><Ionicons name="mail" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedAgency?.email}</Text></TouchableOpacity>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${selectedAgency?.phone}`)}><Ionicons name="call" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedAgency?.phone}</Text></TouchableOpacity>
<TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://${selectedAgency?.website}`)}><Ionicons name="globe" size={18} color={colors.primary} /><Text style={styles.contactText}>{selectedAgency?.website}</Text></TouchableOpacity>
</View>
<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView></View>
</Modal>
</View>
);
}

// ==================== MAIN COMPONENT ====================
const TAB_CONFIG: { key: HubTab; label: string; icon: string; count: number }[] = [
{ key: 'funders', label: 'Funders', icon: 'cash', count: AFRICAN_VCS.length },
{ key: 'tools', label: 'AI Tools', icon: 'construct', count: AI_TOOLS.length },
{ key: 'guides', label: 'Guides', icon: 'book', count: AI_GUIDES.length },
{ key: 'cases', label: 'Cases', icon: 'briefcase', count: CASE_STUDIES.length },
{ key: 'conferences', label: 'Conferences', icon: 'calendar', count: CONFERENCES.length },
{ key: 'podcasts', label: 'Podcasts', icon: 'mic', count: SA_PODCASTS.length },
{ key: 'news', label: 'News', icon: 'newspaper', count: AI_NEWS.length },
{ key: 'setas', label: 'SETAs', icon: 'school', count: SETAS.length },
{ key: 'stateAgencies', label: 'Agencies', icon: 'business', count: STATE_AGENCIES.length },
];

export default function AIHubScreen() {
const route = useRoute();
const initialTab = (route.params as any)?.tab as HubTab | undefined;
const [activeTab, setActiveTab] = useState<HubTab>(initialTab || 'funders');

useEffect(() => {
  if (initialTab) {
    setActiveTab(initialTab);
  }
}, [initialTab]);

return (
<View style={styles.container}>
<SafeAreaView style={styles.safeArea}>
<View style={styles.header}>
<Text style={styles.headerTitle}>AI Hub</Text>
<Text style={styles.headerSubtitle}>Resources for African Entrepreneurs</Text>
</View>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
{TAB_CONFIG.map(tab => (
<TouchableOpacity key={tab.key} style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]} onPress={() => setActiveTab(tab.key)}>
<Ionicons name={tab.icon as any} size={14} color={activeTab === tab.key ? colors.black : colors.textSecondary} />
<Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
<View style={[styles.tabCount, activeTab === tab.key && styles.tabCountActive]}><Text style={[styles.tabCountText, activeTab === tab.key && styles.tabCountTextActive]}>{tab.count}</Text></View>
</TouchableOpacity>
))}
</ScrollView>
{activeTab === 'funders' && <FundersView />}
{activeTab === 'tools' && <ToolsView />}
{activeTab === 'guides' && <GuidesView />}
{activeTab === 'cases' && <CaseStudiesView />}
{activeTab === 'conferences' && <ConferencesView />}
{activeTab === 'podcasts' && <PodcastsView />}
{activeTab === 'news' && <NewsView />}
{activeTab === 'setas' && <SETAsView />}
{activeTab === 'stateAgencies' && <StateAgenciesView />}
</SafeAreaView>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: colors.background },
safeArea: { flex: 1 },
header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
headerSubtitle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 2 },
tabScroll: { maxHeight: 52, marginTop: spacing.sm, marginBottom: spacing.xs },
tabContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
tabButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
tabButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
tabLabel: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600' },
tabLabelActive: { color: colors.black },
tabCount: { backgroundColor: colors.surfaceLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
tabCountActive: { backgroundColor: colors.black + '20' },
tabCountText: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
tabCountTextActive: { color: colors.black },
searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },
filterScroll: { height: 44, marginTop: spacing.sm, marginBottom: spacing.xs },
filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
filterChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surfaceLight },
filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
filterChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
filterChipTextActive: { color: colors.black },
resultCount: { fontSize: fontSize.xs, color: colors.textMuted, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
funderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
funderRank: { width: 32, height: 32, borderRadius: borderRadius.sm, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
funderRankText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
funderInfo: { flex: 1 },
funderName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
funderFirm: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '500' },
funderMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
funderTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
funderTagText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '500' },
modalContainer: { flex: 1, backgroundColor: colors.background },
modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
modalHeaderTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
modalBody: { flex: 1, paddingHorizontal: spacing.lg },
funderDetailTop: { alignItems: 'center', paddingVertical: spacing.xl },
funderAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
funderAvatarText: { fontSize: 28, fontWeight: '800', color: colors.black },
funderDetailName: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, textAlign: 'center' },
funderDetailFirm: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600', marginTop: 4, textAlign: 'center' },
detailSection: { marginTop: spacing.lg },
detailLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
detailText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
stagePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary + '15', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignSelf: 'flex-start' },
stagePillText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
contactText: { fontSize: fontSize.sm, color: colors.primary },
visitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.xl },
visitButtonText: { fontSize: fontSize.md, fontWeight: '700', color: colors.black },
toolCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
toolHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
toolIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
toolName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
toolCategory: { fontSize: fontSize.xs, color: colors.textSecondary },
toolDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
priceBadge: { backgroundColor: colors.success + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
priceText: { fontSize: fontSize.xs, color: colors.success, fontWeight: '600' },
featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
featureChip: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
featureChipText: { fontSize: fontSize.xs, color: colors.textSecondary },
featureList: { gap: spacing.sm },
featureItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
featureItemText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
guideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
guideIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
guideInfo: { flex: 1 },
guideBadges: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
levelBadge: { backgroundColor: colors.accent + '30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm },
levelBadgeText: { fontSize: 10, color: colors.accentLight, fontWeight: '700', textTransform: 'uppercase' },
guideDuration: { fontSize: fontSize.xs, color: colors.textMuted },
guideTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
guideSummary: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
guideSection: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
guideSectionHeading: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
guideSectionContent: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
caseCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
caseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
caseIndustryBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
caseIndustryText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
caseYear: { fontSize: fontSize.xs, color: colors.textMuted },
caseTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
caseCompany: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '500', marginTop: 2 },
caseChallenge: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
caseResults: { marginTop: spacing.sm, gap: 4 },
caseResultItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
caseResultText: { fontSize: fontSize.sm, color: colors.textSecondary },
quoteBox: { backgroundColor: colors.primary + '10', borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.primary },
quoteText: { fontSize: fontSize.sm, color: colors.text, fontStyle: 'italic', lineHeight: 22 },
quoteAuthor: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
confCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
confHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
confIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
confName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
confFocus: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '500' },
confDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
confFooter: { flexDirection: 'row', gap: spacing.md },
confMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
confMetaText: { fontSize: fontSize.xs, color: colors.textSecondary },
confAttendeeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.sm },
confAttendeeText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
confFilterSection: { height: 38, marginTop: spacing.xs },
confFilterChips: { paddingHorizontal: spacing.lg, gap: spacing.xs },
confChip: { paddingHorizontal: spacing.sm + 2, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surfaceLight },
confChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
confChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '500' },
confChipTextActive: { color: colors.black, fontWeight: '600' },
confDateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
confDateText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
confSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm, paddingVertical: spacing.sm },
confSectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, flex: 1 },
confSectionCount: { backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm },
confSectionCountText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
podcastCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
podcastHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
podcastIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
podcastName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
podcastHost: { fontSize: fontSize.xs, color: colors.textSecondary },
podcastCatBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.sm, marginLeft: 'auto' },
podcastDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
podcastFocusTag: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm, alignSelf: 'flex-start' },
podcastFocusText: { fontSize: fontSize.xs, color: colors.textSecondary },
podcastFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
podcastContactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
podcastContactChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm },
podcastContactText: { fontSize: 11, color: colors.primary, maxWidth: 150 },
podcastCategoryLabel: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
podcastCategoryText: { fontSize: 10, color: colors.textSecondary },
funderIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});

const cdStyles = StyleSheet.create({
  section: { marginTop: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: spacing.sm },
  infoLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600', marginTop: 2 },
  typeBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
  typeBadgeText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  includeItem: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
  websiteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, marginBottom: spacing.md },
  websiteBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.black },
  statusCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1 },
  statusDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  cancelBtn: { marginTop: spacing.sm, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.error + '40', borderRadius: borderRadius.sm },
  requestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.accent, paddingVertical: 14, borderRadius: borderRadius.md, marginBottom: spacing.md },
  requestBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
  formCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.primary + '30' },
  fieldLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600', marginBottom: 4, marginTop: spacing.sm },
  input: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontSize.sm, color: colors.text },
  delegateChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.sm, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  delegateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  delegateChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600' },
  delegateChipTextActive: { color: colors.black, fontWeight: '700' },
});
