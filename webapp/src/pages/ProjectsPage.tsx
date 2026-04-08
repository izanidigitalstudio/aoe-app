import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Heart, MessageCircle, Plus, Sparkles, X, Send,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { colors } from "../theme";
import { useDemoContext } from "../App";

const INDUSTRIES = ["FinTech", "AgriTech", "HealthTech", "EdTech", "CleanTech", "E-Commerce", "Logistics", "Media", "Other"];
const STAGES = ["idea", "prototype", "mvp", "growth", "scale"];
const LOOKING_FOR = ["funding", "technical", "partnership", "mentorship"];

export default function ProjectsPage() {
  const { isDemo, exitDemo } = useDemoContext();
  const projects = useQuery(api.projects.listProjects, {});
  const createProject = useMutation(api.projects.createProject);
  const toggleLike = useMutation(api.projects.toggleLike);
  const addComment = useMutation(api.projects.addComment);

  const [showCreate, setShowCreate] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("FinTech");
  const [stage, setStage] = useState("idea");
  const [aiIntegration, setAiIntegration] = useState("");
  const [resourcesNeeded, setResourcesNeeded] = useState("");
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  const [tags, setTags] = useState("");

  const demoGuard = (action: string) => {
    if (isDemo) { if (confirm(`Create an account to ${action}. Sign up?`)) exitDemo(); return true; }
    return false;
  };

  const handleCreate = async () => {
    if (demoGuard("post projects")) return;
    if (!title.trim() || !description.trim() || !aiIntegration.trim()) {
      alert("Please fill in title, description, and AI integration details.");
      return;
    }
    try {
      await createProject({
        title: title.trim(),
        description: description.trim(),
        industry,
        stage,
        aiIntegration: aiIntegration.trim(),
        resourcesNeeded: resourcesNeeded.split(",").map((s) => s.trim()).filter(Boolean),
        lookingFor: selectedLookingFor,
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowCreate(false);
      resetForm();
    } catch (e: any) {
      alert(e.message || "Failed to create project");
    }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setIndustry("FinTech"); setStage("idea");
    setAiIntegration(""); setResourcesNeeded(""); setSelectedLookingFor([]); setTags("");
  };

  const handleLike = async (projectId: any) => {
    if (demoGuard("like projects")) return;
    try { await toggleLike({ projectId }); } catch (e: any) { alert(e.message); }
  };

  const handleComment = async (projectId: any) => {
    if (demoGuard("comment on projects")) return;
    if (!commentText.trim()) return;
    try {
      await addComment({ projectId, content: commentText.trim() });
      setCommentText("");
      setCommentingOn(null);
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Innovation Hub</h1>
          <p style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 4 }}>Share & Discover Projects</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { if (!demoGuard("post projects")) setShowCreate(true); }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Projects List */}
      <div style={{ display: "grid", gap: 16 }}>
        {projects?.map((project) => (
          <div key={project._id} className="card">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.accent + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: colors.white }}>
                {(project.authorName || "A").charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{project.authorName || "Anonymous"}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>
                  {project.authorCompany ? `${project.authorCompany} · ` : ""}{project.industry}
                </div>
              </div>
              <span className="badge" style={{ background: colors.accent + "30", color: colors.accentLight, textTransform: "capitalize" }}>
                {project.stage}
              </span>
            </div>

            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{project.title}</div>
            <div style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.5, marginBottom: 12 }}>{project.description}</div>

            {/* AI Integration */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: colors.primary + "10", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Sparkles size={16} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 14, color: colors.primary, lineHeight: 1.4 }}>{project.aiIntegration}</div>
            </div>

            {/* Looking For */}
            {project.lookingFor.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginBottom: 6 }}>Looking for:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {project.lookingFor.map((item: string) => (
                    <span key={item} className="badge" style={{ background: colors.accent + "20", color: colors.accentLight, textTransform: "capitalize" }}>{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {project.tags.map((tag: string) => (
                  <span key={tag} className="badge" style={{ background: colors.surfaceLight, color: colors.textSecondary }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 16, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", color: project.isLiked ? colors.error : colors.textSecondary, fontSize: 14 }} onClick={() => handleLike(project._id)}>
                <Heart size={18} fill={project.isLiked ? colors.error : "none"} /> {project.likesCount}
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", color: colors.textSecondary, fontSize: 14 }} onClick={() => setCommentingOn(commentingOn === project._id ? null : project._id)}>
                <MessageCircle size={18} /> {project.commentsCount}
              </button>
            </div>

            {/* Comment Input */}
            {commentingOn === project._id && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                <input
                  className="input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment(project._id)}
                  style={{ flex: 1 }}
                />
                <button style={{ background: "none", color: colors.primary }} onClick={() => handleComment(project._id)}>
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        {(!projects || projects.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Sparkles size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No projects yet</div>
            <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Be the first to share your innovation</div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" style={{ maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Project Title</label>
                <input className="input" placeholder="e.g. AI-Powered Crop Disease Detection" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Description</label>
                <textarea className="input" placeholder="Describe your project, goals and impact..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ resize: "vertical" }} />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Industry</label>
                <div className="chip-row">
                  {INDUSTRIES.map((ind) => (
                    <button key={ind} className={`chip ${industry === ind ? "active" : ""}`} onClick={() => setIndustry(ind)}>{ind}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Stage</label>
                <div className="chip-row">
                  {STAGES.map((s) => (
                    <button key={s} className={`chip ${stage === s ? "active" : ""}`} onClick={() => setStage(s)} style={{ textTransform: "capitalize" }}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>How are you using AI?</label>
                <textarea className="input" placeholder="Describe how AI integrates into your project..." value={aiIntegration} onChange={(e) => setAiIntegration(e.target.value)} rows={3} style={{ resize: "vertical" }} />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Looking For</label>
                <div className="chip-row">
                  {LOOKING_FOR.map((item) => (
                    <button
                      key={item}
                      className={`chip ${selectedLookingFor.includes(item) ? "active" : ""}`}
                      onClick={() => setSelectedLookingFor((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item])}
                      style={{ textTransform: "capitalize" }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Resources Needed (comma-separated)</label>
                <input className="input" placeholder="e.g. Cloud hosting, Data engineers" value={resourcesNeeded} onChange={(e) => setResourcesNeeded(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Tags (comma-separated)</label>
                <input className="input" placeholder="e.g. AI, FinTech, Nigeria" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>

              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleCreate}>
                Post Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
