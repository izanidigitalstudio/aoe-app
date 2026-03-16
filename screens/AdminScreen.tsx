import React, { useState, useCallback, useEffect } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
TextInput,
Modal,
Alert,
FlatList,
Linking,
ActivityIndicator,
KeyboardAvoidingView,
Platform,
Dimensions,
Clipboard,
Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '../lib/mockBackend';
import { api } from '../convex/_generated/api';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Contacts from 'expo-contacts';
import * as DocumentPicker from 'expo-document-picker';
import { STATE_AGENCIES, StateAgency } from '../data/stateAgencies';

const { width } = Dimensions.get('window');

type AdminTab = 'overview' | 'members' | 'events' | 'payments' | 'reports' | 'crm';
type MemberSubTab = 'list' | 'add' | 'bulk' | 'csv' | 'contacts';

interface AdminScreenProps {
onBack: () => void;
}

const MEMBER_TYPES = [
  { key: 'platinum_network', label: 'Platinum Network', icon: 'diamond', color: '#8B5CF6' },
  { key: 'esd_corporate', label: 'ESD Corporate', icon: 'business', color: '#0EA5E9' },
  { key: 'business_community', label: 'Business Community', icon: 'people-circle', color: '#F59E0B' },
  { key: 'entrepreneurs', label: 'Entrepreneurs', icon: 'rocket', color: '#10B981' },
  { key: 'short_term_funders', label: 'Short Term Funders', icon: 'cash', color: '#EF4444' },
  { key: 'startups', label: 'Tech StartUps', icon: 'lightbulb-outline', color: '#FF9500' },
  { key: 'angel_investors', label: 'Angel Investors', icon: 'trending-up', color: '#6366F1' },
  { key: 'setas', label: 'SETAs', icon: 'school', color: '#14B8A6' },
  { key: 'state_agencies', label: 'State Agencies', icon: 'building', color: '#8B5CF6' },
] as const;

const INDUSTRIES = [
'FinTech', 'AgriTech', 'HealthTech', 'EdTech', 'CleanTech',
'E-Commerce', 'Logistics', 'Media', 'Real Estate', 'Manufacturing',
'Energy', 'Construction', 'Legal Tech', 'Fashion', 'Mining',
'Tourism', 'Cybersecurity', 'Venture Capital', 'Biotech', 'Other',
];

const PAYMENT_METHODS = ['bank_transfer', 'mobile_money', 'cash', 'stripe', 'other'];
const NOTE_TYPES = ['general', 'follow_up', 'meeting', 'call', 'email'];

const IMPORT_FIELDS = [
  { key: 'skip', label: '-- Skip Column --' },
  { key: 'name', label: 'Name / First Name' },
  { key: 'surname', label: 'Surname / Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role / Job Title' },
  { key: 'industry', label: 'Industry' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'contactPhone', label: 'Phone' },
  { key: 'contactEmail', label: 'Contact Email' },
  { key: 'website', label: 'Website' },
  { key: 'bio', label: 'Bio' },
  { key: 'linkedIn', label: 'LinkedIn URL' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'currentProjects', label: 'Current Projects' },
] as const;

const AUTO_DETECT_MAP: Record<string, string> = {
  'name': 'name', 'full name': 'name', 'fullname': 'name', 'first name': 'name', 'firstname': 'name', 'member name': 'name', 'contact name': 'name', 'person': 'name',
  'surname': 'surname', 'last name': 'surname', 'lastname': 'surname', 'family name': 'surname', 'familyname': 'surname', 'second name': 'surname',
  'email': 'email', 'e-mail': 'email', 'email address': 'email', 'mail': 'email', 'emailaddress': 'email',
  'company': 'company', 'organisation': 'company', 'organization': 'company', 'org': 'company', 'company name': 'company', 'business': 'company', 'firm': 'company',
  'role': 'role', 'title': 'role', 'job title': 'role', 'jobtitle': 'role', 'position': 'role', 'designation': 'role', 'job': 'role',
  'industry': 'industry', 'sector': 'industry', 'field': 'industry',
  'country': 'country', 'nation': 'country', 'location': 'country',
  'city': 'city', 'town': 'city',
  'phone': 'contactPhone', 'telephone': 'contactPhone', 'tel': 'contactPhone', 'mobile': 'contactPhone', 'cell': 'contactPhone', 'phone number': 'contactPhone', 'contact phone': 'contactPhone', 'phonenumber': 'contactPhone',
  'contact email': 'contactEmail', 'secondary email': 'contactEmail', 'alt email': 'contactEmail',
  'website': 'website', 'web': 'website', 'url': 'website', 'site': 'website', 'webpage': 'website',
  'bio': 'bio', 'about': 'bio', 'description': 'bio', 'biography': 'bio',
  'linkedin': 'linkedIn', 'linkedin url': 'linkedIn', 'linked in': 'linkedIn',
  'twitter': 'twitter', 'twitter handle': 'twitter', 'x': 'twitter',
  'achievements': 'achievements', 'accomplishments': 'achievements',
  'projects': 'currentProjects', 'current projects': 'currentProjects',
};

export default function AdminScreen({ onBack }: AdminScreenProps) {
const [activeTab, setActiveTab] = useState<AdminTab>('overview');
const [memberSubTab, setMemberSubTab] = useState<MemberSubTab>('list');
const [searchQuery, setSearchQuery] = useState('');
const [showAddMember, setShowAddMember] = useState(false);
const [showBulkAdd, setShowBulkAdd] = useState(false);
const [showEditMember, setShowEditMember] = useState(false);
const [showMemberActions, setShowMemberActions] = useState(false);
const [showCreateEvent, setShowCreateEvent] = useState(false);
const [showEditEvent, setShowEditEvent] = useState(false);
const [showEventRsvps, setShowEventRsvps] = useState(false);
const [showRecordPayment, setShowRecordPayment] = useState(false);
const [showPaymentActions, setShowPaymentActions] = useState(false);
const [showMemberNotes, setShowMemberNotes] = useState(false);
const [showAddNote, setShowAddNote] = useState(false);
const [selectedMember, setSelectedMember] = useState<any>(null);
const [selectedEvent, setSelectedEvent] = useState<any>(null);
const [selectedPayment, setSelectedPayment] = useState<any>(null);
const [paymentFilter, setPaymentFilter] = useState<string>('all');
const [crmSearchQuery, setCrmSearchQuery] = useState('');

// Member category state
const [selectedMemberType, setSelectedMemberType] = useState<string | null>(null);
const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

// Form state - Add Member
const [newName, setNewName] = useState('');
const [newEmail, setNewEmail] = useState('');
const [newCompany, setNewCompany] = useState('');
const [newRole, setNewRole] = useState('');
const [newIndustry, setNewIndustry] = useState('');
const [newCountry, setNewCountry] = useState('');
const [newCity, setNewCity] = useState('');
const [newPhone, setNewPhone] = useState('');
const [newBio, setNewBio] = useState('');
const [newAchievements, setNewAchievements] = useState('');
const [newCurrentProjects, setNewCurrentProjects] = useState('');
const [newLinkedIn, setNewLinkedIn] = useState('');
const [newWebsite, setNewWebsite] = useState('');

// Bulk add state
const [bulkText, setBulkText] = useState('');

// Field mapping state
const [showFieldMapping, setShowFieldMapping] = useState(false);
const [importedHeaders, setImportedHeaders] = useState<string[]>([]);
const [importedRows, setImportedRows] = useState<string[][]>([]);
const [fieldMappings, setFieldMappings] = useState<Record<number, string>>({});
const [mappingPickerIndex, setMappingPickerIndex] = useState<number | null>(null);

// Event form state
const [evtTitle, setEvtTitle] = useState('');
const [evtDesc, setEvtDesc] = useState('');
const [evtCity, setEvtCity] = useState('');
const [evtCountry, setEvtCountry] = useState('');
const [evtVenue, setEvtVenue] = useState('');
const [evtCapacity, setEvtCapacity] = useState('30');
const [evtPrice, setEvtPrice] = useState('');
const [evtCurrency, setEvtCurrency] = useState('BWP');

const [evtSponsors, setEvtSponsors] = useState<Array<{ name: string; tier: string; logo?: string; website?: string }>>([]);
const [sponsorName, setSponsorName] = useState('');
const [sponsorTier, setSponsorTier] = useState('gold');
const [sponsorWebsite, setSponsorWebsite] = useState('');

// Payment form state
const [payAmount, setPayAmount] = useState('');
const [payCurrency, setPayCurrency] = useState('BWP');
const [payMethod, setPayMethod] = useState('bank_transfer');
const [payRef, setPayRef] = useState('');
const [payNotes, setPayNotes] = useState('');
const [payEventId, setPayEventId] = useState<any>(null);
const [payUserId, setPayUserId] = useState<any>(null);

// CRM Note form
const [noteText, setNoteText] = useState('');
const [noteType, setNoteType] = useState('general');

// Guest speaker form state
const [showAddSpeaker, setShowAddSpeaker] = useState(false);
const [speakerName, setSpeakerName] = useState('');
const [speakerEmail, setSpeakerEmail] = useState('');
const [speakerPhone, setSpeakerPhone] = useState('');
const [speakerDesignation, setSpeakerDesignation] = useState('');
const [speakerCompany, setSpeakerCompany] = useState('');
const [speakerStatus, setSpeakerStatus] = useState('invited');
const [speakerNotes, setSpeakerNotes] = useState('');
const [rsvpViewTab, setRsvpViewTab] = useState<'rsvps' | 'speakers' | 'invited' | 'paid' | 'all'>('rsvps');

// Invited guest form state
const [showAddInvitedGuest, setShowAddInvitedGuest] = useState(false);
const [invGuestName, setInvGuestName] = useState('');
const [invGuestEmail, setInvGuestEmail] = useState('');
const [invGuestPhone, setInvGuestPhone] = useState('');
const [invGuestDesignation, setInvGuestDesignation] = useState('');
const [invGuestCompany, setInvGuestCompany] = useState('');
const [invGuestStatus, setInvGuestStatus] = useState('invited');
const [invGuestNotes, setInvGuestNotes] = useState('');
const [editingInvGuestIndex, setEditingInvGuestIndex] = useState<number | null>(null);

// Queries
const stats = useQuery(api.admin.getStats);
const members = useQuery(api.admin.listAllMembers, { search: searchQuery || undefined, memberType: selectedMemberType || undefined, industry: (selectedIndustry && selectedIndustry !== '__all__') ? selectedIndustry : undefined });
const industryCounts = useQuery(
  api.admin.getMemberIndustryCounts,
  selectedMemberType === 'business_community' ? { memberType: 'business_community' } : 'skip'
);
const crmMembers = useQuery(api.admin.listAllMembers, { search: crmSearchQuery || undefined });
const events = useQuery(api.events.listEvents, {});
const eventRsvps = useQuery(
api.admin.getEventRsvps,
selectedEvent ? { eventId: selectedEvent._id } : 'skip'
);

// Keep selectedEvent in sync with live query data
useEffect(() => {
  if (selectedEvent && events) {
    const updated = events.find((e: any) => e._id === selectedEvent._id);
    if (updated && JSON.stringify(updated) !== JSON.stringify(selectedEvent)) {
      setSelectedEvent(updated);
    }
  }
}, [events]);

const payments = useQuery(api.admin.listPayments, 
paymentFilter === 'all' ? {} : { status: paymentFilter }
);
const reportData = useQuery(api.admin.getReportData);
const memberNotes = useQuery(
api.admin.getMemberNotes,
selectedMember ? { memberId: selectedMember._id } : 'skip'
);

// Mutations
const addMember = useMutation(api.admin.addMember);
const bulkAddMembers = useMutation(api.admin.bulkAddMembers);
const updateMember = useMutation(api.admin.updateMember);
const deleteMember = useMutation(api.admin.deleteMember);
const createEvent = useMutation(api.admin.createEvent);
const updateEvent = useMutation(api.admin.updateEvent);
const deleteEvent = useMutation(api.admin.deleteEvent);
const reorderEvent = useMutation(api.admin.reorderEvent);
const sortEventsByDate = useMutation(api.admin.sortEventsByDate);
const updateRsvp = useMutation(api.admin.updateRsvpStatus);
const recordPayment = useMutation(api.admin.recordPayment);
const updatePaymentMut = useMutation(api.admin.updatePayment);
const deletePaymentMut = useMutation(api.admin.deletePayment);
const addNote = useMutation(api.admin.addNote);
const deleteNoteMut = useMutation(api.admin.deleteNote);

// Guest Speaker mutations
const addGuestSpeakerMut = useMutation(api.admin.addGuestSpeaker);
const updateGuestSpeakerMut = useMutation(api.admin.updateGuestSpeaker);
const removeGuestSpeakerMut = useMutation(api.admin.removeGuestSpeaker);

// Invited Guest mutations
const addInvitedGuestMut = useMutation(api.admin.addInvitedGuest);
const updateInvitedGuestMut = useMutation(api.admin.updateInvitedGuest);
const removeInvitedGuestMut = useMutation(api.admin.removeInvitedGuest);

// Guest speaker edit state
const [editingSpeakerIndex, setEditingSpeakerIndex] = useState<number | null>(null);
const [selectedAgency, setSelectedAgency] = useState<StateAgency | null>(null);

const clearSpeakerForm = () => {
  setSpeakerName(''); setSpeakerEmail(''); setSpeakerPhone('');
  setSpeakerDesignation(''); setSpeakerCompany(''); setSpeakerStatus('invited');
  setSpeakerNotes(''); setEditingSpeakerIndex(null);
};

const handleAddOrEditSpeaker = async () => {
  if (!speakerName.trim()) {
    Alert.alert('Required', 'Speaker name is required');
    return;
  }
  if (!selectedEvent) return;
  try {
    if (editingSpeakerIndex !== null) {
      await updateGuestSpeakerMut({
        eventId: selectedEvent._id,
        index: editingSpeakerIndex,
        name: speakerName.trim(),
        email: speakerEmail.trim() || undefined,
        phone: speakerPhone.trim() || undefined,
        designation: speakerDesignation.trim() || undefined,
        company: speakerCompany.trim() || undefined,
        status: speakerStatus,
        notes: speakerNotes.trim() || undefined,
      });
      Alert.alert('Updated', 'Speaker details updated');
    } else {
      await addGuestSpeakerMut({
        eventId: selectedEvent._id,
        name: speakerName.trim(),
        email: speakerEmail.trim() || undefined,
        phone: speakerPhone.trim() || undefined,
        designation: speakerDesignation.trim() || undefined,
        company: speakerCompany.trim() || undefined,
        status: speakerStatus,
        notes: speakerNotes.trim() || undefined,
      });
      Alert.alert('Added', `${speakerName} added as guest speaker`);
    }
    clearSpeakerForm();
    setShowAddSpeaker(false);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleRemoveSpeaker = (index: number, name: string) => {
  if (!selectedEvent) return;
  Alert.alert('Remove Speaker', `Remove ${name} from guest speakers?`, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await removeGuestSpeakerMut({ eventId: selectedEvent._id, index });
        } catch (e: any) { Alert.alert('Error', e.message); }
      },
    },
  ]);
};

const openEditSpeaker = (speaker: any, index: number) => {
  setSpeakerName(speaker.name || '');
  setSpeakerEmail(speaker.email || '');
  setSpeakerPhone(speaker.phone || '');
  setSpeakerDesignation(speaker.designation || '');
  setSpeakerCompany(speaker.company || '');
  setSpeakerStatus(speaker.status || 'invited');
  setSpeakerNotes(speaker.notes || '');
  setEditingSpeakerIndex(index);
  setShowAddSpeaker(true);
};

const clearMemberForm = () => {
  setNewName(''); setNewEmail(''); setNewCompany(''); setNewRole('');
  setNewIndustry(''); setNewCountry(''); setNewCity(''); setNewPhone('');
  setNewBio(''); setNewAchievements(''); setNewCurrentProjects(''); setNewLinkedIn('');
  setNewWebsite('');
};

// ─── Invited Guest form functions ───
const clearInvGuestForm = () => {
  setInvGuestName(''); setInvGuestEmail(''); setInvGuestPhone('');
  setInvGuestDesignation(''); setInvGuestCompany(''); setInvGuestStatus('invited');
  setInvGuestNotes(''); setEditingInvGuestIndex(null);
};

const handleAddOrEditInvGuest = async () => {
  if (!invGuestName.trim()) { Alert.alert('Required', 'Name is required'); return; }
  if (!selectedEvent) return;
  try {
    if (editingInvGuestIndex !== null) {
      await updateInvitedGuestMut({
        eventId: selectedEvent._id,
        index: editingInvGuestIndex,
        name: invGuestName.trim(),
        email: invGuestEmail.trim() || undefined,
        phone: invGuestPhone.trim() || undefined,
        designation: invGuestDesignation.trim() || undefined,
        company: invGuestCompany.trim() || undefined,
        status: invGuestStatus,
        notes: invGuestNotes.trim() || undefined,
      });
      Alert.alert('Updated', 'Invited guest updated');
    } else {
      await addInvitedGuestMut({
        eventId: selectedEvent._id,
        name: invGuestName.trim(),
        email: invGuestEmail.trim() || undefined,
        phone: invGuestPhone.trim() || undefined,
        designation: invGuestDesignation.trim() || undefined,
        company: invGuestCompany.trim() || undefined,
        status: invGuestStatus,
        notes: invGuestNotes.trim() || undefined,
      });
      Alert.alert('Added', 'Invited guest added');
    }
    clearInvGuestForm();
    setShowAddInvitedGuest(false);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleRemoveInvGuest = (index: number, name: string) => {
  if (!selectedEvent) return;
  Alert.alert('Remove Guest', `Remove ${name} from invited guests?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => {
      try { await removeInvitedGuestMut({ eventId: selectedEvent._id, index }); }
      catch (e: any) { Alert.alert('Error', e.message); }
    }},
  ]);
};

const openEditInvGuest = (guest: any, index: number) => {
  setInvGuestName(guest.name || '');
  setInvGuestEmail(guest.email || '');
  setInvGuestPhone(guest.phone || '');
  setInvGuestDesignation(guest.designation || '');
  setInvGuestCompany(guest.company || '');
  setInvGuestStatus(guest.status || 'invited');
  setInvGuestNotes(guest.notes || '');
  setEditingInvGuestIndex(index);
  setShowAddInvitedGuest(true);
};

const handleAddMember = async () => {
  if (!newName.trim() || !newEmail.trim()) {
    Alert.alert('Required', 'Name and email are required');
    return;
  }
  try {
    await addMember({
      name: newName.trim(),
      email: newEmail.trim(),
      company: newCompany.trim() || undefined,
      role: newRole.trim() || undefined,
      industry: newIndustry || undefined,
      country: newCountry.trim() || undefined,
      city: newCity.trim() || undefined,
      bio: newBio.trim() || undefined,
      contactPhone: newPhone.trim() || undefined,
      linkedIn: newLinkedIn.trim() || undefined,
      achievements: newAchievements.trim() || undefined,
      currentProjects: newCurrentProjects.trim() || undefined,
      memberType: selectedMemberType || undefined,
    });
    Alert.alert('Success', `${newName} has been added`);
    clearMemberForm();
    setShowAddMember(false);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleUpdateMember = async () => {
  if (!selectedMember) return;
  try {
    await updateMember({
      memberId: selectedMember._id,
      name: newName.trim() || undefined,
      email: newEmail.trim() || undefined,
      company: newCompany.trim() || undefined,
      role: newRole.trim() || undefined,
      industry: newIndustry || undefined,
      country: newCountry.trim() || undefined,
      city: newCity.trim() || undefined,
      bio: newBio.trim() || undefined,
      contactPhone: newPhone.trim() || undefined,
      linkedIn: newLinkedIn.trim() || undefined,
      achievements: newAchievements.trim() || undefined,
      currentProjects: newCurrentProjects.trim() || undefined,
      memberType: selectedMemberType || undefined,
    });
    Alert.alert('Updated', 'Member updated successfully');
    setShowEditMember(false);
    clearMemberForm();
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleDeleteMember = (member: any) => {
  Alert.alert('Delete Member', `Delete ${member.name}? This cannot be undone.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await deleteMember({ memberId: member._id }); }
      catch (e: any) { Alert.alert('Error', e.message); }
    }},
  ]);
};

const handleBulkAdd = async () => {
  if (!bulkText.trim()) return;
  try {
    const lines = bulkText.trim().split('\n').filter((l: string) => l.trim());
    const parsed = parseCSVLines(lines);
    if (parsed.length === 0) {
      Alert.alert('Error', 'No valid entries found.');
      return;
    }
    // Check if first row looks like headers
    const firstRow = parsed[0];
    const looksLikeHeaders = firstRow.some((cell: string) => {
      const lower = cell.toLowerCase().trim();
      return AUTO_DETECT_MAP[lower] !== undefined;
    });
    if (looksLikeHeaders) {
      setImportedHeaders(firstRow.map((h: string) => h.trim()));
      setImportedRows(parsed.slice(1));
      const mappings: Record<number, string> = {};
      firstRow.forEach((header: string, idx: number) => {
        const match = AUTO_DETECT_MAP[header.toLowerCase().trim()];
        if (match) mappings[idx] = match;
        else mappings[idx] = 'skip';
      });
      setFieldMappings(mappings);
    } else {
      // No headers detected - use column indices as headers
      const headers = firstRow.map((_: string, idx: number) => `Column ${idx + 1}`);
      setImportedHeaders(headers);
      setImportedRows(parsed);
      const mappings: Record<number, string> = {};
      headers.forEach((_: string, idx: number) => { mappings[idx] = 'skip'; });
      setFieldMappings(mappings);
    }
    setMappingPickerIndex(null);
    setShowFieldMapping(true);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleConfirmImport = async () => {
  const mappedFields = Object.values(fieldMappings);
  if ((!mappedFields.includes('name') && !mappedFields.includes('surname')) || !mappedFields.includes('email')) {
    Alert.alert('Required Mappings', 'You must map at least a Name (or Surname) and Email column to import members.');
    return;
  }
  try {
    const members = importedRows.map((row: string[]) => {
      const member: any = { memberType: selectedMemberType || undefined };
      Object.entries(fieldMappings).forEach(([colIdxStr, fieldKey]) => {
        if (fieldKey === 'skip') return;
        const colIdx = parseInt(colIdxStr);
        const value = row[colIdx]?.trim();
        if (value) member[fieldKey] = value;
      });
      // Combine name + surname into full name
      if (member.surname) {
        member.name = [member.name, member.surname].filter(Boolean).join(' ').trim();
        delete member.surname;
      }
      return member;
    }).filter((m: any) => m.name && m.email);

    if (members.length === 0) {
      Alert.alert('Error', 'No valid members found after mapping. Ensure rows have name and email values.');
      return;
    }

    const result = await bulkAddMembers({ members });
    Alert.alert('Done', `Added: ${result.added}, Skipped (duplicates): ${result.skipped}`);
    setShowFieldMapping(false);
    setBulkText('');
    setImportedHeaders([]);
    setImportedRows([]);
    setFieldMappings({});
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const openEditMember = (member: any) => {
  setSelectedMember(member);
  setNewName(member.name || '');
  setNewEmail(member.email || '');
  setNewCompany(member.company || '');
  setNewRole(member.role || '');
  setNewIndustry(member.industry || '');
  setNewCountry(member.country || '');
  setNewCity(member.city || '');
  setNewPhone(member.contactPhone || '');
  setNewBio(member.bio || '');
  setNewAchievements(member.achievements || '');
  setNewCurrentProjects(member.currentProjects || '');
  setNewLinkedIn(member.linkedIn || '');
  setNewWebsite(member.website || '');
  setShowEditMember(true);
};

const clearEventForm = () => {
  setEvtTitle(''); setEvtDesc(''); setEvtCity(''); setEvtCountry('');
  setEvtVenue(''); setEvtCapacity('30'); setEvtPrice(''); setEvtCurrency('BWP');
  setEvtSponsors([]);
};

const handleCreateEvent = async () => {
  if (!evtTitle.trim() || !evtCity.trim() || !evtCountry.trim() || !evtVenue.trim()) {
    Alert.alert('Required', 'Title, city, country, and venue are required');
    return;
  }
  try {
    await createEvent({
      title: evtTitle.trim(),
      description: evtDesc.trim(),
      city: evtCity.trim(),
      country: evtCountry.trim(),
      venue: evtVenue.trim(),
      date: Date.now() + 7 * 24 * 60 * 60 * 1000,
      capacity: parseInt(evtCapacity) || 30,
      ticketPrice: evtPrice ? parseFloat(evtPrice) : undefined,
      currency: evtCurrency || undefined,
      sponsors: evtSponsors.length > 0 ? evtSponsors : undefined,
    });
    Alert.alert('Created', 'Event created successfully');
    clearEventForm();
    setShowCreateEvent(false);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleUpdateEvent = async () => {
  if (!selectedEvent) return;
  try {
    await updateEvent({
      eventId: selectedEvent._id,
      title: evtTitle.trim() || undefined,
      description: evtDesc.trim() || undefined,
      city: evtCity.trim() || undefined,
      country: evtCountry.trim() || undefined,
      venue: evtVenue.trim() || undefined,
      capacity: parseInt(evtCapacity) || undefined,
      ticketPrice: evtPrice ? parseFloat(evtPrice) : undefined,
      currency: evtCurrency || undefined,
      sponsors: evtSponsors.length > 0 ? evtSponsors : undefined,
    });
    Alert.alert('Updated', 'Event updated');
    setShowEditEvent(false);
    clearEventForm();
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleDeleteEvent = (event: any) => {
  Alert.alert('Delete Event', `Delete "${event.title}"? All RSVPs and payments will also be deleted.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await deleteEvent({ eventId: event._id }); }
      catch (e: any) { Alert.alert('Error', e.message); }
    }},
  ]);
};

const openEditEvent = (event: any) => {
  setSelectedEvent(event);
  setEvtTitle(event.title || '');
  setEvtDesc(event.description || '');
  setEvtCity(event.city || '');
  setEvtCountry(event.country || '');
  setEvtVenue(event.venue || '');
  setEvtCapacity(String(event.capacity || 30));
  setEvtPrice(event.ticketPrice ? String(event.ticketPrice) : '');
  setEvtCurrency(event.currency || 'BWP');
  setEvtSponsors(event.sponsors || []);
  setShowEditEvent(true);
};

const handleRecordPayment = async () => {
  if (!payAmount) {
    Alert.alert('Required', 'Amount is required');
    return;
  }
  try {
    await recordPayment({
      eventId: payEventId || undefined,
      userId: payUserId || undefined,
      amount: parseFloat(payAmount),
      currency: payCurrency,
      method: payMethod,
      status: 'confirmed',
      reference: payRef.trim() || undefined,
      notes: payNotes.trim() || undefined,
    });
    Alert.alert('Recorded', 'Payment recorded');
    setShowRecordPayment(false);
    setPayAmount(''); setPayRef(''); setPayNotes(''); setPayEventId(null); setPayUserId(null);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleAddNote = async () => {
  if (!noteText.trim() || !selectedMember) return;
  try {
    await addNote({
      memberId: selectedMember._id,
      note: noteText.trim(),
      type: noteType,
    });
    setNoteText('');
    setShowAddNote(false);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatCurrency = (amount: number, currency: string) => `${currency} ${amount.toLocaleString()}`;

// ─── RENDER HELPERS ───

const exportToCSV = async (type: 'invited' | 'speakers' | 'rsvps' | 'paid' | 'all') => {
  if (!selectedEvent) return;
  let csvContent = '';
  let fileName = '';

  if (type === 'invited') {
    const guests = selectedEvent.invitedGuests || [];
    if (guests.length === 0) { Alert.alert('No Data', 'No invited guests to export.'); return; }
    csvContent = 'Name,Email,Phone,Designation,Company,Status,Notes\n';
    guests.forEach((g: any) => {
      csvContent += `"${g.name || ''}","${g.email || ''}","${g.phone || ''}","${g.designation || ''}","${g.company || ''}","${g.status || ''}","${g.notes || ''}"\n`;
    });
    fileName = `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Invited_Guests.csv`;
  } else if (type === 'speakers') {
    const speakers = selectedEvent.guestSpeakers || [];
    if (speakers.length === 0) { Alert.alert('No Data', 'No speakers to export.'); return; }
    csvContent = 'Name,Email,Phone,Designation,Company,Status,Notes\n';
    speakers.forEach((s: any) => {
      csvContent += `"${s.name || ''}","${s.email || ''}","${s.phone || ''}","${s.designation || ''}","${s.company || ''}","${s.status || ''}","${s.notes || ''}"\n`;
    });
    fileName = `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Speakers.csv`;
  } else if (type === 'paid') {
    const paidRsvps = (eventRsvps || []).filter((r: any) => r.paymentStatus === 'paid');
    if (paidRsvps.length === 0) { Alert.alert('No Data', 'No paid attendees to export.'); return; }
    csvContent = 'Name,Email,Company,Phone,Country,RSVP Status,Payment Status\n';
    paidRsvps.forEach((r: any) => {
      csvContent += `"${r.userName || ''}","${r.userEmail || ''}","${r.userCompany || ''}","${r.userPhone || ''}","${r.userCountry || ''}","${r.status || ''}","${r.paymentStatus || ''}"\n`;
    });
    fileName = `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Paid_Attendees.csv`;
  } else if (type === 'all') {
    const rsvps = (eventRsvps || []).map((r: any) => ({ type: 'RSVP', name: r.userName || '', email: r.userEmail || '', company: r.userCompany || '', phone: r.userPhone || '', status: r.status || '', paymentStatus: r.paymentStatus || '' }));
    const speakers = (selectedEvent.guestSpeakers || []).map((s: any) => ({ type: 'Speaker', name: s.name || '', email: s.email || '', company: s.company || '', phone: s.phone || '', status: s.status || '', paymentStatus: '' }));
    const invited = (selectedEvent.invitedGuests || []).map((g: any) => ({ type: 'Invited', name: g.name || '', email: g.email || '', company: g.company || '', phone: g.phone || '', status: g.status || '', paymentStatus: '' }));
    const all = [...rsvps, ...speakers, ...invited];
    if (all.length === 0) { Alert.alert('No Data', 'No people to export.'); return; }
    csvContent = 'Type,Name,Email,Company,Phone,Status,Payment Status\n';
    all.forEach((p) => {
      csvContent += `"${p.type}","${p.name}","${p.email}","${p.company}","${p.phone}","${p.status}","${p.paymentStatus}"\n`;
    });
    fileName = `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_All_People.csv`;
  } else {
    const rsvps = eventRsvps || [];
    if (rsvps.length === 0) { Alert.alert('No Data', 'No RSVPs to export.'); return; }
    csvContent = 'Name,Email,Company,Phone,Country,Status,Payment Status\n';
    rsvps.forEach((r: any) => {
      csvContent += `"${r.userName || ''}","${r.userEmail || ''}","${r.userCompany || ''}","${r.userPhone || ''}","${r.userCountry || ''}","${r.status || ''}","${r.paymentStatus || ''}"\n`;
    });
    fileName = `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_RSVPs.csv`;
  }

  try {
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: `Export ${type}` });
    } else {
      Alert.alert('Exported', `File saved as ${fileName}`);
    }
  } catch (e) {
    Alert.alert('Error', 'Failed to export. Please try again.');
  }
};

const renderInput = (label: string, value: string, setter: (v: string) => void, opts?: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, opts?.multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={setter}
      placeholder={opts?.placeholder || label}
      placeholderTextColor={colors.textMuted}
      multiline={opts?.multiline}
      keyboardType={opts?.keyboardType}
    />
  </View>
);

const renderChipPicker = (label: string, options: string[], selected: string, onSelect: (v: string) => void) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── TAB: OVERVIEW ───
const renderOverview = () => (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    <Text style={styles.sectionTitle}>Dashboard</Text>
    {stats ? (
      <View style={styles.statsGrid}>
        {[
          { label: 'Members', value: stats.totalMembers, icon: 'people' },
          { label: 'Events', value: stats.totalEvents, icon: 'calendar' },
          { label: 'RSVPs', value: stats.totalRsvps, icon: 'checkmark-circle' },
          { label: 'Revenue', value: formatCurrency(stats.totalRevenue, 'BWP'), icon: 'cash' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    ) : <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}

    {stats && (
      <View style={styles.statsGrid}>
        {[
          { label: 'Confirmed', value: stats.confirmedPayments, color: colors.success },
          { label: 'Pending', value: stats.pendingPayments, color: colors.warning },
        ].map((stat, i) => (
          <View key={i} style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: stat.color }]}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label} Payments</Text>
          </View>
        ))}
      </View>
    )}
  </ScrollView>
);

// ─── TAB: MEMBERS ───
const handleCSVImport = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain'] });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri);
    const lines = content.trim().split('\n').filter((l: string) => l.trim());
    if (lines.length === 0) {
      Alert.alert('Error', 'File is empty');
      return;
    }
    const parsed = parseCSVLines(lines);
    if (parsed.length < 2) {
      Alert.alert('Error', 'File must have a header row and at least one data row');
      return;
    }
    // First row = headers
    const headers = parsed[0].map((h: string) => h.trim());
    const rows = parsed.slice(1);
    setImportedHeaders(headers);
    setImportedRows(rows);
    // Auto-detect mappings from header names
    const mappings: Record<number, string> = {};
    headers.forEach((header: string, idx: number) => {
      const match = AUTO_DETECT_MAP[header.toLowerCase().trim()];
      if (match) mappings[idx] = match;
      else mappings[idx] = 'skip';
    });
    setFieldMappings(mappings);
    setMappingPickerIndex(null);
    setShowFieldMapping(true);
  } catch (e: any) {
    Alert.alert('Error', 'Failed to read file');
  }
};

const handleContactsImport = async () => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant contacts permission to import');
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Company, Contacts.Fields.JobTitle],
    });
    if (!data || data.length === 0) {
      Alert.alert('No Contacts', 'No contacts found on this device');
      return;
    }
    // Filter contacts that have a name and email
    const validContacts = data.filter((c: any) => c.name && c.emails && c.emails.length > 0).slice(0, 200);
    if (validContacts.length === 0) {
      Alert.alert('No Valid Contacts', 'No contacts with both name and email found');
      return;
    }
    Alert.alert('Import Contacts', `Found ${validContacts.length} contacts with email. Import them?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Import', onPress: async () => {
        try {
          const members = validContacts.map((c: any) => ({
            name: c.name || '',
            email: c.emails[0].email || '',
            company: c.company || undefined,
            role: c.jobTitle || undefined,
            contactPhone: c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers[0].number : undefined,
            memberType: selectedMemberType || undefined,
          }));
          const res = await bulkAddMembers({ members });
          Alert.alert('Done', `Added: ${res.added}, Skipped (duplicates): ${res.skipped}`);
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  } catch (e: any) {
    Alert.alert('Error', 'Failed to access contacts');
  }
};

const getMemberTypeLabel = (key: string | null) => {
  if (!key) return 'All Members';
  return MEMBER_TYPES.find(t => t.key === key)?.label || key;
};

const renderMembers = () => {
  // If no category selected, show category cards
  if (!selectedMemberType) {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Member Categories</Text>
        <Text style={[styles.helpText, { marginBottom: 16 }]}>Browse all members or filter by industry</Text>
        {MEMBER_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: type.color, marginBottom: 12 }]}
            onPress={() => { setSelectedMemberType(type.key); setSelectedIndustry(null); setMemberSubTab('list'); setSearchQuery(''); }}
          >
            <View style={[styles.categoryIconContainer, { backgroundColor: type.color + '20' }]}>
              <Ionicons name={type.icon as any} size={28} color={type.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.memberName, { fontSize: fontSize.md }]}>{type.label}</Text>
              <Text style={styles.memberSub}>Tap to manage members</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // Business Community: show industry sub-categories first
  if (selectedMemberType === 'business_community' && !selectedIndustry) {
    const INDUSTRY_ICONS: Record<string, string> = {
      'Mining': 'hammer', 'Mining & Metals': 'hammer', 'Metal mining': 'hammer',
      'Real estate': 'home', 'Real Estate': 'home',
      'Construction': 'construct', 'General building contractors': 'construct', 'Heavy construction except building': 'construct',
      'Finance': 'cash', 'Financial Services': 'cash', 'Banking': 'cash', 'Banking & Finance': 'cash', 'FinTech': 'cash', 'Fintech': 'cash',
      'Health services': 'medkit', 'Healthcare': 'medkit', 'Hospital & Health Care': 'medkit',
      'Services': 'briefcase', 'Business services': 'briefcase',
      'Communications': 'chatbubbles', 'Telecommunications': 'chatbubbles',
      'Transportation services': 'car', 'Logistics': 'car', 'Transportation': 'car',
      'Education services': 'school', 'Education': 'school', 'Higher Education': 'school',
      'Energy': 'flash', 'Electric': 'flash', 'Energy & Water': 'flash',
      'Agriculture': 'leaf', 'Agricultural services': 'leaf',
      'Hotels & other lodging places': 'bed', 'Tourism': 'bed', 'Tourism & Hospitality': 'bed',
      'Legal services': 'document-text', 'Legal Tech': 'document-text',
      'Insurance agents': 'shield-checkmark', 'Insurance': 'shield-checkmark',
      'Manufacturing': 'cog', 'Miscellaneous manufacturing industries': 'cog',
      'Information Technology & Services': 'laptop', 'Cybersecurity': 'laptop',
      'Engineering & management services': 'settings',
      'Miscellaneous retail': 'storefront', 'Retail': 'storefront', 'Wholesale & Retail': 'storefront',
    };
    const INDUSTRY_COLORS: string[] = [
      '#8B5CF6', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#6366F1',
      '#14B8A6', '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#A855F7',
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => { setSelectedMemberType(null); setSelectedIndustry(null); setSearchQuery(''); }} style={{ marginRight: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { flex: 1, marginBottom: 0 }]}>Business Community</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            {industryCounts ? industryCounts.reduce((sum, c) => sum + c.count, 0) : '...'} members
          </Text>
        </View>
        <Text style={[styles.helpText, { marginBottom: 12 }]}>Select an industry to view members</Text>

        {industryCounts ? (
          <FlatList
            data={industryCounts}
            keyExtractor={(item) => item.industry}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <TouchableOpacity
                style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 10 }]}
                onPress={() => { setSelectedIndustry('__all__'); setSearchQuery(''); }}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="people" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.memberName, { fontSize: fontSize.md }]}>All Members</Text>
                  <Text style={styles.memberSub}>{industryCounts.reduce((sum: number, c: any) => sum + c.count, 0)} members</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            }
            renderItem={({ item, index }) => {
              const iconName = INDUSTRY_ICONS[item.industry] || 'business';
              const color = INDUSTRY_COLORS[index % INDUSTRY_COLORS.length];
              return (
                <TouchableOpacity
                  style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: color, marginBottom: 10 }]}
                  onPress={() => { setSelectedIndustry(item.industry); setSearchQuery(''); }}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={iconName as any} size={24} color={color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.memberName, { fontSize: fontSize.md }]}>{item.industry}</Text>
                    <Text style={styles.memberSub}>{item.count} member{item.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No industry data</Text>}
          />
        ) : (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        )}
      </View>
    );
  }

  // Category detail view
  const currentType = MEMBER_TYPES.find(t => t.key === selectedMemberType);

  // Special rendering for State Agencies - show static data instead of DB members
  if (selectedMemberType === 'state_agencies') {
    const agencyFiltered = STATE_AGENCIES.filter(a => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.acronym.toLowerCase().includes(q) || a.focus.toLowerCase().includes(q) || a.ceoName.toLowerCase().includes(q);
    });

    return (
      <View style={styles.tabContent}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => { setSelectedMemberType(null); setSearchQuery(''); }} style={{ marginRight: 8 }}>
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
          keyExtractor={(item) => item.acronym}
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

        {/* Agency Detail Modal */}
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
                  {/* Header with logo */}
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

                  {/* Leadership / CEO Section */}
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

                  {/* About */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 }}>About</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>{selectedAgency.description}</Text>
                  </View>

                  {/* Focus */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 6 }}>Focus Area</Text>
                    <View style={{ backgroundColor: '#8B5CF6' + '15', paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.md, alignSelf: 'flex-start' }}>
                      <Text style={{ fontSize: fontSize.sm, color: '#8B5CF6', fontWeight: '600' }}>{selectedAgency.focus}</Text>
                    </View>
                  </View>

                  {/* Details grid */}
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

                  {/* Contact Information */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Contact Information</Text>
                    
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      onPress={() => Linking.openURL(`mailto:${selectedAgency.email}`)}
                    >
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="mail" size={16} color={colors.primary} />
                      </View>
                      <Text style={{ fontSize: fontSize.sm, color: colors.primary, flex: 1 }}>{selectedAgency.email}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      onPress={() => Linking.openURL(`tel:${selectedAgency.phone}`)}
                    >
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success + '15', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="call" size={16} color={colors.success} />
                      </View>
                      <Text style={{ fontSize: fontSize.sm, color: colors.text, flex: 1 }}>{selectedAgency.phone}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      onPress={() => Linking.openURL(`https://${selectedAgency.website}`)}
                    >
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

  return (
    <View style={styles.tabContent}>
      {/* Back to categories + title */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => {
          if (selectedMemberType === 'business_community' && selectedIndustry) {
            setSelectedIndustry(null);
            setSearchQuery('');
          } else {
            setSelectedMemberType(null);
            setSelectedIndustry(null);
            setSearchQuery('');
          }
        }} style={{ marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { flex: 1, marginBottom: 0 }]}>
          {selectedIndustry === '__all__' ? 'All Members' : selectedIndustry ? selectedIndustry : currentType?.label}
        </Text>
      </View>

      {/* Import method buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }}>
        <TouchableOpacity
          style={[styles.importMethodBtn, memberSubTab === 'list' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => setMemberSubTab('list')}
        >
          <Ionicons name="list" size={16} color={memberSubTab === 'list' ? colors.white : colors.textSecondary} />
          <Text style={[styles.importMethodText, memberSubTab === 'list' && { color: colors.white }]}>Members</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn, memberSubTab === 'add' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => { setMemberSubTab('add'); clearMemberForm(); setShowAddMember(true); }}
        >
          <Ionicons name="person-add" size={16} color={memberSubTab === 'add' ? colors.white : colors.textSecondary} />
          <Text style={[styles.importMethodText, memberSubTab === 'add' && { color: colors.white }]}>Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn, memberSubTab === 'bulk' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => setMemberSubTab('bulk')}
        >
          <Ionicons name="grid" size={16} color={memberSubTab === 'bulk' ? colors.white : colors.textSecondary} />
          <Text style={[styles.importMethodText, memberSubTab === 'bulk' && { color: colors.white }]}>Excel Import</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn]}
          onPress={handleCSVImport}
        >
          <Ionicons name="document-text" size={16} color={colors.textSecondary} />
          <Text style={styles.importMethodText}>CSV Import</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn]}
          onPress={handleContactsImport}
        >
          <Ionicons name="call" size={16} color={colors.textSecondary} />
          <Text style={styles.importMethodText}>From Contacts</Text>
        </TouchableOpacity>
      </ScrollView>

      {memberSubTab === 'bulk' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.helpText}>Paste from Excel/Sheets - include a header row for auto-detection, or you'll map columns manually in the next step.</Text>
          <TextInput
            style={[styles.input, { height: 200, textAlignVertical: 'top' }]}
            value={bulkText}
            onChangeText={setBulkText}
            multiline
            placeholder={'Name, Email, Company, Role, Country\nJohn Doe, john@email.com, Acme, CEO, Botswana\nJane Smith, jane@email.com, Inc, CTO, Kenya'}
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleBulkAdd}>
            <Text style={styles.primaryBtnText}>Map Fields & Import</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${selectedIndustry === '__all__' ? 'All Members' : selectedIndustry || currentType?.label}...`}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <FlatList
            data={members || []}
            keyExtractor={(item: any) => item._id}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 8 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity style={styles.memberCard} onPress={() => openEditMember(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{item.name || 'Unnamed'}</Text>
                  <Text style={styles.memberSub}>{item.email}</Text>
                  {item.company && <Text style={styles.memberSub}>{item.company}{item.role ? ` - ${item.role}` : ''}</Text>}
                  {item.contactPhone && <Text style={styles.memberSub}>{item.contactPhone}</Text>}
                  {item.country && <Text style={[styles.memberSub, { color: currentType?.color || colors.primary }]}>{item.country}</Text>}
                  {item.website && (
                    <TouchableOpacity onPress={() => { const url = item.website.startsWith('http') ? item.website : `https://${item.website}`; Linking.openURL(url); }}>
                      <Text style={[styles.memberSub, { color: colors.info, textDecorationLine: 'underline' }]}>{item.website}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => { setSelectedMember(item); setShowMemberNotes(true); }}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteMember(item)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No members in {currentType?.label}</Text>}
          />
        </>
      )}
    </View>
  );
};

// ─── TAB: EVENTS ───
const renderEvents = () => (
  <View style={styles.tabContent}>
    <View style={styles.searchRow}>
      <Text style={styles.sectionTitle}>Events</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={styles.addBtn} onPress={async () => { try { await sortEventsByDate(); } catch (e: any) { Alert.alert('Error', e.message); } }}>
          <Ionicons name="swap-vertical" size={18} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => { clearEventForm(); setShowCreateEvent(true); }}>
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
    <FlatList
      data={events || []}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.memberCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{item.title}</Text>
            <Text style={styles.memberSub}>{item.city}, {item.country} - {item.venue}</Text>
            <Text style={styles.memberSub}>{formatDate(item.date)} | Cap: {item.capacity} | RSVPs: {item.rsvpCount}</Text>
            {item.ticketPrice ? <Text style={[styles.memberSub, { color: colors.primary }]}>{formatCurrency(item.ticketPrice, item.currency || 'BWP')}</Text> : null}
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'upcoming' ? colors.info + '30' : item.status === 'past' ? colors.textMuted + '30' : colors.success + '30' }]}>
              <Text style={[styles.statusText, { color: item.status === 'upcoming' ? colors.info : item.status === 'past' ? colors.textMuted : colors.success }]}>{item.status}</Text>
            </View>
          </View>
          <View style={{ gap: 8, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { setSelectedEvent(item); setShowEventRsvps(true); }}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openEditEvent(item)}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteEvent(item)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => { try { await reorderEvent({ eventId: item._id, direction: 'up' }); } catch {} }}>
              <Ionicons name="arrow-up" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => { try { await reorderEvent({ eventId: item._id, direction: 'down' }); } catch {} }}>
              <Ionicons name="arrow-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No events yet</Text>}
    />
  </View>
);

// ─── TAB: PAYMENTS ───
const renderPayments = () => (
  <View style={styles.tabContent}>
    <View style={styles.searchRow}>
      <Text style={styles.sectionTitle}>Payments</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowRecordPayment(true)}>
        <Ionicons name="add" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, flexGrow: 0 }}>
      {['all', 'confirmed', 'pending', 'refunded'].map(f => (
        <TouchableOpacity
          key={f}
          style={[styles.chip, paymentFilter === f && styles.chipActive]}
          onPress={() => setPaymentFilter(f)}
        >
          <Text style={[styles.chipText, paymentFilter === f && styles.chipTextActive]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    <FlatList
      data={payments || []}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.memberCard}
          onPress={() => {
            setSelectedPayment(item);
            setShowPaymentActions(true);
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{formatCurrency(item.amount, item.currency)}</Text>
            {item.userName && <Text style={styles.memberSub}>{item.userName}</Text>}
            {item.eventTitle && <Text style={styles.memberSub}>{item.eventTitle}</Text>}
            <Text style={styles.memberSub}>{item.method} | {formatDate(item._creationTime)}</Text>
            {item.reference && <Text style={styles.memberSub}>Ref: {item.reference}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? colors.success + '30' : item.status === 'pending' ? colors.warning + '30' : colors.error + '30' }]}>
            <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.success : item.status === 'pending' ? colors.warning : colors.error }]}>{item.status}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No payments found</Text>}
    />
  </View>
);

// ─── TAB: REPORTS ───
const renderReports = () => (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    <Text style={styles.sectionTitle}>Analytics</Text>
    {reportData ? (
      <>
        <Text style={styles.subSectionTitle}>Members by Country</Text>
        {reportData.membersByCountry.slice(0, 8).map((item, i) => (
          <View key={i} style={styles.reportRow}>
            <Text style={styles.reportLabel}>{item.country}</Text>
            <View style={[styles.reportBar, { width: `${Math.min(100, (item.count / Math.max(...reportData.membersByCountry.map(c => c.count))) * 100)}%` }]} />
            <Text style={styles.reportValue}>{item.count}</Text>
          </View>
        ))}

        <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Members by Industry</Text>
        {reportData.membersByIndustry.slice(0, 8).map((item, i) => (
          <View key={i} style={styles.reportRow}>
            <Text style={styles.reportLabel}>{item.industry}</Text>
            <View style={[styles.reportBar, { backgroundColor: colors.accent, width: `${Math.min(100, (item.count / Math.max(...reportData.membersByIndustry.map(c => c.count))) * 100)}%` }]} />
            <Text style={styles.reportValue}>{item.count}</Text>
          </View>
        ))}

        <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Monthly Growth</Text>
        {reportData.monthlyGrowth.map((item, i) => (
          <View key={i} style={styles.reportRow}>
            <Text style={styles.reportLabel}>{item.month}</Text>
            <Text style={styles.reportValue}>{item.members} members | {formatCurrency(item.revenue, 'BWP')}</Text>
          </View>
        ))}

        <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Event Performance</Text>
        {reportData.eventPerformance.map((item, i) => (
          <View key={i} style={styles.eventPerfCard}>
            <Text style={styles.memberName}>{item.title}</Text>
            <Text style={styles.memberSub}>{item.city}, {item.country}</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
              <Text style={styles.memberSub}>RSVPs: {item.rsvpCount}</Text>
              <Text style={styles.memberSub}>Attending: {item.attendingCount}</Text>
              <Text style={[styles.memberSub, { color: colors.primary }]}>Fill: {item.fillRate}%</Text>
            </View>
            {item.revenue > 0 && <Text style={[styles.memberSub, { color: colors.success }]}>Revenue: {formatCurrency(item.revenue, 'BWP')}</Text>}
          </View>
        ))}

        <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>RSVP Conversion</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}><Text style={styles.statValue}>{reportData.rsvpConversion.total}</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.success }]}>{reportData.rsvpConversion.attending}</Text><Text style={styles.statLabel}>Attending</Text></View>
          <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.error }]}>{reportData.rsvpConversion.cancelled}</Text><Text style={styles.statLabel}>Cancelled</Text></View>
          <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.warning }]}>{reportData.rsvpConversion.waitlist}</Text><Text style={styles.statLabel}>Waitlist</Text></View>
        </View>

        <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Recent Members</Text>
        {reportData.recentMembers.map((item, i) => (
          <View key={i} style={styles.reportRow}>
            <Text style={styles.reportLabel}>{item.name}</Text>
            <Text style={styles.reportValue}>{formatDate(item.joinedAt)}</Text>
          </View>
        ))}
      </>
    ) : <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}
  </ScrollView>
);

// ─── TAB: CRM ───
const renderCRM = () => (
  <View style={styles.tabContent}>
    <Text style={styles.sectionTitle}>CRM - Member Notes</Text>
    <View style={styles.searchBox}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.searchInput}
        value={crmSearchQuery}
        onChangeText={setCrmSearchQuery}
        placeholder="Search members..."
        placeholderTextColor={colors.textMuted}
      />
    </View>
    <FlatList
      data={crmMembers || []}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      style={{ marginTop: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.memberCard}
          onPress={() => { setSelectedMember(item); setShowMemberNotes(true); }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{item.name || 'Unnamed'}</Text>
            <Text style={styles.memberSub}>{item.email}</Text>
            {item.company && <Text style={styles.memberSub}>{item.company}</Text>}
          </View>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No members found</Text>}
    />
  </View>
);

// ─── MODALS ───
const renderMemberFormModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string, isUpdate?: boolean) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderInput('Name *', newName, setNewName)}
          {renderInput(isUpdate ? 'Email' : 'Email *', newEmail, setNewEmail, { keyboardType: 'email-address' })}
          {renderInput('Company', newCompany, setNewCompany)}
          {renderInput('Role', newRole, setNewRole)}
          {renderChipPicker('Industry', INDUSTRIES, newIndustry, setNewIndustry)}
          {renderInput('Country', newCountry, setNewCountry)}
          {renderInput('City', newCity, setNewCity)}
          {renderInput('Phone', newPhone, setNewPhone, { keyboardType: 'phone-pad' })}
          {renderInput('Bio', newBio, setNewBio, { multiline: true })}
          {renderInput('LinkedIn URL', newLinkedIn, setNewLinkedIn)}
          {renderInput('Website URL', newWebsite, setNewWebsite)}
          {renderInput('Achievements', newAchievements, setNewAchievements, { multiline: true })}
          {renderInput('Current Projects', newCurrentProjects, setNewCurrentProjects, { multiline: true })}
          <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
            <Text style={styles.primaryBtnText}>{title}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

const renderEventFormModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string) => {
  const isEditing = title === 'Update Event';
  return (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderInput('Title *', evtTitle, setEvtTitle)}
          {renderInput('Description', evtDesc, setEvtDesc, { multiline: true })}
          {renderInput('City *', evtCity, setEvtCity)}
          {renderInput('Country *', evtCountry, setEvtCountry)}
          {renderInput('Venue *', evtVenue, setEvtVenue)}
          {renderInput('Capacity', evtCapacity, setEvtCapacity, { keyboardType: 'numeric' })}
          {renderInput('Ticket Price', evtPrice, setEvtPrice, { keyboardType: 'numeric' })}
          {renderChipPicker('Currency', ['BWP', 'USD', 'ZAR', 'KES', 'NGN'], evtCurrency, setEvtCurrency)}
          <Text style={[styles.subSectionTitle, { marginTop: 16 }]}>Sponsors</Text>
          {evtSponsors.map((s, i) => (
            <View key={i} style={styles.reportRow}>
              <Text style={styles.reportLabel}>{s.name} ({s.tier})</Text>
              <TouchableOpacity onPress={() => setEvtSponsors(evtSponsors.filter((_, idx) => idx !== i))}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={sponsorName}
              onChangeText={setSponsorName}
              placeholder="Sponsor name"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.addBtn, { alignSelf: 'center' }]}
              onPress={() => {
                if (!sponsorName.trim()) {
                  Alert.alert('Required', 'Please enter a sponsor name first');
                  return;
                }
                setEvtSponsors([...evtSponsors, { name: sponsorName.trim(), tier: sponsorTier, website: sponsorWebsite.trim() || undefined }]);
                setSponsorName(''); setSponsorWebsite('');
              }}
            >
              <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Guest Speakers section - only in edit mode with a selected event */}
          {isEditing && selectedEvent && (
            <>
              <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Guest Speakers ({selectedEvent.guestSpeakers?.length || 0})</Text>
              {(selectedEvent.guestSpeakers || []).map((speaker: any, i: number) => (
                <View key={i} style={[styles.memberCard, { marginBottom: 6 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{speaker.name}</Text>
                    {speaker.designation && <Text style={styles.memberSub}>{speaker.designation}{speaker.company ? ` at ${speaker.company}` : ''}</Text>}
                    {speaker.email && <Text style={styles.memberSub}>{speaker.email}</Text>}
                    {speaker.phone && <Text style={styles.memberSub}>{speaker.phone}</Text>}
                    <View style={[styles.statusBadge, { backgroundColor: speaker.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                      <Text style={[styles.statusText, { color: speaker.status === 'confirmed' ? colors.success : colors.warning }]}>{speaker.status}</Text>
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => { onClose(); setTimeout(() => { openEditSpeaker(speaker, i); }, 300); }}>
                      <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveSpeaker(i, speaker.name)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addBtn, { width: '100%', flexDirection: 'row', gap: 6, marginTop: 8 }]}
                onPress={() => { onClose(); setTimeout(() => { clearSpeakerForm(); setShowAddSpeaker(true); }, 300); }}
              >
                <Ionicons name="add" size={18} color={colors.white} />
                <Text style={{ color: colors.white, fontWeight: '600', fontSize: fontSize.sm }}>Add Speaker</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Invited Guests section - only in edit mode with a selected event */}
          {isEditing && selectedEvent && (
            <>
              <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Invited Guests ({selectedEvent.invitedGuests?.length || 0})</Text>
              {(selectedEvent.invitedGuests || []).map((guest: any, i: number) => (
                <View key={i} style={[styles.memberCard, { marginBottom: 6 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{guest.name}</Text>
                    {guest.designation && <Text style={styles.memberSub}>{guest.designation}{guest.company ? ` at ${guest.company}` : ''}</Text>}
                    {guest.email && <Text style={styles.memberSub}>{guest.email}</Text>}
                    {guest.phone && <Text style={styles.memberSub}>{guest.phone}</Text>}
                    <View style={[styles.statusBadge, { backgroundColor: guest.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                      <Text style={[styles.statusText, { color: guest.status === 'confirmed' ? colors.success : colors.warning }]}>{guest.status}</Text>
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => { onClose(); setTimeout(() => { openEditInvGuest(guest, i); }, 300); }}>
                      <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveInvGuest(i, guest.name)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addBtn, { width: '100%', flexDirection: 'row', gap: 6, marginTop: 8 }]}
                onPress={() => { onClose(); setTimeout(() => { clearInvGuestForm(); setShowAddInvitedGuest(true); }, 300); }}
              >
                <Ionicons name="add" size={18} color={colors.white} />
                <Text style={{ color: colors.white, fontWeight: '600', fontSize: fontSize.sm }}>Add Invited Guest</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={onSubmit}>
            <Text style={styles.primaryBtnText}>{title}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
};

// ─── MAIN RENDER ───
const tabs: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Home', icon: 'grid' },
  { key: 'members', label: 'Members', icon: 'people' },
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'payments', label: 'Pay', icon: 'cash' },
  { key: 'reports', label: 'Reports', icon: 'bar-chart' },
  { key: 'crm', label: 'CRM', icon: 'chatbubbles' },
];

return (
  <SafeAreaView style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
        <Ionicons name="arrow-back" size={24} count={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Admin Dashboard</Text>
      <View style={{ width: 32 }} />
    </View>

    {/* Tab bar */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ paddingHorizontal: 8 }}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    {/* Tab content */}
    {activeTab === 'overview' && renderOverview()}
    {activeTab === 'members' && renderMembers()}
    {activeTab === 'events' && renderEvents()}
    {activeTab === 'payments' && renderPayments()}
    {activeTab === 'reports' && renderReports()}
    {activeTab === 'crm' && renderCRM()}

    {/* Modals */}
    {renderMemberFormModal(showAddMember, () => setShowAddMember(false), handleAddMember, 'Add Member')}
    {renderMemberFormModal(showEditMember, () => setShowEditMember(false), handleUpdateMember, 'Update Member', true)}
    {renderEventFormModal(showCreateEvent, () => setShowCreateEvent(false), handleCreateEvent, 'Create Event')}
    {renderEventFormModal(showEditEvent, () => setShowEditEvent(false), handleUpdateEvent, 'Update Event')}

    {/* Record Payment Modal */}
    <Modal visible={showRecordPayment} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => setShowRecordPayment(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderInput('Amount *', payAmount, setPayAmount, { keyboardType: 'numeric' })}
            {renderChipPicker('Currency', ['BWP', 'USD', 'ZAR', 'KES', 'NGN'], payCurrency, setPayCurrency)}
            {renderChipPicker('Method', PAYMENT_METHODS, payMethod, setPayMethod)}
            {renderInput('Reference', payRef, setPayRef)}
            {renderInput('Notes', payNotes, setPayNotes, { multiline: true })}

            {/* Event picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.chip, !payEventId && styles.chipActive]}
                  onPress={() => setPayEventId(null)}
                >
                  <Text style={[styles.chipText, !payEventId && styles.chipTextActive]}>None</Text>
                </TouchableOpacity>
                {(events || []).map(evt => (
                  <TouchableOpacity
                    key={evt._id}
                    style={[styles.chip, payEventId === evt._id && styles.chipActive]}
                    onPress={() => setPayEventId(evt._id)}
                  >
                    <Text style={[styles.chipText, payEventId === evt._id && styles.chipTextActive]}>{evt.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Member picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Member (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.chip, !payUserId && styles.chipActive]}
                  onPress={() => setPayUserId(null)}
                >
                  <Text style={[styles.chipText, !payUserId && styles.chipTextActive]}>None</Text>
                </TouchableOpacity>
                {(members || []).slice(0, 20).map(m => (
                  <TouchableOpacity
                    key={m._id}
                    style={[styles.chip, payUserId === m._id && styles.chipActive]}
                    onPress={() => setPayUserId(m._id)}
                  >
                    <Text style={[styles.chipText, payUserId === m._id && styles.chipTextActive]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRecordPayment}>
              <Text style={styles.primaryBtnText}>Record Payment</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>

    {/* Payment Actions Modal */}
    <Modal visible={showPaymentActions} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: 300 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Actions</Text>
            <TouchableOpacity onPress={() => setShowPaymentActions(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          {selectedPayment && (
            <View style={{ gap: 12, padding: 16 }}>
              {selectedPayment.status !== 'confirmed' && (
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.success }]} onPress={async () => {
                  try { await updatePaymentMut({ paymentId: selectedPayment._id, status: 'confirmed' }); setShowPaymentActions(false); } catch (e: any) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.primaryBtnText}>Confirm Payment</Text>
                </TouchableOpacity>
              )}
              {selectedPayment.status !== 'pending' && (
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.warning }]} onPress={async () => {
                  try { await updatePaymentMut({ paymentId: selectedPayment._id, status: 'pending' }); setShowPaymentActions(false); } catch (e: any) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.primaryBtnText}>Mark Pending</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.error }]} onPress={() => {
                Alert.alert('Delete', 'Delete this payment?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await deletePaymentMut({ paymentId: selectedPayment._id }); setShowPaymentActions(false); } catch (e: any) { Alert.alert('Error', e.message); }
                  }},
                ]);
              }}>
                <Text style={styles.primaryBtnText}>Delete Payment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>

    {/* Event RSVPs Modal */}
    <Modal visible={showEventRsvps} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedEvent?.title} - Details</Text>
            <TouchableOpacity onPress={() => setShowEventRsvps(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>

          {/* Sub-tabs for RSVPs / Speakers / Invited / Paid / All */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 8 }}>
            <View style={styles.subTabRow}>
              {(['rsvps', 'speakers', 'invited', 'paid', 'all'] as const).map(tab => (
                <TouchableOpacity key={tab} style={[styles.subTab, rsvpViewTab === tab && styles.subTabActive]} onPress={() => setRsvpViewTab(tab)}>
                  <Text style={[styles.subTabText, rsvpViewTab === tab && styles.subTabTextActive]}>
                    {tab === 'rsvps' ? 'RSVPs' : tab === 'speakers' ? 'Speakers' : tab === 'invited' ? 'Invited' : tab === 'paid' ? 'Paid' : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {rsvpViewTab === 'rsvps' && (
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={[styles.exportBtn, { alignSelf: 'flex-end', marginBottom: 8 }]} onPress={() => exportToCSV('rsvps')}>
                <Ionicons name="download-outline" size={16} color={colors.primary} />
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
              <FlatList
                data={eventRsvps || []}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.memberCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{item.userName || 'Unknown'}</Text>
                      <Text style={styles.memberSub}>{item.userEmail}</Text>
                      {item.userCompany && <Text style={styles.memberSub}>{item.userCompany}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={[styles.statusBadge, { backgroundColor: item.status === 'attending' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'attending' ? colors.success : colors.warning }]}>{item.status}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {item.status !== 'attending' && (
                          <TouchableOpacity onPress={async () => { try { await updateRsvp({ rsvpId: item._id, status: 'attending' }); } catch {} }}>
                            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                          </TouchableOpacity>
                        )}
                        {item.status !== 'cancelled' && (
                          <TouchableOpacity onPress={async () => { try { await updateRsvp({ rsvpId: item._id, status: 'cancelled' }); } catch {} }}>
                            <Ionicons name="close-circle" size={22} color={colors.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No RSVPs yet</Text>}
              />
            </View>
          )}

          {rsvpViewTab === 'speakers' && (
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity style={styles.exportBtn} onPress={() => exportToCSV('speakers')}>
                  <Ionicons name="download-outline" size={16} color={colors.primary} />
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => { clearSpeakerForm(); setShowAddSpeaker(true); }}>
                  <Ionicons name="add" size={18} color={colors.white} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedEvent?.guestSpeakers || []}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item, index }) => (
                  <View style={styles.memberCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{item.name}</Text>
                      {item.designation && <Text style={styles.memberSub}>{item.designation}{item.company ? ` at ${item.company}` : ''}</Text>}
                      {item.email && <Text style={styles.memberSub}>{item.email}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.success : colors.warning }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => openEditSpeaker(item, index)}>
                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveSpeaker(index, item.name)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No speakers added</Text>}
              />
            </View>
          )}

          {rsvpViewTab === 'invited' && (
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity style={styles.exportBtn} onPress={() => exportToCSV('invited')}>
                  <Ionicons name="download-outline" size={16} color={colors.primary} />
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => { clearInvGuestForm(); setShowAddInvitedGuest(true); }}>
                  <Ionicons name="add" size={18} color={colors.white} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedEvent?.invitedGuests || []}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item, index }) => (
                  <View style={styles.memberCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{item.name}</Text>
                      {item.designation && <Text style={styles.memberSub}>{item.designation}{item.company ? ` at ${item.company}` : ''}</Text>}
                      {item.email && <Text style={styles.memberSub}>{item.email}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.success : colors.warning }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => openEditInvGuest(item, i)}>
                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveInvGuest(i, item.name)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No invited guests</Text>}
              />
            </View>
          )}

          {rsvpViewTab === 'paid' && (
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={[styles.exportBtn, { alignSelf: 'flex-end', marginBottom: 8 }]} onPress={() => exportToCSV('paid')}>
                <Ionicons name="download-outline" size={16} color={colors.primary} />
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
              <FlatList
                data={(eventRsvps || []).filter((r: any) => r.paymentStatus === 'paid')}
                keyExtractor={(item: any) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }: any) => (
                  <View style={styles.memberCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{item.userName || 'Unknown'}</Text>
                      <Text style={styles.memberSub}>{item.userEmail}</Text>
                      {item.userCompany && <Text style={styles.memberSub}>{item.userCompany}</Text>}
                      {item.userPhone && <Text style={styles.memberSub}>{item.userPhone}</Text>}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: colors.success + '30' }]}>
                      <Text style={[styles.statusText, { color: colors.success }]}>Paid</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No paid attendees yet</Text>}
              />
            </View>
          )}

          {rsvpViewTab === 'all' && (
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={[styles.exportBtn, { alignSelf: 'flex-end', marginBottom: 8 }]} onPress={() => exportToCSV('all')}>
                <Ionicons name="download-outline" size={16} color={colors.primary} />
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
              <FlatList
                data={[
                  ...(eventRsvps || []).map((r: any) => ({ type: 'RSVP', name: r.userName || 'Unknown', email: r.userEmail, company: r.userCompany, phone: r.userPhone, status: r.status, paymentStatus: r.paymentStatus, key: 'rsvp-' + r._id })),
                  ...(selectedEvent?.guestSpeakers || []).map((s: any, i: number) => ({ type: 'Speaker', name: s.name, email: s.email, company: s.company, phone: s.phone, status: s.status, paymentStatus: undefined, key: 'speaker-' + i })),
                  ...(selectedEvent?.invitedGuests || []).map((g: any, i: number) => ({ type: 'Invited', name: g.name, email: g.email, company: g.company, phone: g.phone, status: g.status, paymentStatus: undefined, key: 'invited-' + i })),
                ]}
                keyExtractor={(item: any) => item.key}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }: any) => (
                  <View style={styles.memberCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{item.name}</Text>
                      {item.email && <Text style={styles.memberSub}>{item.email}</Text>}
                      {item.company && <Text style={styles.memberSub}>{item.company}</Text>}
                      {item.phone && <Text style={styles.memberSub}>{item.phone}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={[styles.statusBadge, { backgroundColor: item.type === 'RSVP' ? colors.primary + '30' : item.type === 'Speaker' ? colors.warning + '30' : colors.accent + '30' }]}>
                        <Text style={[styles.statusText, { color: item.type === 'RSVP' ? colors.primary : item.type === 'Speaker' ? colors.warning : colors.accent }]}>{item.type}</Text>
                      </View>
                      {item.status && (
                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'attending' || item.status === 'confirmed' ? colors.success + '30' : colors.textSecondary + '30' }]}>
                          <Text style={[styles.statusText, { color: item.status === 'attending' || item.status === 'confirmed' ? colors.success : colors.textSecondary }]}>{item.status}</Text>
                        </View>
                      )}
                      {item.paymentStatus && (
                        <View style={[styles.statusBadge, { backgroundColor: item.paymentStatus === 'paid' ? colors.success + '30' : colors.warning + '30' }]}>
                          <Text style={[styles.statusText, { color: item.paymentStatus === 'paid' ? colors.success : colors.warning }]}>{item.paymentStatus}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No people added to this event yet</Text>}
              />
            </View>
          )}

        </View>
      </View>
    </Modal>

    {/* Add Speaker Modal */}
    <Modal visible={showAddSpeaker} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingSpeakerIndex !== null ? 'Update Speaker' : 'Add Speaker'}</Text>
            <TouchableOpacity onPress={() => { setShowAddSpeaker(false); clearSpeakerForm(); }}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderInput('Name *', speakerName, setSpeakerName)}
            {renderInput('Email', speakerEmail, setSpeakerEmail, { keyboardType: 'email-address' })}
            {renderInput('Phone', speakerPhone, setSpeakerPhone, { keyboardType: 'phone-pad' })}
            {renderInput('Designation', speakerDesignation, setSpeakerDesignation)}
            {renderInput('Company', speakerCompany, setSpeakerCompany)}
            {renderChipPicker('Status', ['invited', 'confirmed', 'declined'], speakerStatus, setSpeakerStatus)}
            {renderInput('Notes', speakerNotes, setSpeakerNotes, { multiline: true })}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddOrEditSpeaker}>
              <Text style={styles.primaryBtnText}>{editingSpeakerIndex !== null ? 'Update' : 'Add Speaker'}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>

    {/* Add Invited Guest Modal */}
    <Modal visible={showAddInvitedGuest} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingInvGuestIndex !== null ? 'Edit Guest' : 'Add Invited Guest'}</Text>
            <TouchableOpacity onPress={() => { setShowAddInvitedGuest(false); clearInvGuestForm(); }}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderInput('Name *', invGuestName, setInvGuestName)}
            {renderInput('Email', invGuestEmail, setInvGuestEmail, { keyboardType: 'email-address' })}
            {renderInput('Phone', invGuestPhone, setInvGuestPhone, { keyboardType: 'phone-pad' })}
            {renderInput('Designation', invGuestDesignation, setInvGuestDesignation)}
            {renderInput('Company', invGuestCompany, setInvGuestCompany)}
            {renderChipPicker('Status', ['invited', 'confirmed', 'declined'], invGuestStatus, setInvGuestStatus)}
            {renderInput('Notes', invGuestNotes, setInvGuestNotes, { multiline: true })}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddOrEditInvGuest}>
              <Text style={styles.primaryBtnText}>{editingInvGuestIndex !== null ? 'Update' : 'Add Guest'}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>

    {/* Member Notes Modal */}
    <Modal visible={showMemberNotes} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notes - {selectedMember?.name}</Text>
            <TouchableOpacity onPress={() => setShowMemberNotes(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.addBtn, { alignSelf: 'flex-end', marginBottom: 8 }]} onPress={() => setShowAddNote(true)}>
            <Ionicons name="add" size={18} color={colors.white} />
          </TouchableOpacity>
          <FlatList
            data={memberNotes || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.memberCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, { backgroundColor: colors.info + '30' }]}>
                      <Text style={[styles.statusText, { color: colors.info }]}>{item.type}</Text>
                    </View>
                    <Text style={styles.memberSub}>{formatDate(item._creationTime)}</Text>
                  </View>
                  <Text style={[styles.memberName, { marginTop: 4, fontSize: fontSize.md }]}>{item.note}</Text>
                  {item.createdBy && <Text style={styles.memberSub}>by {item.createdBy}</Text>}
                </View>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Delete', 'Delete this note?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      try { await deleteNoteMut({ noteId: item._id }); } catch (e: any) { Alert.alert('Error', e.message); }
                    }},
                  ]);
                }}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No notes yet</Text>}
          />
        </View>
      </View>
    </Modal>

    {/* Add Note Modal */}
    <Modal visible={showAddNote} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.modalContent, { maxHeight: 400 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TouchableOpacity onPress={() => setShowAddNote(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          {renderChipPicker('Type', NOTE_TYPES, noteType, setNoteType)}
          {renderInput('Note', noteText, setNoteText, { multiline: true })}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddNote}>
            <Text style={styles.primaryBtnText}>Add Note</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>

    {/* Field Mapping Modal */}
    <Modal visible={showFieldMapping} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Map Import Fields</Text>
            <TouchableOpacity onPress={() => { setShowFieldMapping(false); setMappingPickerIndex(null); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Match each column from your file to the correct member field. {importedRows.length} row{importedRows.length !== 1 ? 's' : ''} detected.
          </Text>

          {/* Validation status */}
          {(() => {
            const mapped = Object.values(fieldMappings);
            const hasName = mapped.includes('name') || mapped.includes('surname');
            const hasEmail = mapped.includes('email');
            return (
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name={hasName ? 'checkmark-circle' : 'alert-circle'} size={16} color={hasName ? colors.success : colors.error} />
                  <Text style={{ fontSize: fontSize.sm, color: hasName ? colors.success : colors.error, fontWeight: '600' }}>Name</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name={hasEmail ? 'checkmark-circle' : 'alert-circle'} size={16} color={hasEmail ? colors.success : colors.error} />
                  <Text style={{ fontSize: fontSize.sm, color: hasEmail ? colors.success : colors.error, fontWeight: '600' }}>Email</Text>
                </View>
              </View>
            );
          })()}

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {importedHeaders.map((header, colIdx) => {
              const currentMapping = fieldMappings[colIdx] || 'skip';
              const mappedField = IMPORT_FIELDS.find(f => f.key === currentMapping);
              const sampleValues = importedRows.slice(0, 3).map((row: string[]) => row[colIdx] || '').filter(Boolean);
              const isPickerOpen = mappingPickerIndex === colIdx;

              return (
                <View key={colIdx} style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: currentMapping !== 'skip' ? colors.primary + '50' : colors.border,
                  borderLeftWidth: 3,
                  borderLeftColor: currentMapping !== 'skip' ? colors.primary : colors.border,
                }}>
                  {/* Column header from file */}
                  <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
                    {header}
                  </Text>

                  {/* Sample data preview */}
                  {sampleValues.length > 0 && (
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 8 }} numberOfLines={1}>
                      e.g. {sampleValues.slice(0, 2).join(', ')}
                    </Text>
                  )}

                  {/* Mapping selector button */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: currentMapping !== 'skip' ? colors.primary + '15' : colors.background,
                      borderRadius: borderRadius.sm,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: currentMapping !== 'skip' ? colors.primary + '40' : colors.border,
                    }}
                    onPress={() => setMappingPickerIndex(isPickerOpen ? null : colIdx)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons
                        name={currentMapping !== 'skip' ? 'link' : 'remove-circle-outline'}
                        size={16}
                        color={currentMapping !== 'skip' ? colors.primary : colors.textMuted}
                      />
                      <Text style={{
                        fontSize: fontSize.sm,
                        fontWeight: '600',
                        color: currentMapping !== 'skip' ? colors.primary : colors.textMuted,
                      }}>
                        {mappedField?.label || '-- Skip Column --'}
                      </Text>
                    </View>
                    <Ionicons name={isPickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Expanded picker options */}
                  {isPickerOpen && (
                    <View style={{ marginTop: 8, backgroundColor: colors.background, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                      {IMPORT_FIELDS.map((field) => {
                        const isSelected = currentMapping === field.key;
                        const isUsedElsewhere = field.key !== 'skip' && Object.entries(fieldMappings).some(
                          ([idx, val]) => val === field.key && parseInt(idx) !== colIdx
                        );
                        return (
                          <TouchableOpacity
                            key={field.key}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                              opacity: isUsedElsewhere ? 0.4 : 1,
                            }}
                            onPress={() => {
                              if (isUsedElsewhere) return;
                              setFieldMappings(prev => ({ ...prev, [colIdx]: field.key }));
                              setMappingPickerIndex(null);
                            }}
                            disabled={isUsedElsewhere}
                          >
                            <Ionicons
                              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                              size={16}
                              color={isSelected ? colors.primary : colors.textMuted}
                              style={{ marginRight: 10 }}
                            />
                            <Text style={{
                              fontSize: fontSize.sm,
                              color: isSelected ? colors.primary : (isUsedElsewhere ? colors.textMuted : colors.text),
                              fontWeight: isSelected ? '600' : '400',
                            }}>
                              {field.label}
                              {isUsedElsewhere ? ' (already mapped)' : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Data preview */}
            {importedRows.length > 0 && (
              <View style={{ marginTop: 8, marginBottom: 16 }}>
                <Text style={[styles.subSectionTitle, { marginBottom: 8 }]}>Preview (first 3 rows)</Text>
                {importedRows.slice(0, 3).map((row: string[], rowIdx: number) => {
                  const previewParts: string[] = [];
                  Object.entries(fieldMappings).forEach(([colIdxStr, fieldKey]) => {
                    if (fieldKey === 'skip') return;
                    const colIdx = parseInt(colIdxStr);
                    const val = row[colIdx]?.trim();
                    if (val) {
                      const label = IMPORT_FIELDS.find(f => f.key === fieldKey)?.label || fieldKey;
                      previewParts.push(`${label}: ${val}`);
                    }
                  });
                  return (
                    <View key={rowIdx} style={{
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.sm,
                      padding: spacing.sm,
                      marginBottom: 6,
                      borderLeftWidth: 2,
                      borderLeftColor: colors.accent,
                    }}>
                      {previewParts.length > 0 ? previewParts.map((part, i) => (
                        <Text key={i} style={{ fontSize: fontSize.xs, color: colors.textSecondary }} numberOfLines={1}>{part}</Text>
                      )) : (
                        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, fontStyle: 'italic' }}>No fields mapped for this row</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmImport}>
            <Text style={styles.primaryBtnText}>Import {importedRows.length} Members</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  tabBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabItem: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  tabContent: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: 12 },
  subSectionTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, minWidth: (width - 56) / 2, flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, color: colors.text, marginLeft: 8, fontSize: fontSize.md },
  addBtn: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  subTabRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  subTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.sm, backgroundColor: colors.surface },
  subTabActive: { backgroundColor: colors.primary },
  subTabText: { fontSize: fontSize.sm, color: colors.textSecondary },
  subTabTextActive: { color: colors.white, fontWeight: '600' },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: 8 },
  memberName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  memberSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 40, fontSize: fontSize.md },
  helpText: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 8 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 4 },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full, alignSelf: 'flex-start', marginTop: 4 },
  statusText: { fontSize: fontSize.xs, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.md, maxHeight: '90%', flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  reportLabel: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  reportBar: { height: 6, borderRadius: 3, backgroundColor: colors.primary, marginHorizontal: 8 },
  reportValue: { fontSize: fontSize.sm, color: colors.textSecondary, minWidth: 60, textAlign: 'right' },
  eventPerfCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: 8 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 40, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  exportBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  categoryIconContainer: { width: 40, height: 40, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  importMethodBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  importMethodText: { fontSize: fontSize.sm, color: colors.textSecondary },
  importMethodTextActive: { color: colors.white, fontWeight: '600' },
});

function parseCSVLines(lines: string[]): string[][] {
  return lines.map((line: string) => {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let ci = 0; ci < line.length; ci++) {
      const ch = line[ci];
      if (ch === '"') {
        if (inQuotes && ci + 1 < line.length && line[ci + 1] === '"') {
          current += '"';
          ci++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((ch === ',' || ch === '\t') && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    parts.push(current.trim());
    return parts;
  }).filter((parts: string[]) => parts.some((p: string) => p.length > 0));
}
