import React, { useState, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convexApi';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { DemoContext } from '../lib/DemoContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PostCategory = 'update' | 'event' | 'achievement' | 'announcement' | 'project';

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  update: { label: 'Update', icon: 'chatbubble-outline', color: '#3B82F6' },
  event: { label: 'Event', icon: 'calendar-outline', color: '#8B5CF6' },
  achievement: { label: 'Achievement', icon: 'trophy-outline', color: '#F59E0B' },
  announcement: { label: 'Announcement', icon: 'megaphone-outline', color: '#10B981' },
  project: { label: 'Project', icon: 'rocket-outline', color: '#EC4899' },
  activity: { label: 'Activity', icon: 'flash-outline', color: '#F59E0B' },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatEventDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function demoGuard(isDemo: boolean) {
  if (isDemo) {
    Alert.alert('Demo Mode', 'Sign in to use this feature.');
    return true;
  }
  return false;
}

export default function CommunityScreen({ navigation }: any) {
  const { isDemo } = useContext(DemoContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const notices = useQuery(api.notices.listNotices, {});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
        <TouchableOpacity
          style={styles.composeHeaderBtn}
          onPress={() => {
            if (demoGuard(isDemo)) return;
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={notices ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            isDemo={isDemo}
            onPress={() => setSelectedPost(item)}
            onProfilePress={() => {}}
          />
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share what you're working on</Text>
          </View>
        }
      />

      {/* Floating compose button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (demoGuard(isDemo)) return;
          setShowCreateModal(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      {/* Post Detail / Thread Modal */}
      {selectedPost && (
        <PostThreadModal
          post={selectedPost}
          isDemo={isDemo}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Compose Modal */}
      <ComposeModal
        visible={showCreateModal}
        isDemo={isDemo}
        onClose={() => setShowCreateModal(false)}
      />
    </SafeAreaView>
  );
}

/* ─── Post Item (Twitter-style) ─── */
function PostItem({ post, isDemo, onPress, onProfilePress }: any) {
  const toggleInterest = useMutation(api.notices.toggleInterest);
  const [liked, setLiked] = useState(post.isInterested ?? false);
  const [likeCount, setLikeCount] = useState(post.interestCount ?? 0);

  const handleLike = async () => {
    if (isDemo) {
      Alert.alert('Demo Mode', 'Sign in to like posts.');
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => prev + (newLiked ? 1 : -1));
    try {
      await toggleInterest({ noticeId: post._id });
    } catch {
      setLiked(!newLiked);
      setLikeCount((prev: number) => prev + (newLiked ? -1 : 1));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: post.title
          ? `${post.title}\n\n${post.description}`
          : post.description,
      });
    } catch {}
  };

  const catConfig = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.update;

  return (
    <TouchableOpacity style={styles.postItem} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <TouchableOpacity onPress={onProfilePress} style={styles.avatarContainer}>
        {post.authorImage ? (
          <Image source={{ uri: post.authorImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={18} color={colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.postBody}>
        {/* Name row */}
        <View style={styles.nameRow}>
          <View style={styles.nameInfo}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.authorName || 'Member'}
            </Text>
            {post.authorCompany && (
              <Text style={styles.authorHandle} numberOfLines={1}>
                {post.authorCompany}
              </Text>
            )}
            <Text style={styles.dot}>·</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post._creationTime)}</Text>
          </View>
        </View>

        {/* Category badge */}
        {post.category && post.category !== 'update' && (
          <View style={[styles.categoryPill, { backgroundColor: catConfig.color + '20' }]}>
            <Ionicons name={catConfig.icon as any} size={12} color={catConfig.color} />
            <Text style={[styles.categoryPillText, { color: catConfig.color }]}>
              {catConfig.label}
            </Text>
          </View>
        )}

        {/* Title if present */}
        {post.title && (
          <Text style={styles.postTitle}>{post.title}</Text>
        )}

        {/* Content text */}
        <Text style={styles.postText} numberOfLines={8}>
          {post.description}
        </Text>

        {/* Event info card */}
        {post.date && (
          <View style={styles.eventCard}>
            <Ionicons name="calendar" size={14} color={colors.primary} />
            <Text style={styles.eventCardText}>{formatEventDate(post.date)}</Text>
            {post.location && (
              <>
                <Text style={styles.eventCardDivider}>·</Text>
                <Ionicons name="location" size={14} color={colors.primary} />
                <Text style={styles.eventCardText} numberOfLines={1}>{post.location}</Text>
              </>
            )}
          </View>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.slice(0, 4).map((tag: string, i: number) => (
              <Text key={i} style={styles.tagText}>#{tag.replace(/\s+/g, '')}</Text>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
            {post.commentCount > 0 && (
              <Text style={styles.actionCount}>{post.commentCount}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={17}
              color={liked ? '#F43F5E' : colors.textMuted}
            />
            {likeCount > 0 && (
              <Text style={[styles.actionCount, liked && { color: '#F43F5E' }]}>
                {likeCount}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={17} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Post Thread Modal (Detail + Replies) ─── */
function PostThreadModal({ post, isDemo, onClose }: any) {
  const comments = useQuery(api.notices.getComments, { noticeId: post._id });
  const addComment = useMutation(api.notices.addComment);
  const toggleInterest = useMutation(api.notices.toggleInterest);

  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(post.isInterested ?? false);
  const [likeCount, setLikeCount] = useState(post.interestCount ?? 0);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (demoGuard(isDemo)) return;
    await addComment({ noticeId: post._id, text: replyText.trim() });
    setReplyText('');
  };

  const handleLike = async () => {
    if (demoGuard(isDemo)) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => prev + (newLiked ? 1 : -1));
    try {
      await toggleInterest({ noticeId: post._id });
    } catch {
      setLiked(!newLiked);
      setLikeCount((prev: number) => prev + (newLiked ? -1 : 1));
    }
  };

  const catConfig = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.update;

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={styles.threadModal} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.threadHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.threadHeaderTitle}>Post</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.threadContent} keyboardShouldPersistTaps="handled">
          {/* Original post */}
          <View style={styles.threadPost}>
            <View style={styles.threadAuthorRow}>
              {post.authorImage ? (
                <Image source={{ uri: post.authorImage }} style={styles.threadAvatar} />
              ) : (
                <View style={[styles.threadAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={20} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.threadAuthorInfo}>
                <Text style={styles.threadAuthorName}>{post.authorName || 'Member'}</Text>
                {post.authorCompany && (
                  <Text style={styles.threadAuthorHandle}>{post.authorCompany}</Text>
                )}
              </View>
            </View>

            {post.category && post.category !== 'update' && (
              <View style={[styles.categoryPill, { backgroundColor: catConfig.color + '20', marginTop: spacing.sm }]}>
                <Ionicons name={catConfig.icon as any} size={12} color={catConfig.color} />
                <Text style={[styles.categoryPillText, { color: catConfig.color }]}>
                  {catConfig.label}
                </Text>
              </View>
            )}

            {post.title && (
              <Text style={styles.threadPostTitle}>{post.title}</Text>
            )}

            <Text style={styles.threadPostText}>{post.description}</Text>

            {post.date && (
              <View style={[styles.eventCard, { marginTop: spacing.md }]}>
                <Ionicons name="calendar" size={14} color={colors.primary} />
                <Text style={styles.eventCardText}>{formatEventDate(post.date)}</Text>
                {post.location && (
                  <>
                    <Text style={styles.eventCardDivider}>·</Text>
                    <Ionicons name="location" size={14} color={colors.primary} />
                    <Text style={styles.eventCardText}>{post.location}</Text>
                  </>
                )}
              </View>
            )}

            {post.tags && post.tags.length > 0 && (
              <View style={[styles.tagsRow, { marginTop: spacing.md }]}>
                {post.tags.map((tag: string, i: number) => (
                  <Text key={i} style={styles.tagText}>#{tag.replace(/\s+/g, '')}</Text>
                ))}
              </View>
            )}

            {/* Timestamp + stats */}
            <Text style={styles.threadTimestamp}>
              {new Date(post._creationTime).toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>

            <View style={styles.threadStats}>
              {likeCount > 0 && (
                <Text style={styles.threadStatText}>
                  <Text style={styles.threadStatBold}>{likeCount}</Text> {likeCount === 1 ? 'Like' : 'Likes'}
                </Text>
              )}
              {post.commentCount > 0 && (
                <Text style={styles.threadStatText}>
                  <Text style={styles.threadStatBold}>{post.commentCount}</Text> {post.commentCount === 1 ? 'Reply' : 'Replies'}
                </Text>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.threadActions}>
              <TouchableOpacity style={styles.threadActionBtn} onPress={handleLike}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={liked ? '#F43F5E' : colors.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.threadActionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.threadActionBtn}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: post.title
                        ? `${post.title}\n\n${post.description}`
                        : post.description,
                    });
                  } catch {}
                }}
              >
                <Ionicons name="share-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Replies */}
          {comments && comments.length > 0 && (
            <View style={styles.repliesSection}>
              {comments.map((comment: any) => (
                <View key={comment._id} style={styles.replyItem}>
                  <View style={styles.replyAvatarCol}>
                    {comment.authorImage ? (
                      <Image source={{ uri: comment.authorImage }} style={styles.replyAvatar} />
                    ) : (
                      <View style={[styles.replyAvatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={14} color={colors.textMuted} />
                      </View>
                    )}
                  </View>
                  <View style={styles.replyBody}>
                    <View style={styles.replyNameRow}>
                      <Text style={styles.replyAuthorName}>{comment.authorName || 'Member'}</Text>
                      {comment.authorCompany && (
                        <Text style={styles.replyAuthorHandle}>{comment.authorCompany}</Text>
                      )}
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.replyTime}>{formatTimeAgo(comment._creationTime)}</Text>
                    </View>
                    <Text style={styles.replyText}>{comment.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Reply input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.replyInputBar}
        >
          <View style={styles.replyInputWrapper}>
            <TextInput
              style={styles.replyInput}
              placeholder="Post your reply..."
              placeholderTextColor={colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleReply}
              disabled={!replyText.trim()}
              style={[
                styles.replySubmitBtn,
                !replyText.trim() && styles.replySubmitBtnDisabled,
              ]}
            >
              <Text style={[
                styles.replySubmitText,
                !replyText.trim() && { opacity: 0.4 },
              ]}>Reply</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

/* ─── Compose Modal ─── */
function ComposeModal({ visible, isDemo, onClose }: any) {
  const createNotice = useMutation(api.notices.createNotice);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<PostCategory>('update');
  const [posting, setPosting] = useState(false);

  const charLimit = 1000;

  const handlePost = async () => {
    if (!text.trim()) return;
    if (posting) return;
    setPosting(true);
    try {
      await createNotice({
        description: text.trim(),
        category,
      });
      setText('');
      setCategory('update');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    if (text.trim()) {
      Alert.alert('Discard post?', 'Your draft will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setText('');
            setCategory('update');
            onClose();
          },
        },
      ]);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.composeModal} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.composeHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.composeCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.composePostBtn,
              (!text.trim() || posting) && styles.composePostBtnDisabled,
            ]}
            onPress={handlePost}
            disabled={!text.trim() || posting}
          >
            <Text style={styles.composePostBtnText}>
              {posting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.composeBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Category selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.composeCategoryBar}
              contentContainerStyle={styles.composeCategoryContent}
            >
              {(['update', 'announcement', 'achievement', 'event', 'project'] as PostCategory[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const isActive = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.composeCategoryChip,
                      isActive && { backgroundColor: config.color + '25', borderColor: config.color },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={14}
                      color={isActive ? config.color : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.composeCategoryText,
                        isActive && { color: config.color },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Text input */}
            <TextInput
              style={styles.composeInput}
              placeholder="What's happening?"
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              maxLength={charLimit}
              textAlignVertical="top"
            />

            {/* Character count */}
            {text.length > charLimit * 0.8 && (
              <Text style={[
                styles.charCount,
                text.length >= charLimit && { color: colors.error },
              ]}>
                {text.length}/{charLimit}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  composeHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  /* Post Item */
  postItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  authorName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  authorHandle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flexShrink: 2,
  },
  dot: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  timeAgo: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  categoryPillText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  postText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventCardText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  eventCardDivider: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  /* Thread Modal */
  threadModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  threadHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  threadContent: {
    flex: 1,
  },
  threadPost: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  threadAuthorInfo: {
    flex: 1,
  },
  threadAuthorName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  threadAuthorHandle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  threadPostTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  threadPostText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  threadTimestamp: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadStatText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  threadStatBold: {
    fontWeight: '700',
    color: colors.text,
  },
  threadActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadActionBtn: {
    padding: spacing.sm,
  },

  /* Replies */
  repliesSection: {
    paddingHorizontal: spacing.lg,
  },
  replyItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  replyAvatarCol: {
    marginRight: spacing.md,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  replyBody: {
    flex: 1,
  },
  replyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  replyAuthorName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  replyAuthorHandle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  replyTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  replyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  /* Reply Input Bar */
  replyInputBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  replyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  replySubmitBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  replySubmitBtnDisabled: {
    opacity: 0.4,
  },
  replySubmitText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.background,
  },

  /* Compose Modal */
  composeModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  composeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  composeCancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  composePostBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  composePostBtnDisabled: {
    opacity: 0.4,
  },
  composePostBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.background,
  },
  composeBody: {
    flex: 1,
    padding: spacing.lg,
  },
  composeCategoryBar: {
    marginBottom: spacing.lg,
    flexGrow: 0,
  },
  composeCategoryContent: {
    gap: spacing.sm,
  },
  composeCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composeCategoryText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  composeInput: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 26,
    minHeight: 150,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
});