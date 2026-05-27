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
Image,
Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { api } from '../lib/convexApi';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import * as FileSystem from 'expo-file-system';
import * as Contacts from 'expo-contacts';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ViewShot from 'react-native-view-shot';
import QRCodeStyled from 'react-native-qrcode-styled';
import { STATE_AGENCIES, StateAgency } from '../data/stateAgencies';
import AdminSmsPanel from './admin/AdminSmsPanel';
import AdminStateAgenciesPanel from './admin/AdminStateAgenciesPanel';
import AdminMembersPanel from './admin/AdminMembersPanel';
import AdminReportsPanel from './admin/AdminReportsPanel';
import AdminEventsPanel from './admin/AdminEventsPanel';
import AdminEventFormModal from './admin/AdminEventFormModal';
import ConferenceAdminScreen from './ConferenceAdminScreen';
import * as SMS from 'expo-sms';

const { width } = Dimensions.get('window');

const REGISTER_URL = 'https://app.aoeafrica.org.za';

const copyRegistrationLink = async () => {
  if (Platform.OS === 'web') {
    const nav = globalThis as typeof globalThis & {
      navigator?: { clipboard?: { writeText?: (text: string) => Promise<void> } };
    };

    if (nav.navigator?.clipboard?.writeText) {
      await nav.navigator.clipboard.writeText(REGISTER_URL);
      Alert.alert('Copied', 'Registration link copied to clipboard.');
      return;
    }
  }

  await Share.share({
    title: 'Join AOE Africa',
    message: REGISTER_URL,
    url: REGISTER_URL,
  });
};

type AdminTab = 'overview' | 'members' | 'events' | 'conferences' | 'payments' | 'reports' | 'crm' | 'sms';
type MemberSubTab = 'list' | 'add' | 'bulk' | 'csv' | 'contacts';

interface AdminScreenProps {
onBack: () => void;
}

const MEMBER_TYPES = [
  { key: 'platinum_network', label: 'AOE Network', icon: 'diamond', color: '#8B5CF6' },
  { key: 'esd_corporate', label: 'ESD Corporate', icon: 'business', color: '#0EA5E9' },
  { key: 'business_community', label: 'Business Community', icon: 'people-circle', color: '#F59E0B' },
  { key: 'entrepreneurs', label: 'Entrepreneurs', icon: 'rocket', color: '#10B981' },
  { key: 'short_term_funders', label: 'Short Term Funders', icon: 'cash', color: '#EF4444' },
  { key: 'startups', label: 'Tech StartUps', icon: 'lightbulb-outline', color: '#FF9500' },
  { key: 'angel_investors', label: 'Angel Investors', icon: 'trending-up', color: '#6366F1' },
  { key: 'setas', label: 'SETAs', icon: 'school', color: '#14B8A6' },
  { key: 'state_agencies', label: 'State Agencies', icon: 'building', color: '#8B5CF6' },
  { key: 'brand_managers', label: 'Brand Managers', icon: 'pricetag', color: '#EC4899' },
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
  { key: 'province', label: 'Province / State' },
  { key: 'physicalAddress', label: 'Address' },
  { key: 'contactPhone', label: 'Phone' },
  { key: 'mobileNumber', label: 'Mobile Number' },
  { key: 'contactEmail', label: 'Contact Email' },
  { key: 'website', label: 'Website' },
  { key: 'bio', label: 'Bio' },
  { key: 'linkedIn', label: 'LinkedIn URL' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'currentProjects', label: 'Current Projects' },
  { key: 'futureProjects', label: 'Future Projects' },
  { key: 'memberType', label: 'Member Type' },
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
  'province': 'province', 'state': 'province', 'region': 'province', 'county': 'province',
  'address': 'physicalAddress', 'physical address': 'physicalAddress', 'street': 'physicalAddress', 'street address': 'physicalAddress', 'postal address': 'physicalAddress',
  'phone': 'contactPhone', 'telephone': 'contactPhone', 'tel': 'contactPhone', 'mobile': 'contactPhone', 'cell': 'contactPhone', 'phone number': 'contactPhone', 'contact phone': 'contactPhone', 'phonenumber': 'contactPhone',
  'mobile number': 'mobileNumber', 'mobilenumber': 'mobileNumber', 'mobile phone': 'mobileNumber', 'mobilephone': 'mobileNumber', 'cell number': 'mobileNumber', 'cellnumber': 'mobileNumber', 'cell phone': 'mobileNumber', 'cellphone': 'mobileNumber', 'mobile no': 'mobileNumber', 'mob': 'mobileNumber', 'mob number': 'mobileNumber',
  'contact email': 'contactEmail', 'secondary email': 'contactEmail', 'alt email': 'contactEmail',
  'website': 'website', 'web': 'website', 'url': 'website', 'site': 'website', 'webpage': 'website',
  'bio': 'bio', 'about': 'bio', 'description': 'bio', 'biography': 'bio',
  'linkedin': 'linkedIn', 'linkedin url': 'linkedIn', 'linked in': 'linkedIn',
  'twitter': 'twitter', 'twitter handle': 'twitter', 'x': 'twitter',
  'achievements': 'achievements', 'accomplishments': 'achievements',
  'projects': 'currentProjects', 'current projects': 'currentProjects',
  'future projects': 'futureProjects', 'futureprojects': 'futureProjects', 'upcoming projects': 'futureProjects',
  'member type': 'memberType', 'membertype': 'memberType', 'type': 'memberType', 'membership': 'memberType', 'membership type': 'memberType', 'category': 'memberType',
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
const [searchFilterField, setSearchFilterField] = useState<string>('all');

// SMS state
const [smsTargetMode, setSmsTargetMode] = useState<'category' | 'group' | 'individual'>('category');
const [smsCategoryFilter, setSmsCategoryFilter] = useState<string | null>(null);
const [smsGroupType, setSmsGroupType] = useState<'industry' | 'country'>('industry');
const [smsGroupValue, setSmsGroupValue] = useState<string | null>(null);
const [smsMessage, setSmsMessage] = useState('');
const [smsSelectedIds, setSmsSelectedIds] = useState<Set<string>>(new Set());
const [smsSearchQuery, setSmsSearchQuery] = useState('');
const [smsShowHistory, setSmsShowHistory] = useState(false);

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
const [newFutureProjects, setNewFutureProjects] = useState('');
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
const [importProgress, setImportProgress] = useState<{ current: number; total: number; added: number; skipped: number } | null>(null);

// Event form state
const [evtTitle, setEvtTitle] = useState('');
const [evtDesc, setEvtDesc] = useState('');
const [evtCity, setEvtCity] = useState('');
const [evtCountry, setEvtCountry] = useState('');
const [evtVenue, setEvtVenue] = useState('');
const [evtCapacity, setEvtCapacity] = useState('30');
const [evtPrice, setEvtPrice] = useState('');
const [evtCurrency, setEvtCurrency] = useState('BWP');
const [evtDate, setEvtDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
const [showDatePicker, setShowDatePicker] = useState(false);

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
const [rsvpViewTab, setRsvpViewTab] = useState<'all' | 'paid' | 'rsvps' | 'speakers' | 'invited'>('all');

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

// Paid guest form state
const [showAddPaidGuest, setShowAddPaidGuest] = useState(false);
const [paidGuestName, setPaidGuestName] = useState('');
const [paidGuestEmail, setPaidGuestEmail] = useState('');
const [paidGuestPhone, setPaidGuestPhone] = useState('');
const [paidGuestDesignation, setPaidGuestDesignation] = useState('');
const [paidGuestCompany, setPaidGuestCompany] = useState('');
const [paidGuestAmount, setPaidGuestAmount] = useState('');
const [paidGuestMethod, setPaidGuestMethod] = useState('bank_transfer');
const [paidGuestRef, setPaidGuestRef] = useState('');
const [paidGuestNotes, setPaidGuestNotes] = useState('');
const [editingPaidGuestIndex, setEditingPaidGuestIndex] = useState<number | null>(null);

// QR Code ref and handlers
const qrRef = React.useRef<any>(null);

const captureQR = async (): Promise<string | null> => {
  try {
    if (qrRef.current && qrRef.current.capture) {
      return await qrRef.current.capture();
    }
    return null;
  } catch { return null; }
};

const handleShareQRImage = async () => {
  try {
    const uri = await captureQR();
    if (!uri) { Alert.alert('Error', 'Could not capture QR code.'); return; }
    await Share.share({ url: uri, message: 'AOE Registration QR code' });
  } catch { Alert.alert('Error', 'Failed to share QR code.'); }
};

const handleSaveQRToPhotos = async () => {
  try {
    const uri = await captureQR();
    if (!uri) { Alert.alert('Error', 'Could not capture QR code.'); return; }
    await Share.share({ url: uri, message: 'Save AOE Registration QR code' });
  } catch { Alert.alert('Error', 'Failed to save QR code.'); }
};

const handleShareLink = async () => {
  try {
    await Share.share({
      title: 'Join AOE Africa',
      message: `Join AOE Africa! Register here: ${REGISTER_URL}`,
      url: REGISTER_URL,
    });
  } catch {}
};

const handleCopyRegLink = async () => {
  await copyRegistrationLink();
};

// Queries
const stats = useQuery(api.admin.getStats);
const members = useQuery(api.admin.listAllMembers, { search: (searchFilterField === 'all' && searchQuery) ? searchQuery : undefined, memberType: selectedMemberType || undefined, industry: (selectedIndustry && selectedIndustry !== '__all__') ? selectedIndustry : undefined });
const industryCounts = useQuery(
  api.admin.getMemberIndustryCounts,
  selectedMemberType === 'business_community' ? { memberType: 'business_community' } : 'skip'
);
const memberTypeCounts = useQuery(api.admin.getMemberTypeCounts);
const crmMembers = useQuery(api.admin.listAllMembers, { search: crmSearchQuery || undefined });
const events = useQuery(api.events.listEvents, {});
const eventRsvps = useQuery(
api.admin.getEventRsvps,
selectedEvent ? { eventId: selectedEvent._id } : 'skip'
);
const smsMembers = useQuery(api.admin.getMembersWithPhones,
  (smsTargetMode === 'category' || smsTargetMode === 'individual') && smsCategoryFilter
    ? { memberType: smsCategoryFilter }
    : smsTargetMode === 'group' && smsGroupValue
      ? smsGroupType === 'industry' ? { industry: smsGroupValue } : { country: smsGroupValue }
      : {}
);
const smsLogs = useQuery(api.admin.listBulkSmsLogs);
const logBulkSmsMut = useMutation(api.admin.logBulkSms);
const reportData = useQuery(api.admin.getReportData);
const payments = useQuery(api.admin.listPayments,
paymentFilter === 'all' ? {} : { status: paymentFilter }
);
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

// Paid Guest mutations
const addPaidGuestMut = useMutation(api.admin.addPaidGuest);
const updatePaidGuestMut = useMutation(api.admin.updatePaidGuest);
const removePaidGuestMut = useMutation(api.admin.removePaidGuest);

// Guest speaker edit state
const [editingSpeakerIndex, setEditingSpeakerIndex] = useState<number | null>(null);

const convexClient = useConvex();

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
  setNewBio(''); setNewAchievements(''); setNewCurrentProjects(''); setNewFutureProjects(''); setNewLinkedIn('');
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

// ─── Paid Guest form functions ───
const clearPaidGuestForm = () => {
  setPaidGuestName(''); setPaidGuestEmail(''); setPaidGuestPhone('');
  setPaidGuestDesignation(''); setPaidGuestCompany('');
  setPaidGuestAmount(''); setPaidGuestMethod('bank_transfer');
  setPaidGuestRef(''); setPaidGuestNotes('');
  setEditingPaidGuestIndex(null);
};

const handleAddOrEditPaidGuest = async () => {
  if (!paidGuestName.trim()) {
    Alert.alert('Required', 'Name is required');
    return;
  }
  if (!selectedEvent) return;
  try {
    if (editingPaidGuestIndex !== null) {
      await updatePaidGuestMut({
        eventId: selectedEvent._id,
        index: editingPaidGuestIndex,
        name: paidGuestName.trim(),
        email: paidGuestEmail.trim() || undefined,
        phone: paidGuestPhone.trim() || undefined,
        designation: paidGuestDesignation.trim() || undefined,
        company: paidGuestCompany.trim() || undefined,
        amountPaid: paidGuestAmount ? parseFloat(paidGuestAmount) : undefined,
        paymentMethod: paidGuestMethod || undefined,
        paymentRef: paidGuestRef.trim() || undefined,
        notes: paidGuestNotes.trim() || undefined,
      });
      Alert.alert('Updated', 'Paid guest updated');
    } else {
      await addPaidGuestMut({
        eventId: selectedEvent._id,
        name: paidGuestName.trim(),
        email: paidGuestEmail.trim() || undefined,
        phone: paidGuestPhone.trim() || undefined,
        designation: paidGuestDesignation.trim() || undefined,
        company: paidGuestCompany.trim() || undefined,
        amountPaid: paidGuestAmount ? parseFloat(paidGuestAmount) : undefined,
        paymentMethod: paidGuestMethod || undefined,
        paymentRef: paidGuestRef.trim() || undefined,
        notes: paidGuestNotes.trim() || undefined,
      });
      Alert.alert('Added', `${paidGuestName} added as paid guest`);
    }
    clearPaidGuestForm();
    setShowAddPaidGuest(false);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  }
};

const handleRemovePaidGuest = (index: number, name: string) => {
  if (!selectedEvent) return;
  Alert.alert('Remove Paid Guest', `Remove ${name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => {
      try { await removePaidGuestMut({ eventId: selectedEvent._id, index }); }
      catch (e: any) { Alert.alert('Error', e.message); }
    }},
  ]);
};

const openEditPaidGuest = (guest: any, index: number) => {
  setPaidGuestName(guest.name || '');
  setPaidGuestEmail(guest.email || '');
  setPaidGuestPhone(guest.phone || '');
  setPaidGuestDesignation(guest.designation || '');
  setPaidGuestCompany(guest.company || '');
  setPaidGuestAmount(guest.amountPaid ? String(guest.amountPaid) : '');
  setPaidGuestMethod(guest.paymentMethod || 'bank_transfer');
  setPaidGuestRef(guest.paymentRef || '');
  setPaidGuestNotes(guest.notes || '');
  setEditingPaidGuestIndex(index);
  setShowAddPaidGuest(true);
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
      futureProjects: newFutureProjects.trim() || undefined,
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
      futureProjects: newFutureProjects.trim() || undefined,
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
    // Build all member objects from imported rows
    const allMembers = importedRows.map((row: string[]) => {
      const member: any = {};
      // Set memberType if selected
      if (selectedMemberType) {
        member.memberType = selectedMemberType;
      }
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
      // If no name but has email, use email prefix as name
      if (!member.name && member.email) {
        member.name = member.email.split('@')[0].replace(/[._-]/g, ' ').trim();
      }
      // Clean: remove any undefined/null values
      const cleaned: any = {};
      for (const [k, v] of Object.entries(member)) {
        if (v !== undefined && v !== null && v !== '') {
          cleaned[k] = String(v);
        }
      }
      return cleaned;
    }).filter((m: any) => m.name && m.email);

    if (allMembers.length === 0) {
      Alert.alert('Error', 'No valid members found after mapping. Ensure rows have name and email values.');
      return;
    }

    // Phase 1: Check which emails already exist (in batches of 500)
    setImportProgress({ current: 0, total: allMembers.length, added: 0, skipped: 0 });

    const allEmails = allMembers.map((m: any) => m.email);
    const existingEmailSet = new Set<string>();
    const EMAIL_CHECK_SIZE = 500;

    for (let i = 0; i < allEmails.length; i += EMAIL_CHECK_SIZE) {
      const emailBatch = allEmails.slice(i, i + EMAIL_CHECK_SIZE);
      try {
        const existing = await convexClient.query(api.admin.getExistingEmails, { emails: emailBatch });
        existing.forEach((e: string) => existingEmailSet.add(e));
      } catch (err) {
        // If email check fails, proceed without pre-filtering
        console.log('Email pre-check failed, proceeding without filter:', err);
        break;
      }
    }

    // Separate new members from already-imported ones
    const newMembers = allMembers.filter((m: any) => !existingEmailSet.has(m.email));
    const alreadyImported = allMembers.length - newMembers.length;

    if (newMembers.length === 0) {
      setImportProgress(null);
      Alert.alert('All Imported', `All ${allMembers.length} members are already in the database. Nothing new to import.`);
      return;
    }

    // Phase 2: Import only new members in batches
    const CHUNK_SIZE = 50;
    let totalAdded = 0;
    let totalSkipped = alreadyImported;
    let failedBatches: { idx: number; error: string }[] = [];
    const totalChunks = Math.ceil(newMembers.length / CHUNK_SIZE);

    setImportProgress({ current: 0, total: allMembers.length, added: 0, skipped: totalSkipped });

    for (let batchIdx = 0; batchIdx < totalChunks; batchIdx++) {
      const start = batchIdx * CHUNK_SIZE;
      const chunk = newMembers.slice(start, start + CHUNK_SIZE);

      let success = false;
      let lastError = '';

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await bulkAddMembers({ members: chunk });
          totalAdded += result.added;
          totalSkipped += result.skipped;
          success = true;
          break;
        } catch (batchError: any) {
          lastError = batchError?.message || 'Unknown error';
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
          }
        }
      }

      if (!success) {
        failedBatches.push({ idx: batchIdx + 1, error: lastError });
        // Show error on first failure so user knows what's happening
        if (failedBatches.length === 1) {
          Alert.alert(
            'Batch Error',
            `Batch ${batchIdx + 1} failed: ${lastError}\n\nContinuing with remaining batches...`
          );
        }
      }

      const processed = alreadyImported + Math.min(start + CHUNK_SIZE, newMembers.length);
      setImportProgress({ current: processed, total: allMembers.length, added: totalAdded, skipped: totalSkipped });

      // Delay between batches
      if (batchIdx < totalChunks - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    setImportProgress(null);

    let message = `New members added: ${totalAdded}`;
    if (alreadyImported > 0) {
      message += `\nAlready in database: ${alreadyImported}`;
    }
    if (totalSkipped - alreadyImported > 0) {
      message += `\nDuplicates in file: ${totalSkipped - alreadyImported}`;
    }
    if (failedBatches.length > 0) {
      message += `\n\n${failedBatches.length} batch(es) failed. Error: ${failedBatches[0].error}\n\nRe-run the import to retry failed records.`;
    }
    Alert.alert('Import Complete', message);
    setShowFieldMapping(false);
    setBulkText('');
    setImportedHeaders([]);
    setImportedRows([]);
    setFieldMappings({});
  } catch (e: any) {
    setImportProgress(null);
    Alert.alert('Import Error', `${e.message}\n\nYou can re-run the import safely - already imported members will be skipped.`);
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
  setNewFutureProjects(member.futureProjects || '');
  setNewLinkedIn(member.linkedIn || '');
  setNewWebsite(member.website || '');
  setShowEditMember(true);
};

const clearEventForm = () => {
  setEvtTitle(''); setEvtDesc(''); setEvtCity(''); setEvtCountry('');
  setEvtVenue(''); setEvtCapacity('30'); setEvtPrice(''); setEvtCurrency('BWP');
  setEvtSponsors([]);
  setEvtDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  setShowDatePicker(false);
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
      date: evtDate.getTime(),
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
      date: evtDate.getTime(),
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
  setEvtDate(event.date ? new Date(event.date) : new Date());
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
    await Share.share({ url: fileUri, message: `Exported ${fileName}` });
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

    {/* ─── Registration QR Code ─── */}
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '18', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="qr-code" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.text }}>Member Registration QR</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 }}>Share to invite new members</Text>
        </View>
      </View>

      {/* QR Code with ViewShot for capture */}
      <ViewShot ref={qrRef} options={{ format: 'png', quality: 1.0 }}>
        <View style={{ alignItems: 'center', backgroundColor: '#fff', borderRadius: borderRadius.md, padding: spacing.md }}>
          <QRCodeStyled
            data={REGISTER_URL}
            style={{ backgroundColor: 'white' }}
            padding={10}
            pieceSize={4}
            pieceBorderRadius={2}
            color={'#000'}
          />
          <Text style={{ marginTop: 8, fontSize: 10, color: '#888', fontWeight: '500' }}>app.aoeafrica.org.za</Text>
        </View>
      </ViewShot>

      {/* Registration Link */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
      }}>
        <Ionicons name="link-outline" size={16} color={colors.primary} />
        <Text style={{ flex: 1, fontSize: fontSize.sm, color: colors.primary, fontWeight: '500' }} numberOfLines={1}>{REGISTER_URL}</Text>
        <TouchableOpacity onPress={handleCopyRegLink} style={{ padding: 6, backgroundColor: colors.primary + '15', borderRadius: borderRadius.sm }}>
          <Ionicons name="copy-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md }}>
        <TouchableOpacity
          style={{ flex: 1, minWidth: (width - 80) / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: borderRadius.md }}
          onPress={handleShareQRImage}
        >
          <Ionicons name="share-outline" size={16} color="#000" />
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: '#000' }}>Share QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, minWidth: (width - 80) / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success + '15', paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.success + '40' }}
          onPress={handleSaveQRToPhotos}
        >
          <Ionicons name="download-outline" size={16} color={colors.success} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.success }}>Save to Photos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, minWidth: (width - 80) / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.info + '15', paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.info + '40' }}
          onPress={handleShareLink}
        >
          <Ionicons name="send-outline" size={16} color={colors.info} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.info }}>Share Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, minWidth: (width - 80) / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface, paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }}
          onPress={handleCopyRegLink}
        >
          <Ionicons name="copy-outline" size={16} color={colors.textSecondary} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary }}>Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={{ height: 24 }} />
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

const renderMembers = () => (
  <AdminMembersPanel
    styles={styles}
    colors={colors}
    borderRadius={borderRadius}
    fontSize={fontSize}
    MEMBER_TYPES={MEMBER_TYPES}
    selectedMemberType={selectedMemberType}
    setSelectedMemberType={setSelectedMemberType}
    selectedIndustry={selectedIndustry}
    setSelectedIndustry={setSelectedIndustry}
    memberSubTab={memberSubTab}
    setMemberSubTab={setMemberSubTab}
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    searchFilterField={searchFilterField}
    setSearchFilterField={setSearchFilterField}
    memberTypeCounts={memberTypeCounts}
    industryCounts={industryCounts}
    members={members}
    handleCSVImport={handleCSVImport}
    handleContactsImport={handleContactsImport}
    handleBulkAdd={handleBulkAdd}
    openEditMember={openEditMember}
    handleDeleteMember={handleDeleteMember}
    clearMemberForm={clearMemberForm}
    setShowAddMember={setShowAddMember}
    setShowMemberNotes={setShowMemberNotes}
    setSelectedMember={setSelectedMember}
    bulkText={bulkText}
    setBulkText={setBulkText}
  />
);

// ─── TAB: EVENTS ───
const renderEvents = () => (
  <AdminEventsPanel
    styles={styles}
    colors={colors}
    events={events}
    formatDate={formatDate}
    formatCurrency={formatCurrency}
    sortEventsByDate={sortEventsByDate}
    clearEventForm={clearEventForm}
    setShowCreateEvent={setShowCreateEvent}
    setSelectedEvent={setSelectedEvent}
    setShowEventRsvps={setShowEventRsvps}
    openEditEvent={openEditEvent}
    handleDeleteEvent={handleDeleteEvent}
    reorderEvent={reorderEvent}
  />
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

// ─── TAB: BULK SMS ───
const renderSMS = () => (
  <AdminSmsPanel
    styles={styles}
    smsShowHistory={smsShowHistory}
    setSmsShowHistory={setSmsShowHistory}
    smsLogs={smsLogs || []}
    smsMembers={smsMembers || []}
    reportData={reportData}
    memberTypes={MEMBER_TYPES as any}
    industries={INDUSTRIES}
    smsTargetMode={smsTargetMode}
    setSmsTargetMode={setSmsTargetMode}
    smsCategoryFilter={smsCategoryFilter}
    setSmsCategoryFilter={setSmsCategoryFilter}
    smsGroupType={smsGroupType}
    setSmsGroupType={setSmsGroupType}
    smsGroupValue={smsGroupValue}
    setSmsGroupValue={setSmsGroupValue}
    smsMessage={smsMessage}
    setSmsMessage={setSmsMessage}
    smsSelectedIds={smsSelectedIds}
    setSmsSelectedIds={setSmsSelectedIds}
    smsSearchQuery={smsSearchQuery}
    setSmsSearchQuery={setSmsSearchQuery}
    logBulkSmsMut={logBulkSmsMut}
  />
);

// ─── TAB: REPORTS ───
const renderReports = () => (
  <AdminReportsPanel
    styles={styles}
    colors={colors}
    formatCurrency={formatCurrency}
    formatDate={formatDate}
    reportData={reportData}
  />
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
          {renderInput('Future Projects', newFutureProjects, setNewFutureProjects, { multiline: true })}
          <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
            <Text style={styles.primaryBtnText}>{title}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

const renderEventFormModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string) => (
  <AdminEventFormModal
    visible={visible}
    onClose={onClose}
    onSubmit={onSubmit}
    title={title}
    styles={styles}
    colors={colors}
    fontSize={fontSize}
    evtTitle={evtTitle}
    setEvtTitle={setEvtTitle}
    evtDesc={evtDesc}
    setEvtDesc={setEvtDesc}
    evtDate={evtDate}
    setEvtDate={setEvtDate}
    showDatePicker={showDatePicker}
    setShowDatePicker={setShowDatePicker}
    evtCity={evtCity}
    setEvtCity={setEvtCity}
    evtCountry={evtCountry}
    setEvtCountry={setEvtCountry}
    evtVenue={evtVenue}
    setEvtVenue={setEvtVenue}
    evtCapacity={evtCapacity}
    setEvtCapacity={setEvtCapacity}
    evtPrice={evtPrice}
    setEvtPrice={setEvtPrice}
    evtCurrency={evtCurrency}
    setEvtCurrency={setEvtCurrency}
    evtSponsors={evtSponsors}
    setEvtSponsors={setEvtSponsors}
    sponsorName={sponsorName}
    setSponsorName={setSponsorName}
    sponsorTier={sponsorTier}
    sponsorWebsite={sponsorWebsite}
    setSponsorWebsite={setSponsorWebsite}
    selectedEvent={selectedEvent}
    renderInput={renderInput}
    renderChipPicker={renderChipPicker}
    clearSpeakerForm={clearSpeakerForm}
    setShowAddSpeaker={setShowAddSpeaker}
    openEditSpeaker={openEditSpeaker}
    handleRemoveSpeaker={handleRemoveSpeaker}
    clearInvGuestForm={clearInvGuestForm}
    setShowAddInvitedGuest={setShowAddInvitedGuest}
    openEditInvGuest={openEditInvGuest}
    handleRemoveInvGuest={handleRemoveInvGuest}
  />
);

// ─── MAIN RENDER ───
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: 12, height: 44, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
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
  importMethodBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  importMethodText: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: '500' },
  importMethodTextActive: { color: colors.white, fontWeight: '600' },
});
const tabs: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Home', icon: 'grid' },
  { key: 'members', label: 'Members', icon: 'people' },
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'conferences', label: 'Conferences', icon: 'business' },
  { key: 'payments', label: 'Pay', icon: 'cash' },
  { key: 'reports', label: 'Reports', icon: 'bar-chart' },
  { key: 'crm', label: 'CRM', icon: 'chatbubbles' },
  { key: 'sms', label: 'SMS', icon: 'chatbox-ellipses' },
];

return (
  <SafeAreaView style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
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
    {activeTab === 'conferences' && <ConferenceAdminScreen />}
    {activeTab === 'payments' && renderPayments()}
    {activeTab === 'reports' && renderReports()}
    {activeTab === 'crm' && renderCRM()}
    {activeTab === 'sms' && renderSMS()}

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
              {(['all', 'paid', 'rsvps', 'speakers', 'invited'] as const).map(tab => (
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
                <TouchableOpacity style={styles.addBtn} onPress={() => { setShowEventRsvps(false); setTimeout(() => { clearSpeakerForm(); setShowAddSpeaker(true); }, 300); }}>
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
                      {item.phone && <Text style={styles.memberSub}>{item.phone}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.success : colors.warning }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => { setShowEventRsvps(false); setTimeout(() => openEditSpeaker(item, index), 300); }}>
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
                <TouchableOpacity style={styles.addBtn} onPress={() => { setShowEventRsvps(false); setTimeout(() => { clearInvGuestForm(); setShowAddInvitedGuest(true); }, 300); }}>
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
                      {item.phone && <Text style={styles.memberSub}>{item.phone}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.success : colors.warning }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => { setShowEventRsvps(false); setTimeout(() => openEditInvGuest(item, index), 300); }}>
                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveInvGuest(index, item.name)}>
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
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity style={styles.exportBtn} onPress={() => exportToCSV('paid')}>
                  <Ionicons name="download-outline" size={16} color={colors.primary} />
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setShowEventRsvps(false); setTimeout(() => { clearPaidGuestForm(); setShowAddPaidGuest(true); }, 300); }}>
                  <Ionicons name="add" size={18} color={colors.white} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[
                  ...(selectedEvent?.paidGuests || []).map((g: any, i: number) => ({ ...g, _source: 'manual', _index: i, key: 'paid-' + i, })),
                  ...(eventRsvps || []).filter((r: any) => r.paymentStatus === 'paid').map((r: any) => ({ name: r.userName || 'Unknown', email: r.userEmail, company: r.userCompany, phone: r.userPhone, _source: 'rsvp', key: 'rsvp-' + r._id })),
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
                      {item.designation && <Text style={styles.memberSub}>{item.designation}</Text>}
                      {item.amountPaid && <Text style={[styles.memberSub, { color: colors.success }]}>Paid: {item.amountPaid}{item.paymentMethod ? ` (${item.paymentMethod})` : ''}</Text>}
                      {item.paymentRef && <Text style={styles.memberSub}>Ref: {item.paymentRef}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={[styles.statusBadge, { backgroundColor: colors.success + '30' }]}>
                        <Text style={[styles.statusText, { color: colors.success }]}>{item._source === 'manual' ? 'Paid' : 'RSVP Paid'}</Text>
                      </View>
                      {item._source === 'manual' && (
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                          <TouchableOpacity onPress={() => { setShowEventRsvps(false); setTimeout(() => openEditPaidGuest(item, item._index), 300); }}>
                            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleRemovePaidGuest(item._index, item.name)}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      )}
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
                  ...(selectedEvent?.paidGuests || []).map((p: any, i: number) => ({ type: 'Paid', name: p.name, email: p.email, company: p.company, phone: p.phone, status: 'paid', paymentStatus: 'paid', key: 'paid-' + i })),
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

    {/* Add Paid Guest Modal */}
    <Modal visible={showAddPaidGuest} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingPaidGuestIndex !== null ? 'Update Paid Guest' : 'Add Paid Guest'}</Text>
            <TouchableOpacity onPress={() => { setShowAddPaidGuest(false); clearPaidGuestForm(); }}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderInput('Name *', paidGuestName, setPaidGuestName)}
            {renderInput('Email', paidGuestEmail, setPaidGuestEmail, { keyboardType: 'email-address' })}
            {renderInput('Phone', paidGuestPhone, setPaidGuestPhone, { keyboardType: 'phone-pad' })}
            {renderInput('Designation', paidGuestDesignation, setPaidGuestDesignation)}
            {renderInput('Company', paidGuestCompany, setPaidGuestCompany)}
            {renderInput('Amount *', paidGuestAmount, setPaidGuestAmount, { keyboardType: 'numeric' })}
            {renderChipPicker('Method', PAYMENT_METHODS, paidGuestMethod, setPaidGuestMethod)}
            {renderInput('Reference', paidGuestRef, setPaidGuestRef)}
            {renderInput('Notes', paidGuestNotes, setPaidGuestNotes, { multiline: true })}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddOrEditPaidGuest}>
              <Text style={styles.primaryBtnText}>{editingPaidGuestIndex !== null ? 'Update' : 'Add Paid Guest'}</Text>
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

            {importProgress ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                <Text style={{ color: colors.white, fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                  Importing {importProgress.current} of {importProgress.total}...
                </Text>
                <View style={{ height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ height: 8, backgroundColor: colors.primary, borderRadius: 4, width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }} />
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                  Added: {importProgress.added} | Skipped: {importProgress.skipped}
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmImport}>
                <Text style={styles.primaryBtnText}>Import {importedRows.length} Members</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  </SafeAreaView>
);


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

}