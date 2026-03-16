import React, { useState } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Modal,
Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '../lib/mockBackend';
import { api } from '../convex/_generated/api';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

const CATEGORIES = ['all', 'news', 'tutorial', 'tool', 'case-study', 'guide'];

const CATEGORY_ICONS: Record<string, string> = {
news: 'newspaper',
tutorial: 'code-slash',
tool: 'construct',
'case-study': 'briefcase',
guide: 'book',
};

export default function ResourcesScreen() {
const [selectedCategory, setSelectedCategory] = useState('all');
const [selectedResource, setSelectedResource] = useState<any>(null);

const resources = useQuery(
api.aiResources.listResources,
selectedCategory === 'all' ? {} : { category: selectedCategory }
);

return (
<View style={styles.container}>
<SafeAreaView edges={['top']} style={styles.safeArea}>
<View style={styles.header}>
<Text style={styles.headerTitle}>AI Resources</Text>
<Text style={styles.headerSubtitle}>Stay Ahead of the Curve</Text>
</View>

{/* Category Tabs */}
<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={styles.categoryScroll}
contentContainerStyle={styles.categoryContent}
>
{CATEGORIES.map((cat) => (
<TouchableOpacity
key={cat}
style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
onPress={() => setSelectedCategory(cat)}
>
<Text
style={[
styles.categoryTabText,
selectedCategory === cat && styles.categoryTabTextActive,
]}
>
{cat === 'all' ? 'All' : cat.replace('-', ' ')}
</Text>
</TouchableOpacity>
))}
</ScrollView>

<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
{resources?.map((resource) => (
<TouchableOpacity
key={resource._id}
style={styles.resourceCard}
onPress={() => setSelectedResource(resource)}
activeOpacity={0.7}
>
<View style={styles.resourceTop}>
<View style={styles.resourceIcon}>
<Ionicons
name={(CATEGORY_ICONS[resource.category] || 'document') as any}
size={20}
color={colors.primary}
/>
</View>
<View style={styles.categoryBadge}>
<Text style={styles.categoryBadgeText}>
{resource.category.replace('-', ' ')}
</Text>
</View>
</View>

<Text style={styles.resourceTitle}>{resource.title}</Text>
<Text style={styles.resourceSummary} numberOfLines={2}>
{resource.summary}
</Text>

{resource.tags.length > 0 && (
<View style={styles.tagsRow}>
{resource.tags.slice(0, 4).map((tag: string) => (
<View key={tag} style={styles.tag}>
<Text style={styles.tagText}>{tag}</Text>
</View>
))}
</View>
)}

{resource.featured && (
<View style={styles.featuredBadge}>
<Ionicons name="star" size={12} color={colors.primary} />
<Text style={styles.featuredText}>Featured</Text>
</View>
)}
</TouchableOpacity>
))}

{(!resources || resources.length === 0) && (
<View style={styles.emptyState}>
<Ionicons name="library-outline" size={48} color={colors.textMuted} />
<Text style={styles.emptyText}>No resources yet</Text>
<Text style={styles.emptySubtext}>Content is being curated for this category</Text>
</View>
)}
<View style={{ height: 100 }} />
</ScrollView>

{/* Resource Detail Modal */}
<Modal
visible={!!selectedResource}
animationType="slide"
presentationStyle="pageSheet"
>
<View style={styles.modalContainer}>
<SafeAreaView style={styles.modalSafe}>
<View style={styles.modalHeader}>
<TouchableOpacity onPress={() => setSelectedResource(null)}>
<Ionicons name="close" size={28} color={colors.text} />
</TouchableOpacity>
</View>

<ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
<View style={styles.categoryBadge}>
<Text style={styles.categoryBadgeText}>
{selectedResource?.category?.replace('-', ' ')}
</Text>
</View>
<Text style={styles.modalTitle}>{selectedResource?.title}</Text>
<Text style={styles.modalSummary}>{selectedResource?.summary}</Text>
<View style={styles.divider} />
<Text style={styles.modalBody}>{selectedResource?.content}</Text>

{selectedResource?.sourceUrl && (
<TouchableOpacity
style={styles.sourceLink}
onPress={() => Linking.openURL(selectedResource.sourceUrl)}
>
<Ionicons name="open-outline" size={16} color={colors.primary} />
<Text style={styles.sourceLinkText}>View Source</Text>
</TouchableOpacity>
)}

{selectedResource?.tags?.length > 0 && (
<View style={[styles.tagsRow, { marginTop: spacing.lg }]}>
{selectedResource.tags.map((tag: string) => (
<View key={tag} style={styles.tag}>
<Text style={styles.tagText}>{tag}</Text>
</View>
))}
</View>
)}
<View style={{ height: 40 }} />
</ScrollView>
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
paddingBottom: spacing.sm,
},
headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
headerSubtitle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 2 },
categoryScroll: { maxHeight: 50 },
categoryContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
categoryTab: {
paddingHorizontal: spacing.md,
paddingVertical: spacing.sm,
borderRadius: borderRadius.full,
borderWidth: 1,
borderColor: colors.border,
},
categoryTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
categoryTabText: { fontSize: fontSize.sm, color: colors.textSecondary, textTransform: 'capitalize' },
categoryTabTextActive: { color: colors.black, fontWeight: '600' },
list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
resourceCard: {
backgroundColor: colors.surface,
borderRadius: borderRadius.lg,
padding: spacing.md,
marginBottom: spacing.md,
borderWidth: 1,
borderColor: colors.border,
},
resourceTop: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.sm,
},
resourceIcon: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: colors.primary + '15',
justifyContent: 'center',
alignItems: 'center',
},
categoryBadge: {
backgroundColor: colors.primary + '20',
alignSelf: 'flex-start',
paddingHorizontal: spacing.sm,
paddingVertical: 3,
borderRadius: borderRadius.sm,
},
categoryBadgeText: {
fontSize: fontSize.xs,
color: colors.primary,
fontWeight: '600',
textTransform: 'uppercase',
},
resourceTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: 4 },
resourceSummary: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
tag: {
backgroundColor: colors.surfaceLight,
paddingHorizontal: spacing.sm,
paddingVertical: 3,
borderRadius: borderRadius.sm,
},
tagText: { fontSize: fontSize.xs, color: colors.textSecondary },
featuredBadge: {
flexDirection: 'row',
alignItems: 'center',
gap: 4,
marginTop: spacing.sm,
},
featuredText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
emptyState: { alignItems: 'center', paddingVertical: 60 },
emptyText: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '600', marginTop: spacing.md },
emptySubtext: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
// Modal
modalContainer: { flex: 1, backgroundColor: colors.background },
modalSafe: { flex: 1 },
modalHeader: {
paddingHorizontal: spacing.lg,
paddingVertical: spacing.md,
borderBottomWidth: 1,
borderBottomColor: colors.border,
},
modalContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
modalTitle: {
fontSize: fontSize.xxl,
fontWeight: '800',
color: colors.text,
marginTop: spacing.md,
lineHeight: 36,
},
modalSummary: {
fontSize: fontSize.md,
color: colors.primary,
marginTop: spacing.sm,
lineHeight: 22,
fontWeight: '500',
},
divider: {
height: 1,
backgroundColor: colors.border,
marginVertical: spacing.lg,
},
modalBody: {
fontSize: fontSize.md,
color: colors.textSecondary,
lineHeight: 26,
},
sourceLink: {
flexDirection: 'row',
alignItems: 'center',
gap: 6,
marginTop: spacing.lg,
},
sourceLinkText: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
});
