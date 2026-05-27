import React, { useState, useRef, useEffect } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Image,
Modal,
TextInput,
Alert,
FlatList,
Dimensions,
Linking,
KeyboardAvoidingView,
Platform,
ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convexApi';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { useDemo } from '../lib/DemoContext';

const { width } = Dimensions.get('window');

type TabType = 'discover' | 'connections' | 'messages';

// Generate a unique profile image URL based on the person's name
function getProfileImage(name?: string | null) {
  const displayName = name || 'person';
  // Simple hash from name to get a unique numeric seed
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = ((hash << 5) - hash) + displayName.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const genders = ['man', 'woman'];
  const ages = ['young', 'middle-aged', 'mature'];
  const styles = ['professional headshot', 'corporate portrait', 'business photo', 'executive portrait', 'linkedin profile photo'];
  const backgrounds = ['modern office', 'neutral gray studio', 'warm bokeh', 'bright white studio', 'city skyline'];
  const attire = ['dark suit and tie', 'smart casual blazer', 'colorful African print', 'formal business dress', 'crisp white shirt'];

  const gender = genders[seed % genders.length];
  const age = ages[seed % ages.length];
  const style = styles[seed % styles.length];
  const bg = backgrounds[Math.floor(seed / 3) % backgrounds.length];
  const att = attire[Math.floor(seed / 7) % attire.length];

  const prompt = `${style} of a ${age} African ${gender}, ${att}, ${bg} background, photorealistic, sharp focus`;
  return `https://api.a0.dev/assets/image?text=${encodeURIComponent(prompt)}&aspect=1:1&seed=${seed}`;
}

const INDUSTRIES = [
'All',
'Agriculture',
'Fintech',
'Healthcare',
'Energy',
'Education',
'Logistics',
'Construction',
'Cybersecurity',
'Venture Capital',
'Creative & Media',
'Other',
];

export default function NetworkScreen() {
const navigation = useNavigation<any>();
const { isDemo, exitDemo } = useDemo();
const [tab, setTab] = useState<TabType>('discover');
const [search, setSearch] = useState('');
const [filterIndustry, setFilterIndustry] = useState('All');
const [selectedMember, setSelectedMember] = useState<any>(null);
const [chatMember, setChatMember] = useState<any>(null);
const [chatConvoId, setChatConvoId] = useState<any>(null);
const [messageText, setMessageText] = useState('');
const scrollRef = useRef<ScrollView>(null);

const members = useQuery(api.users.listMembers, {});
const connections = useQuery(api.connections.getMyConnections);
const currentUser = useQuery(api.users.getCurrentUser);
const conversations = useQuery(api.messaging.getMyConversations);
const chatMessages = useQuery(
api.messaging.getMessages,
chatConvoId ? { conversationId: chatConvoId } : "skip"
);

const sendRequest = useMutation(api.connections.sendRequest);
const respondToRequest = useMutation(api.connections.respondToRequest);
const getOrCreateConvo = useMutation(api.messaging.getOrCreateConversation);
const sendMsg = useMutation(api.messaging.sendMessage);

const connectedUserIds = new Set(
connections?.filter((c) => c.status === 'accepted').map((c) => c.userId) || []
);
const pendingUserIds = new Set(
connections?.filter((c) => c.status === 'pending').map((c) => c.userId) || []
);

const filteredMembers = members?.filter((m) => {
if (m._id === currentUser?._id) return false;
const matchesSearch =
!search ||
m.name?.toLowerCase().includes(search.toLowerCase()) ||
m.company?.toLowerCase().includes(search.toLowerCase()) ||
m.country?.toLowerCase().includes(search.toLowerCase()) ||
m.industry?.toLowerCase().includes(search.toLowerCase());
const matchesIndustry =
filterIndustry === 'All' || m.industry === filterIndustry;
return matchesSearch && matchesIndustry;
});

const pendingIncoming = connections?.filter(
(c) => c.status === 'pending' && c.isIncoming
);
const acceptedConnections = connections?.filter(
(c) => c.status === 'accepted'
);

const demoGuard = (action: string) => {
if (isDemo) {
Alert.alert('Account Required', `Create an account to ${action}.`, [
{ text: 'Cancel', style: 'cancel' },
{ text: 'Sign Up', onPress: exitDemo },
]);
return true;
}
return false;
};

const handleConnect = async (userId: any, member?: any) => {
if (demoGuard('connect with members')) return;
try {
// Send connection request in background
sendRequest({ toUserId: userId }).catch(() => {});
// Open chat directly
const convoId = await getOrCreateConvo({ otherUserId: userId });
setChatConvoId(convoId);
setChatMember(member || members?.find((m) => m._id === userId) || { _id: userId, name: 'Member' });
} catch (e: any) {
Alert.alert('Error', e.message || 'Failed to start conversation');
}
};

const handleRespond = async (connectionId: any, accept: boolean) => {
if (demoGuard('manage connections')) return;
try {
await respondToRequest({ connectionId, accept });
} catch (e: any) {
Alert.alert('Error', e.message || 'Failed');
}
};

const handleMessage = async (member: any) => {
if (demoGuard('message members')) return;
try {
const convoId = await getOrCreateConvo({ otherUserId: member._id || member.userId });
setChatConvoId(convoId);
setChatMember(member);
} catch (e: any) {
Alert.alert('Error', e.message || 'Failed to start conversation');
}
};

const handleSendMessage = async () => {
if (!messageText.trim() || !chatConvoId) return;
try {
await sendMsg({ conversationId: chatConvoId, content: messageText.trim() });
setMessageText('');
} catch (e: any) {
Alert.alert('Error', e.message || 'Failed to send');
}
};

const getConnectionStatus = (memberId: string) => {
if (connectedUserIds.has(memberId as any)) return 'connected';
if (pendingUserIds.has(memberId as any)) return 'pending';
return 'none';
};

// Member Card Component
const renderMemberCard = (member: any, showActions = true) => {
const status = getConnectionStatus(member._id);
return (
<TouchableOpacity
key={member._id}
style={styles.memberCard}
onPress={() => setSelectedMember(member)}
activeOpacity={0.7}
>
<Image
source={{ uri: member.image || getProfileImage(member.name) }}
style={styles.avatar}
/>
<View style={styles.memberInfo}>
<Text style={styles.memberName} numberOfLines={1}>
{member.name || 'Anonymous'}
</Text>
<Text style={styles.memberRole} numberOfLines={1}>
{member.role}{member.company ? ` at ${member.company}` : ''}
</Text>
<View style={styles.metaRow}>
{member.country && (
<View style={styles.metaChip}>
<Ionicons name="location" size={10} color={colors.primary} />
<Text style={styles.metaText}>{member.city ? `${member.city}, ` : ''}{member.country}</Text>
</View>
)}
{member.industry && (
<View style={[styles.metaChip, { backgroundColor: colors.accent + '20' }]}>
<Text style={[styles.metaText, { color: colors.accentLight }]}>{member.industry}</Text>
</View>
)}
</View>
</View>
{showActions && (
<View style={styles.cardActions}>
{status === 'connected' ? (
<TouchableOpacity
style={styles.messageBtn}
onPress={(e) => {
e.stopPropagation?.();
handleMessage(member);
}}
>
<Ionicons name="chatbubble" size={16} color={colors.primary} />
</TouchableOpacity>
) : status === 'pending' ? (
<View style={styles.pendingBadge}>
<Ionicons name="time" size={14} color={colors.warning} />
</View>
) : (
<TouchableOpacity
style={styles.connectBtn}
onPress={(e) => {
e.stopPropagation?.();
handleConnect(member._id, member);
}}
>
<Ionicons name="person-add" size={14} color={colors.primary} />
</TouchableOpacity>
)}
</View>
)}
</TouchableOpacity>
);
};

// Member Detail Modal
const renderMemberDetail = () => {
if (!selectedMember) return null;
const m = selectedMember;
const status = getConnectionStatus(m._id);

return (
<Modal visible={!!selectedMember} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}>
<SafeAreaView edges={['top']} style={{ flex: 1 }}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedMember(null)}>
<Ionicons name="close" size={28} color={colors.text} />
</TouchableOpacity>
<Text style={styles.modalTitle}>Profile</Text>
<View style={{ width: 28 }} />
</View>

<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
{/* Profile Header */}
<View style={styles.profileHeader}>
<Image
source={{ uri: m.image || getProfileImage(m.name) }}
style={styles.profileImage}
/>
<Text style={styles.profileName}>{m.name}</Text>
<Text style={styles.profileRole}>
{m.role}{m.company ? ` at ${m.company}` : ''}
</Text>
<View style={styles.locationChip}>
<Ionicons name="location" size={14} color={colors.primary} />
<Text style={styles.locationText}>
{m.city ? `${m.city}, ` : ''}{m.country}
</Text>
</View>
{m.industry && (
<View style={styles.industryChip}>
<Text style={styles.industryChipText}>{m.industry}</Text>
</View>
)}
</View>

{/* Action Buttons */}
<View style={styles.actionRow}>
{status === 'connected' ? (
<>
<View style={[styles.actionBtn, styles.actionBtnConnected]}>
<Ionicons name="checkmark-circle" size={18} color={colors.success} />
<Text style={[styles.actionBtnText, { color: colors.success }]}>Connected</Text>
</View>
<TouchableOpacity
style={[styles.actionBtn, styles.actionBtnPrimary]}
onPress={() => {
setSelectedMember(null);
handleMessage(m);
}}
>
<Ionicons name="chatbubble" size={18} color={colors.black} />
<Text style={[styles.actionBtnText, { color: colors.black }]}>Message</Text>
</TouchableOpacity>
</>
) : status === 'pending' ? (
<View style={[styles.actionBtn, { borderColor: colors.warning }]}>
<Ionicons name="time" size={18} color={colors.warning} />
<Text style={[styles.actionBtnText, { color: colors.warning }]}>Pending</Text>
</View>
) : (
<TouchableOpacity
style={[styles.actionBtn, styles.actionBtnPrimary]}
onPress={() => handleConnect(m._id, m)}
>
<Ionicons name="person-add" size={18} color={colors.black} />
<Text style={[styles.actionBtnText, { color: colors.black }]}>Connect</Text>
</TouchableOpacity>
)}
</View>

{/* Bio */}
{m.bio && (
<View style={styles.section}>
<Text style={styles.sectionTitle}>About</Text>
<Text style={styles.sectionBody}>{m.bio}</Text>
</View>
)}

{/* Achievements */}
{m.achievements && (
<View style={styles.section}>
<View style={styles.sectionTitleRow}>
<Ionicons name="trophy" size={18} color={colors.primary} />
<Text style={styles.sectionTitle}>Achievements</Text>
</View>
<Text style={styles.sectionBody}>{m.achievements}</Text>
</View>
)}

{/* Current Projects */}
{m.currentProjects && (
<View style={styles.section}>
<View style={styles.sectionTitleRow}>
<Ionicons name="rocket" size={18} color={colors.accentLight} />
<Text style={styles.sectionTitle}>Current Projects</Text>
</View>
<Text style={styles.sectionBody}>{m.currentProjects}</Text>
</View>
)}

{/* Future Projects */}
{m.futureProjects && (
<View style={styles.section}>
<View style={styles.sectionTitleRow}>
<Ionicons name="telescope" size={18} color={colors.info} />
<Text style={styles.sectionTitle}>Future Vision</Text>
</View>
<Text style={styles.sectionBody}>{m.futureProjects}</Text>
</View>
)}

{/* Skills */}
{m.skills && m.skills.length > 0 && (
<View style={styles.section}>
<Text style={styles.sectionTitle}>Expertise</Text>
<View style={styles.skillsRow}>
{m.skills.map((skill: string, i: number) => (
<View key={i} style={styles.skillChip}>
<Text style={styles.skillText}>{skill}</Text>
</View>
))}
</View>
</View>
)}

{/* Contact Details */}
<View style={styles.section}>
<Text style={styles.sectionTitle}>Contact</Text>
<View style={styles.contactList}>
{m.contactEmail && (
<TouchableOpacity
style={styles.contactRow}
onPress={() => Linking.openURL(`mailto:${m.contactEmail}`)}
>
<View style={styles.contactIcon}>
<Ionicons name="mail" size={16} color={colors.primary} />
</View>
<Text style={styles.contactText}>{m.contactEmail}</Text>
<Ionicons name="open-outline" size={14} color={colors.textMuted} />
</TouchableOpacity>
)}
{m.contactPhone && (
<TouchableOpacity
style={styles.contactRow}
onPress={() => Linking.openURL(`tel:${m.contactPhone}`)}
>
<View style={styles.contactIcon}>
<Ionicons name="call" size={16} color={colors.primary} />
</View>
<Text style={styles.contactText}>{m.contactPhone}</Text>
<Ionicons name="open-outline" size={14} color={colors.textMuted} />
</TouchableOpacity>
)}
{m.physicalAddress && (
<View style={styles.contactRow}>
<View style={styles.contactIcon}>
<Ionicons name="business" size={16} color={colors.primary} />
</View>
<Text style={styles.contactText}>{m.physicalAddress}</Text>
</View>
)}
{m.linkedIn && (
<TouchableOpacity
style={styles.contactRow}
onPress={() => Linking.openURL(`https://${m.linkedIn}`)}
>
<View style={styles.contactIcon}>
<Ionicons name="logo-linkedin" size={16} color="#0A66C2" />
</View>
<Text style={styles.contactText}>{m.linkedIn}</Text>
<Ionicons name="open-outline" size={14} color={colors.textMuted} />
</TouchableOpacity>
)}
{m.twitter && (
<TouchableOpacity
style={styles.contactRow}
onPress={() => Linking.openURL(`https://x.com/${m.twitter?.replace('@', '')}`)}
>
<View style={styles.contactIcon}>
<Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
</View>
<Text style={styles.contactText}>{m.twitter}</Text>
<Ionicons name="open-outline" size={14} color={colors.textMuted} />
</TouchableOpacity>
)}
{m.website && (
<TouchableOpacity
style={styles.contactRow}
onPress={() => Linking.openURL(`https://${m.website}`)}
>
<View style={styles.contactIcon}>
<Ionicons name="globe" size={16} color={colors.primary} />
</View>
<Text style={styles.contactText}>{m.website}</Text>
<Ionicons name="open-outline" size={14} color={colors.textMuted} />
</TouchableOpacity>
)}
</View>
</View>

<View style={{ height: 40 }} />
</ScrollView>
</SafeAreaView>
</View>
</Modal>
);
};

// Chat Modal
const renderChatModal = () => {
if (!chatMember) return null;

return (
<Modal visible={!!chatMember} animationType="slide" presentationStyle="pageSheet">
<View style={styles.modalContainer}>
<SafeAreaView edges={['top']} style={{ flex: 1 }}>
<View style={styles.chatHeader}>
<TouchableOpacity onPress={() => { setChatMember(null); setChatConvoId(null); }}>
<Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
<Image
source={{ uri: chatMember.image || chatMember.otherUserImage }}
style={styles.chatAvatar}
/>
<View style={{ flex: 1 }}>
<Text style={styles.chatName} numberOfLines={1}>
{chatMember.name || chatMember.otherUserName}
</Text>
<Text style={styles.chatRole} numberOfLines={1}>
{chatMember.role || chatMember.otherUserRole || ''}{chatMember.company || chatMember.otherUserCompany ? ` at ${chatMember.company || chatMember.otherUserCompany}` : ''}
</Text>
</View>
</View>

<ScrollView
ref={scrollRef}
style={styles.chatBody}
contentContainerStyle={styles.chatBodyContent}
onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
>
{(!chatMessages || chatMessages.length === 0) && (
<View style={styles.chatEmpty}>
<Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
<Text style={styles.chatEmptyText}>Start the conversation</Text>
<Text style={styles.chatEmptySubtext}>
Send a message to {chatMember.name || chatMember.otherUserName}
</Text>
</View>
)}
{chatMessages?.map((msg) => (
<View
key={msg._id}
style={[
styles.messageBubble,
msg.isMine ? styles.myMessage : styles.theirMessage,
]}
>
<Text style={[styles.messageText, msg.isMine && { color: colors.black }]}>
{msg.content}
</Text>
<Text style={[styles.messageTime, msg.isMine && { color: 'rgba(0,0,0,0.5)' }]}>
{new Date(msg._creationTime).toLocaleTimeString([], {
hour: '2-digit',
minute: '2-digit',
})}
</Text>
</View>
))}
</ScrollView>

<KeyboardAvoidingView
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
keyboardVerticalOffset={10}
>
<View style={styles.chatInputRow}>
<TextInput
style={styles.chatInput}
placeholder="Type a message..."
placeholderTextColor={colors.textMuted}
value={messageText}
onChangeText={setMessageText}
multiline
maxLength={1000}
/>
<TouchableOpacity
style={[
styles.sendBtn,
!messageText.trim() && { opacity: 0.4 },
]}
onPress={handleSendMessage}
disabled={!messageText.trim()}
>
<Ionicons name="send" size={20} color={colors.black} />
</TouchableOpacity>
</View>
</KeyboardAvoidingView>
</SafeAreaView>
</View>
</Modal>
);
};

return (
<View style={styles.container}>
<SafeAreaView edges={['top']} style={styles.safeArea}>
<View style={styles.header}>
<TouchableOpacity
style={styles.backButton}
onPress={() => {
if (navigation.canGoBack()) navigation.goBack();
else navigation.navigate('HomeTab');
}}
accessibilityRole="button"
accessibilityLabel="Go back"
>
<Ionicons name="arrow-back" size={22} color={colors.primary} />
<Text style={styles.backButtonText}>Back</Text>
</TouchableOpacity>
<Text style={styles.headerTitle}>Network</Text>
<Text style={styles.headerSubtitle}>
{members?.length || 0} Entrepreneurs
</Text>
</View>

{/* Tabs */}
<View style={styles.tabRow}>
{(['discover', 'connections', 'messages'] as TabType[]).map((t) => (
<TouchableOpacity
key={t}
style={[styles.tab, tab === t && styles.tabActive]}
onPress={() => setTab(t)}
>
<Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
{t === 'discover' ? 'Discover' : t === 'connections' ? 'Connections' : 'Messages'}
{t === 'connections' && pendingIncoming && pendingIncoming.length > 0 && (
<Text style={{ color: colors.error }}> {pendingIncoming.length}</Text>
)}
</Text>
</TouchableOpacity>
))}
</View>

{/* Discover Tab */}
{tab === 'discover' && (
<>
{/* Search */}
<View style={styles.searchRow}>
<View style={styles.searchBox}>
<Ionicons name="search" size={18} color={colors.textMuted} />
<TextInput
style={styles.searchInput}
placeholder="Search name, company, country..."
placeholderTextColor={colors.textMuted}
value={search}
onChangeText={setSearch}
/>
{search.length > 0 && (
<TouchableOpacity onPress={() => setSearch('')}>
<Ionicons name="close-circle" size={18} color={colors.textMuted} />
</TouchableOpacity>
)}
</View>
</View>

{/* Industry Filter */}
<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={styles.filterScroll}
contentContainerStyle={styles.filterRow}
>
{INDUSTRIES.map((ind) => (
<TouchableOpacity
key={ind}
style={[
styles.filterChip,
filterIndustry === ind && styles.filterChipActive,
]}
onPress={() => setFilterIndustry(ind)}
>
<Text
style={[
styles.filterChipText,
filterIndustry === ind && styles.filterChipTextActive,
]}
>
{ind}
</Text>
</TouchableOpacity>
))}
</ScrollView>

<FlatList
data={filteredMembers}
keyExtractor={(item) => item._id}
renderItem={({ item }) => renderMemberCard(item)}
contentContainerStyle={styles.list}
showsVerticalScrollIndicator={false}
ListEmptyComponent={
<View style={styles.emptyState}>
<Ionicons name="search" size={48} color={colors.textMuted} />
<Text style={styles.emptyText}>No members found</Text>
<Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
</View>
}
ListFooterComponent={<View style={{ height: 100 }} />}
/>
</>
)}

{/* Connections Tab */}
{tab === 'connections' && (
<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
{/* Pending Requests */}
{pendingIncoming && pendingIncoming.length > 0 && (
<View style={styles.sectionBlock}>
<Text style={styles.sectionLabel}>
Pending Requests ({pendingIncoming.length})
</Text>
{pendingIncoming.map((conn) => (
<View key={conn._id} style={styles.memberCard}>
<Image
source={{ uri: conn.image || getProfileImage(conn.name) }}
style={styles.avatar}
/>
<View style={styles.memberInfo}>
<Text style={styles.memberName}>{conn.name || 'Anonymous'}</Text>
<Text style={styles.memberRole}>
{conn.role}{conn.company ? ` at ${conn.company}` : ''}
</Text>
</View>
<View style={styles.responseRow}>
<TouchableOpacity
style={styles.acceptBtn}
onPress={() => handleRespond(conn._id, true)}
>
<Ionicons name="checkmark" size={18} color={colors.black} />
</TouchableOpacity>
<TouchableOpacity
style={styles.rejectBtn}
onPress={() => handleRespond(conn._id, false)}
>
<Ionicons name="close" size={18} color={colors.error} />
</TouchableOpacity>
</View>
</View>
))}
</View>
)}

{/* Connected Members */}
<View style={styles.sectionBlock}>
<Text style={styles.sectionLabel}>
Your Network ({acceptedConnections?.length ?? 0})
</Text>
{acceptedConnections?.map((conn) => (
<TouchableOpacity
key={conn._id}
style={styles.memberCard}
onPress={() => {
const member = members?.find((m) => m._id === conn.userId);
if (member) setSelectedMember(member);
}}
>
<Image
source={{ uri: conn.image || getProfileImage(conn.name) }}
style={styles.avatar}
/>
<View style={styles.memberInfo}>
<Text style={styles.memberName}>{conn.name || 'Anonymous'}</Text>
<Text style={styles.memberRole}>
{conn.role}{conn.company ? ` at ${conn.company}` : ''}
</Text>
{conn.country && (
<View style={styles.metaRow}>
<Ionicons name="location" size={10} color={colors.textMuted} />
<Text style={styles.metaText}>{conn.country}</Text>
</View>
)}
</View>
<TouchableOpacity
style={styles.messageBtn}
onPress={() => handleMessage(conn)}
>
<Ionicons name="chatbubble" size={16} color={colors.primary} />
</TouchableOpacity>
</TouchableOpacity>
))}

{(!acceptedConnections || acceptedConnections.length === 0) && (
<View style={styles.emptyState}>
<Ionicons name="people-outline" size={48} color={colors.textMuted} />
<Text style={styles.emptyText}>No connections yet</Text>
<Text style={styles.emptySubtext}>
Start connecting with entrepreneurs in the Discover tab
</Text>
</View>
)}
</View>
<View style={{ height: 100 }} />
</ScrollView>
)}

{/* Messages Tab */}
{tab === 'messages' && (
<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
{conversations?.map((convo) => (
<TouchableOpacity
key={convo._id}
style={styles.convoCard}
onPress={() => {
setChatConvoId(convo._id);
setChatMember({
_id: convo.otherUserId,
name: convo.otherUserName,
image: convo.otherUserImage,
company: convo.otherUserCompany,
role: convo.otherUserRole,
});
}}
>
<Image
source={{ uri: convo.otherUserImage || getProfileImage(convo.otherUserName) }}
style={styles.avatar}
/>
<View style={styles.convoInfo}>
<Text style={styles.convoName}>{convo.otherUserName || 'Unknown'}</Text>
<Text style={styles.convoLastMsg} numberOfLines={1}>
{convo.lastMessage || 'No messages yet'}
</Text>
</View>
{convo.lastMessageAt && (
<Text style={styles.convoTime}>
{formatTime(convo.lastMessageAt)}
</Text>
)}
</TouchableOpacity>
))}

{(!conversations || conversations.length === 0) && (
<View style={styles.emptyState}>
<Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
<Text style={styles.emptyText}>No messages yet</Text>
<Text style={styles.emptySubtext}>
Connect with members and start a conversation
</Text>
</View>
)}
<View style={{ height: 100 }} />
</ScrollView>
)}
</SafeAreaView>

{renderMemberDetail()}
{renderChatModal()}
</View>
);
}

function formatTime(timestamp: number) {
const now = Date.now();
const diff = now - timestamp;
if (diff < 60000) return 'Now';
if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
return `${Math.floor(diff / 86400000)}d`;
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: colors.background },
safeArea: { flex: 1 },
header: {
paddingHorizontal: spacing.lg,
paddingTop: spacing.md,
paddingBottom: spacing.xs,
},
backButton: {
flexDirection: 'row',
alignItems: 'center',
alignSelf: 'flex-start',
gap: 4,
minHeight: 32,
paddingRight: spacing.sm,
marginBottom: spacing.xs,
},
backButtonText: {
fontSize: fontSize.sm,
fontWeight: '700',
color: colors.primary,
},
headerTitle: {
fontSize: fontSize.xxl,
fontWeight: '800',
color: colors.text,
},
headerSubtitle: {
fontSize: fontSize.sm,
color: colors.primary,
fontWeight: '600',
marginTop: 2,
},

// Tabs
tabRow: {
flexDirection: 'row',
paddingHorizontal: spacing.lg,
gap: spacing.xs,
marginTop: spacing.sm,
marginBottom: spacing.sm,
flexShrink: 0,
},
tab: {
flex: 1,
minHeight: 40,
paddingVertical: spacing.sm,
borderRadius: borderRadius.md,
alignItems: 'center',
justifyContent: 'center',
backgroundColor: colors.surface,
borderWidth: 1,
borderColor: colors.border,
},
tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
tabTextActive: { color: colors.black },

// Search
searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
searchBox: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.surface,
borderRadius: borderRadius.md,
paddingHorizontal: spacing.md,
height: 44,
borderWidth: 1,
borderColor: colors.border,
gap: spacing.sm,
},
searchInput: {
flex: 1,
color: colors.text,
fontSize: fontSize.sm,
},

// Filter
filterScroll: {
flexGrow: 0,
flexShrink: 0,
height: 48,
marginBottom: spacing.sm,
},
filterRow: {
paddingHorizontal: spacing.lg,
paddingVertical: 4,
gap: spacing.xs,
flexDirection: 'row',
alignItems: 'center',
},
filterChip: {
minHeight: 36,
justifyContent: 'center',
paddingHorizontal: spacing.md,
paddingVertical: 8,
borderRadius: borderRadius.full,
backgroundColor: colors.surface,
borderWidth: 1,
borderColor: colors.border,
marginRight: 2,
},
filterChipActive: {
backgroundColor: colors.primary + '20',
borderColor: colors.primary,
},
filterChipText: { fontSize: fontSize.sm, color: colors.text },
filterChipTextActive: { color: colors.primary, fontWeight: '600' },

// List
list: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },

// Member Card
memberCard: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.surface,
borderRadius: borderRadius.md,
padding: spacing.md,
marginBottom: spacing.sm,
borderWidth: 1,
borderColor: colors.border,
},
avatar: {
width: 52,
height: 52,
borderRadius: 26,
backgroundColor: colors.surfaceLight,
},
memberInfo: {
flex: 1,
marginLeft: spacing.md,
},
memberName: {
fontSize: fontSize.md,
fontWeight: '700',
color: colors.text,
},
memberRole: {
fontSize: fontSize.sm,
color: colors.textSecondary,
marginTop: 1,
},
metaRow: {
flexDirection: 'row',
alignItems: 'center',
gap: 4,
marginTop: 4,
flexWrap: 'wrap',
},
metaChip: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.primary + '10',
paddingHorizontal: 6,
paddingVertical: 2,
borderRadius: borderRadius.sm,
gap: 3,
marginRight: 4,
},
metaText: { fontSize: 10, color: colors.primary, fontWeight: '500' },

// Card actions
cardActions: { marginLeft: spacing.sm },
connectBtn: {
width: 40,
height: 40,
borderRadius: 20,
borderWidth: 1.5,
borderColor: colors.primary,
justifyContent: 'center',
alignItems: 'center',
},
messageBtn: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: colors.primary + '20',
justifyContent: 'center',
alignItems: 'center',
},
pendingBadge: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: colors.warning + '15',
justifyContent: 'center',
alignItems: 'center',
},

// Section
sectionBlock: { marginBottom: spacing.lg },
sectionLabel: {
fontSize: fontSize.sm,
fontWeight: '700',
color: colors.textSecondary,
marginBottom: spacing.sm,
textTransform: 'uppercase',
letterSpacing: 1,
},

// Response buttons
responseRow: { flexDirection: 'row', gap: spacing.xs },
acceptBtn: {
width: 36,
height: 36,
borderRadius: 18,
backgroundColor: colors.primary,
justifyContent: 'center',
alignItems: 'center',
},
rejectBtn: {
width: 36,
height: 36,
borderRadius: 18,
borderWidth: 1,
borderColor: colors.error,
justifyContent: 'center',
alignItems: 'center',
},

// Conversations
convoCard: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.surface,
borderRadius: borderRadius.md,
padding: spacing.md,
marginBottom: spacing.sm,
borderWidth: 1,
borderColor: colors.border,
},
convoInfo: { flex: 1, marginLeft: spacing.md },
convoName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
convoLastMsg: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
convoTime: { fontSize: fontSize.xs, color: colors.textMuted },

// Empty state
emptyState: { alignItems: 'center', paddingVertical: 60 },
emptyText: {
fontSize: fontSize.lg,
color: colors.textSecondary,
fontWeight: '600',
marginTop: spacing.md,
},
emptySubtext: {
fontSize: fontSize.sm,
color: colors.textMuted,
marginTop: spacing.xs,
textAlign: 'center',
paddingHorizontal: spacing.xl,
},

// Modal
modalContainer: { flex: 1, backgroundColor: colors.background },
modalHeader: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
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

// Profile Detail
detailContent: { paddingHorizontal: spacing.lg },
profileHeader: {
alignItems: 'center',
paddingTop: spacing.lg,
paddingBottom: spacing.md,
},
profileImage: {
width: 100,
height: 100,
borderRadius: 50,
backgroundColor: colors.surfaceLight,
borderWidth: 3,
borderColor: colors.primary,
},
profileName: {
fontSize: fontSize.xl,
fontWeight: '800',
color: colors.text,
marginTop: spacing.md,
},
profileRole: {
fontSize: fontSize.md,
color: colors.textSecondary,
marginTop: 4,
textAlign: 'center',
},
locationChip: {
flexDirection: 'row',
alignItems: 'center',
gap: 4,
marginTop: spacing.sm,
},
locationText: { fontSize: fontSize.sm, color: colors.primary },
industryChip: {
backgroundColor: colors.accent + '25',
paddingHorizontal: spacing.md,
paddingVertical: 4,
borderRadius: borderRadius.full,
marginTop: spacing.sm,
},
industryChipText: {
fontSize: fontSize.sm,
color: colors.accentLight,
fontWeight: '600',
},

// Action buttons
actionRow: {
flexDirection: 'row',
gap: spacing.sm,
marginBottom: spacing.lg,
},
actionBtn: {
flex: 1,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
gap: spacing.sm,
paddingVertical: spacing.md,
borderRadius: borderRadius.md,
borderWidth: 1,
borderColor: colors.border,
},
actionBtnPrimary: {
backgroundColor: colors.primary,
borderColor: colors.primary,
},
actionBtnConnected: {
borderColor: colors.success,
backgroundColor: colors.success + '10',
},
actionBtnText: {
fontSize: fontSize.md,
fontWeight: '600',
color: colors.text,
},

// Sections
section: {
marginBottom: spacing.lg,
backgroundColor: colors.surface,
borderRadius: borderRadius.md,
padding: spacing.md,
borderWidth: 1,
borderColor: colors.border,
},
sectionTitleRow: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.sm,
marginBottom: spacing.sm,
},
sectionTitle: {
fontSize: fontSize.md,
fontWeight: '700',
color: colors.text,
marginBottom: spacing.sm,
},
sectionBody: {
fontSize: fontSize.sm,
color: colors.textSecondary,
lineHeight: 20,
},

// Skills
skillsRow: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: spacing.xs,
},
skillChip: {
backgroundColor: colors.primary + '15',
paddingHorizontal: spacing.sm + 2,
paddingVertical: 4,
borderRadius: borderRadius.full,
},
skillText: {
fontSize: fontSize.xs,
color: colors.primary,
fontWeight: '600',
},

// Contact
contactList: { gap: spacing.sm },
contactRow: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.sm,
},
contactIcon: {
width: 32,
height: 32,
borderRadius: 16,
backgroundColor: colors.surfaceLight,
justifyContent: 'center',
alignItems: 'center',
},
contactText: {
flex: 1,
fontSize: fontSize.sm,
color: colors.textSecondary,
},

// Chat
chatHeader: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.lg,
paddingVertical: spacing.md,
borderBottomWidth: 1,
borderBottomColor: colors.border,
gap: spacing.sm,
},
chatAvatar: {
width: 36,
height: 36,
borderRadius: 18,
backgroundColor: colors.surfaceLight,
},
chatName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
chatRole: { fontSize: fontSize.xs, color: colors.textSecondary },
chatBody: { flex: 1 },
chatBodyContent: { padding: spacing.lg },
chatEmpty: { alignItems: 'center', paddingVertical: 60 },
chatEmptyText: {
fontSize: fontSize.lg,
color: colors.textSecondary,
fontWeight: '600',
marginTop: spacing.md,
},
chatEmptySubtext: {
fontSize: fontSize.sm,
color: colors.textMuted,
marginTop: spacing.xs,
},
messageBubble: {
maxWidth: '80%',
padding: spacing.md,
borderRadius: borderRadius.lg,
marginBottom: spacing.sm,
},
myMessage: {
alignSelf: 'flex-end',
backgroundColor: colors.primary,
borderBottomRightRadius: 4,
},
theirMessage: {
alignSelf: 'flex-start',
backgroundColor: colors.surface,
borderWidth: 1,
borderColor: colors.border,
borderBottomLeftRadius: 4,
},
messageText: {
fontSize: fontSize.sm,
color: colors.text,
lineHeight: 20,
},
messageTime: {
fontSize: 9,
color: colors.textMuted,
marginTop: 4,
alignSelf: 'flex-end',
},
chatInputRow: {
flexDirection: 'row',
alignItems: 'flex-end',
paddingHorizontal: spacing.lg,
paddingVertical: spacing.sm,
borderTopWidth: 1,
borderTopColor: colors.border,
gap: spacing.sm,
},
chatInput: {
flex: 1,
backgroundColor: colors.surface,
borderRadius: borderRadius.lg,
paddingHorizontal: spacing.md,
paddingVertical: spacing.sm + 2,
color: colors.text,
fontSize: fontSize.sm,
maxHeight: 100,
borderWidth: 1,
borderColor: colors.border,
},
sendBtn: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: colors.primary,
justifyContent: 'center',
alignItems: 'center',
},
});
