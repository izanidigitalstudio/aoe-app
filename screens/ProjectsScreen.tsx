import React, { useState } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
TextInput,
Modal,
Alert,
KeyboardAvoidingView,
Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convexApi';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { useDemo } from '../lib/DemoContext';

const INDUSTRIES = ['FinTech', 'AgriTech', 'HealthTech', 'EdTech', 'CleanTech', 'E-Commerce', 'Logistics', 'Media', 'Other'];
const STAGES = ['idea', 'prototype', 'mvp', 'growth', 'scale'];
const LOOKING_FOR = ['funding', 'technical', 'partnership', 'mentorship'];

export default function ProjectsScreen() {
  const { isDemo, exitDemo } = useDemo();
  const projects = useQuery(api.projects.listProjects, {});
  const createProject = useMutation(api.projects.createProject);
  const toggleLike = useMutation(api.projects.toggleLike);
  const addComment = useMutation(api.projects.addComment);

  const [showCreate, setShowCreate] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('FinTech');
  const [stage, setStage] = useState('idea');
  const [aiIntegration, setAiIntegration] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  const [tags, setTags] = useState('');

  const handleCreate = async () => {
    if (isDemo) {
      Alert.alert('Account Required', 'Create an account to post your project.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: exitDemo },
      ]);
      return;
    }
    if (!title.trim() || !description.trim() || !aiIntegration.trim()) {
      Alert.alert('Missing fields', 'Please fill in title, description, and AI integration details.');
      return;
    }
    try {
      await createProject({
        title: title.trim(),
        description: description.trim(),
        industry,
        stage,
        aiIntegration: aiIntegration.trim(),
        resourcesNeeded: resourcesNeeded.split(',').map((s) => s.trim()).filter(Boolean),
        lookingFor: selectedLookingFor,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowCreate(false);
      resetForm();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create project');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIndustry('FinTech');
    setStage('idea');
    setAiIntegration('');
    setResourcesNeeded('');
    setSelectedLookingFor([]);
    setTags('');
  };

  const handleLike = async (projectId: any) => {
    if (isDemo) {
      Alert.alert('Account Required', 'Create an account to like projects.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: exitDemo },
      ]);
      return;
    }
    try {
      await toggleLike({ projectId });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleComment = async (projectId: any) => {
    if (isDemo) {
      Alert.alert('Account Required', 'Create an account to comment on projects.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: exitDemo },
      ]);
      return;
    }
    if (!commentText.trim()) return;
    try {
      await addComment({ projectId, content: commentText.trim() });
      setCommentText('');
      setCommentingOn(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Innovation Hub</Text>
            <Text style={styles.headerSubtitle}>Share & Discover Projects</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => {
            if (isDemo) {
              Alert.alert('Account Required', 'Create an account to post your project.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Up', onPress: exitDemo },
              ]);
              return;
            }
            setShowCreate(true);
          }}>
            <Ionicons name="add" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {projects?.map((project) => (
            <View key={project._id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(project.authorName || 'A').charAt(0)}
                  </Text>
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{project.authorName || 'Anonymous'}</Text>
                  <Text style={styles.authorCompany}>
                    {project.authorCompany ? `${project.authorCompany} · ` : ''}
                    {project.industry}
                  </Text>
                </View>
                <View style={styles.stageBadge}>
                  <Text style={styles.stageBadgeText}>{project.stage}</Text>
                </View>
              </View>

              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDesc}>{project.description}</Text>

              <View style={styles.aiSection}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.aiText}>{project.aiIntegration}</Text>
              </View>

              {project.lookingFor.length > 0 && (
                <View style={styles.lookingForRow}>
                  <Text style={styles.lookingForLabel}>Looking for:</Text>
                  <View style={styles.tagsRow}>
                    {project.lookingFor.map((item: string) => (
                      <View key={item} style={styles.lookingForTag}>
                        <Text style={styles.lookingForTagText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {project.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {project.tags.map((tag: string) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(project._id)}
                >
                  <Ionicons
                    name={project.isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={project.isLiked ? colors.error : colors.textSecondary}
                  />
                  <Text style={styles.actionText}>{project.likesCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    setCommentingOn(commentingOn === project._id ? null : project._id)
                  }
                >
                  <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.actionText}>{project.commentsCount}</Text>
                </TouchableOpacity>
              </View>

              {commentingOn === project._id && (
                <View style={styles.commentInput}>
                  <TextInput
                    style={styles.commentField}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textMuted}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.commentSend}
                    onPress={() => handleComment(project._id)}
                  >
                    <Ionicons name="send" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {(!projects || projects.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="bulb-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No projects yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share your innovation</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Create Project Modal */}
        <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafe}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowCreate(false)}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>New Project</Text>
                  <TouchableOpacity onPress={handleCreate}>
                    <Text style={styles.modalPost}>Post</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>Project Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. AI-Powered Crop Disease Detection"
                    placeholderTextColor={colors.textMuted}
                    value={title}
                    onChangeText={setTitle}
                  />

                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your project, its goals and impact..."
                    placeholderTextColor={colors.textMuted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />

                  <Text style={styles.label}>Industry</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {INDUSTRIES.map((ind) => (
                      <TouchableOpacity
                        key={ind}
                        style={[styles.chip, industry === ind && styles.chipActive]}
                        onPress={() => setIndustry(ind)}
                      >
                        <Text style={[styles.chipText, industry === ind && styles.chipTextActive]}>
                          {ind}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>Stage</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {STAGES.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.chip, stage === s && styles.chipActive]}
                        onPress={() => setStage(s)}
                      >
                        <Text style={[styles.chipText, stage === s && styles.chipTextActive]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>How are you using AI?</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe how AI integrates into your project..."
                    placeholderTextColor={colors.textMuted}
                    value={aiIntegration}
                    onChangeText={setAiIntegration}
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={styles.label}>Looking For</Text>
                  <View style={styles.chipRow}>
                    {LOOKING_FOR.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chip,
                          selectedLookingFor.includes(item) && styles.chipActive,
                        ]}
                        onPress={() =>
                          setSelectedLookingFor((prev) =>
                            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedLookingFor.includes(item) && styles.chipTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Resources Needed (comma-separated)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cloud hosting, Data engineers, Market research"
                    placeholderTextColor={colors.textMuted}
                    value={resourcesNeeded}
                    onChangeText={setResourcesNeeded}
                  />

                  <Text style={styles.label}>Tags (comma-separated)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. AI, FinTech, Nigeria"
                    placeholderTextColor={colors.textMuted}
                    value={tags}
                    onChangeText={setTags}
                  />

                  <View style={{ height: 60 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { paddingHorizontal: spacing.lg },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.white },
  authorInfo: { flex: 1, marginLeft: spacing.sm },
  authorName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  authorCompany: { fontSize: fontSize.xs, color: colors.textSecondary },
  stageBadge: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  stageBadgeText: {
    fontSize: fontSize.xs,
    color: colors.accentLight,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  projectTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: 4 },
  projectDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  aiSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginBottom: spacing.sm,
  },
  aiText: { fontSize: fontSize.sm, color: colors.primary, flex: 1, lineHeight: 18 },
  lookingForRow: { marginBottom: spacing.sm },
  lookingForLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 4, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  lookingForTag: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  lookingForTagText: {
    fontSize: fontSize.xs,
    color: colors.accentLight,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  tag: { backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm },
  tagText: { fontSize: fontSize.xs, color: colors.textSecondary },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: fontSize.sm, color: colors.textSecondary },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  commentField: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.sm,
    maxHeight: 80,
  },
  commentSend: { padding: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '600', marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: { fontSize: fontSize.md, color: colors.textSecondary },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  modalPost: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipScroll: { marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.black, fontWeight: '600' },
});