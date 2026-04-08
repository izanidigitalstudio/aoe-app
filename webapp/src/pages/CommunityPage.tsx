import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  MessageCircle, Heart, Share2, Plus, X, Send,
  ArrowLeft, Calendar, MapPin, Award, Megaphone,
  Rocket, Zap, Edit3,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { colors } from "../theme";
import { useDemoContext } from "../App";

type PostCategory = "update" | "event" | "achievement" | "announcement" | "project";

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  update: { label: "Update", icon: MessageCircle, color: "#3B82F6" },
  event: { label: "Event", icon: Calendar, color: "#8B5CF6" },
  achievement: { label: "Achievement", icon: Award, color: "#F59E0B" },
  announcement: { label: "Announcement", icon: Megaphone, color: "#10B981" },
  project: { label: "Project", icon: Rocket, color: "#EC4899" },
  activity: { label: "Activity", icon: Zap, color: "#F59E0B" },
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatEventDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function CommunityPage() {
  const { isDemo, exitDemo } = useDemoContext();
  const [showCompose, setShowCompose] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const notices = useQuery(api.notices.listNotices, {});

  const demoGuard = (action: string) => {
    if (isDemo) { if (confirm(`Create an account to ${action}. Sign up?`)) exitDemo(); return true; }
    return false;
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Connect</h1>
          <p style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 4 }}>Community Feed</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { if (!demoGuard("create posts")) setShowCompose(true); }}
        >
          <Edit3 size={16} /> Post
        </button>
      </div>

      {/* Feed */}
      <div style={{ display: "grid", gap: 0 }}>
        {notices?.map((post) => (
          <PostItem
            key={post._id}
            post={post}
            isDemo={isDemo}
            demoGuard={demoGuard}
            onPress={() => setSelectedPost(post)}
          />
        ))}
        {(!notices || notices.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <MessageCircle size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No posts yet</div>
            <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Be the first to share what you're working on</div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostThreadModal post={selectedPost} isDemo={isDemo} demoGuard={demoGuard} onClose={() => setSelectedPost(null)} />
      )}

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal isDemo={isDemo} onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
}

function PostItem({ post, isDemo, demoGuard, onPress }: any) {
  const toggleInterest = useMutation(api.notices.toggleInterest);
  const [liked, setLiked] = useState(post.isInterested ?? false);
  const [likeCount, setLikeCount] = useState(post.interestCount ?? 0);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demoGuard("like posts")) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => prev + (newLiked ? 1 : -1));
    try { await toggleInterest({ noticeId: post._id }); }
    catch { setLiked(!newLiked); setLikeCount((prev: number) => prev + (newLiked ? -1 : 1)); }
  };

  const catConfig = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.update;
  const CatIcon = catConfig.icon;

  return (
    <div
      style={{
        display: "flex", gap: 12, padding: "16px 0",
        borderBottom: `1px solid ${colors.border}`, cursor: "pointer",
      }}
      onClick={onPress}
    >
      {/* Avatar */}
      {post.authorImage ? (
        <img src={post.authorImage} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: colors.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, fontWeight: 700, color: colors.textMuted }}>
          {(post.authorName || "A").charAt(0)}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{post.authorName || "Member"}</span>
          {post.authorCompany && <span style={{ fontSize: 13, color: colors.textMuted }}>{post.authorCompany}</span>}
          <span style={{ fontSize: 13, color: colors.textMuted }}>·</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{formatTimeAgo(post._creationTime)}</span>
        </div>

        {/* Category badge */}
        {post.category && post.category !== "update" && (
          <span className="badge" style={{ background: catConfig.color + "20", color: catConfig.color, marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CatIcon size={12} /> {catConfig.label}
          </span>
        )}

        {/* Title */}
        {post.title && <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{post.title}</div>}

        {/* Content */}
        <div style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {post.description}
        </div>

        {/* Event info */}
        {post.date && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "8px 12px", background: colors.surfaceLight, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 12, color: colors.textSecondary }}>
            <Calendar size={14} color={colors.primary} /> {formatEventDate(post.date)}
            {post.location && (<><span style={{ color: colors.textMuted }}>·</span><MapPin size={14} color={colors.primary} />{post.location}</>)}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {post.tags.slice(0, 4).map((tag: string, i: number) => (
              <span key={i} style={{ fontSize: 13, color: colors.primary, fontWeight: 500 }}>#{tag.replace(/\s+/g, "")}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", color: colors.textMuted, fontSize: 13 }} onClick={(e) => { e.stopPropagation(); onPress(); }}>
            <MessageCircle size={17} /> {post.commentCount > 0 && post.commentCount}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", color: liked ? "#F43F5E" : colors.textMuted, fontSize: 13 }} onClick={handleLike}>
            <Heart size={17} fill={liked ? "#F43F5E" : "none"} /> {likeCount > 0 && likeCount}
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", color: colors.textMuted, fontSize: 13 }}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(post.title ? `${post.title}\n\n${post.description}` : post.description);
            }}
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PostThreadModal({ post, isDemo, demoGuard, onClose }: any) {
  const comments = useQuery(api.notices.getComments, { noticeId: post._id });
  const addComment = useMutation(api.notices.addComment);
  const toggleInterest = useMutation(api.notices.toggleInterest);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(post.isInterested ?? false);
  const [likeCount, setLikeCount] = useState(post.interestCount ?? 0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (demoGuard("reply to posts")) return;
    await addComment({ noticeId: post._id, text: replyText.trim() });
    setReplyText("");
  };

  const handleLike = async () => {
    if (demoGuard("like posts")) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => prev + (newLiked ? 1 : -1));
    try { await toggleInterest({ noticeId: post._id }); }
    catch { setLiked(!newLiked); setLikeCount((prev: number) => prev + (newLiked ? -1 : 1)); }
  };

  const catConfig = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.update;
  const CatIcon = catConfig.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ display: "flex", flexDirection: "column", height: "80vh", padding: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
          <button onClick={onClose} style={{ color: colors.text, background: "none" }}><ArrowLeft size={22} /></button>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>Post</h3>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            {post.authorImage ? (
              <img src={post.authorImage} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: colors.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: colors.textMuted }}>
                {(post.authorName || "A").charAt(0)}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700 }}>{post.authorName || "Member"}</div>
              {post.authorCompany && <div style={{ fontSize: 13, color: colors.textMuted }}>{post.authorCompany}</div>}
            </div>
          </div>

          {post.category && post.category !== "update" && (
            <span className="badge" style={{ background: catConfig.color + "20", color: catConfig.color, marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <CatIcon size={12} /> {catConfig.label}
            </span>
          )}

          {post.title && <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{post.title}</h2>}
          <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{post.description}</p>

          {post.date && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: colors.surfaceLight, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 12, color: colors.textSecondary, marginBottom: 16 }}>
              <Calendar size={14} color={colors.primary} /> {formatEventDate(post.date)}
              {post.location && (<><span>·</span><MapPin size={14} color={colors.primary} />{post.location}</>)}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {post.tags.map((tag: string, i: number) => (
                <span key={i} style={{ fontSize: 13, color: colors.primary, fontWeight: 500 }}>#{tag.replace(/\s+/g, "")}</span>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div style={{ fontSize: 13, color: colors.textMuted, paddingBottom: 12, borderBottom: `1px solid ${colors.border}` }}>
            {new Date(post._creationTime).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric", year: "numeric" })}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: `1px solid ${colors.border}`, fontSize: 14 }}>
            {likeCount > 0 && <span style={{ color: colors.textMuted }}><strong style={{ color: colors.text }}>{likeCount}</strong> {likeCount === 1 ? "Like" : "Likes"}</span>}
            {post.commentCount > 0 && <span style={{ color: colors.textMuted }}><strong style={{ color: colors.text }}>{post.commentCount}</strong> {post.commentCount === 1 ? "Reply" : "Replies"}</span>}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
            <button style={{ background: "none", color: liked ? "#F43F5E" : colors.textMuted, padding: 8 }} onClick={handleLike}>
              <Heart size={20} fill={liked ? "#F43F5E" : "none"} />
            </button>
            <button style={{ background: "none", color: colors.textMuted, padding: 8 }}>
              <MessageCircle size={20} />
            </button>
            <button style={{ background: "none", color: colors.textMuted, padding: 8 }}>
              <Share2 size={20} />
            </button>
          </div>

          {/* Replies */}
          {comments && comments.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {comments.map((comment: any) => (
                <div key={comment._id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
                  {comment.authorImage ? (
                    <img src={comment.authorImage} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: colors.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: colors.textMuted }}>
                      {(comment.authorName || "A").charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{comment.authorName || "Member"}</span>
                      {comment.authorCompany && <span style={{ fontSize: 12, color: colors.textMuted }}>{comment.authorCompany}</span>}
                      <span style={{ fontSize: 12, color: colors.textMuted }}>· {formatTimeAgo(comment._creationTime)}</span>
                    </div>
                    <div style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 }}>{comment.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Reply input */}
        <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderTop: `1px solid ${colors.border}` }}>
          <input
            className="input"
            placeholder="Post your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
            style={{ flex: 1 }}
          />
          <button
            style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", opacity: replyText.trim() ? 1 : 0.4 }}
            onClick={handleReply}
            disabled={!replyText.trim()}
          >
            <Send size={18} color="#000" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposeModal({ isDemo, onClose }: any) {
  const createNotice = useMutation(api.notices.createNotice);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<PostCategory>("update");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      await createNotice({ description: text.trim(), category });
      setText("");
      setCategory("update");
      onClose();
    } catch (e: any) {
      alert(e.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => {
      if (text.trim()) { if (confirm("Discard post?")) { setText(""); onClose(); } }
      else onClose();
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={() => {
            if (text.trim()) { if (confirm("Discard post?")) { setText(""); onClose(); } }
            else onClose();
          }}>Cancel</button>
          <button
            className="btn-primary"
            style={{ opacity: text.trim() && !posting ? 1 : 0.4, padding: "8px 20px" }}
            onClick={handlePost}
            disabled={!text.trim() || posting}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Category selector */}
        <div className="chip-row" style={{ marginBottom: 16 }}>
          {(["update", "announcement", "achievement", "event", "project"] as PostCategory[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const CatIcon = config.icon;
            const isActive = category === cat;
            return (
              <button
                key={cat}
                className={`chip ${isActive ? "active" : ""}`}
                style={isActive ? { background: config.color + "25", borderColor: config.color, color: config.color } : {}}
                onClick={() => setCategory(cat)}
              >
                <CatIcon size={14} /> {config.label}
              </button>
            );
          })}
        </div>

        <textarea
          className="input"
          placeholder="What's happening?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          maxLength={1000}
          rows={6}
          style={{ resize: "vertical", minHeight: 150, fontSize: 16 }}
        />
        {text.length > 800 && (
          <div style={{ textAlign: "right", fontSize: 12, color: text.length >= 1000 ? colors.error : colors.textMuted, marginTop: 4 }}>
            {text.length}/1000
          </div>
        )}
      </div>
    </div>
  );
}
