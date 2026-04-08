import { useState } from "react";
import { useQuery } from "convex/react";
import {
  Search, X, Newspaper, Code, Wrench, Briefcase, BookOpen,
  Star, ExternalLink, Tag,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { colors } from "../theme";

const CATEGORIES = ["all", "news", "tutorial", "tool", "case-study", "guide"];

const CATEGORY_ICONS: Record<string, any> = {
  news: Newspaper,
  tutorial: Code,
  tool: Wrench,
  "case-study": Briefcase,
  guide: BookOpen,
};

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedResource, setSelectedResource] = useState<any>(null);

  const resources = useQuery(
    api.aiResources.listResources,
    selectedCategory === "all" ? {} : { category: selectedCategory }
  );

  return (
    <div className="page-container">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>AI Resources</h1>
        <p style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 4 }}>Stay Ahead of the Curve</p>
      </div>

      {/* Category Tabs */}
      <div className="tab-row" style={{ marginBottom: 20 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ textTransform: "capitalize" }}
          >
            {cat === "all" ? "All" : cat.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid-2">
        {resources?.map((resource) => {
          const CatIcon = CATEGORY_ICONS[resource.category] || BookOpen;
          return (
            <div
              key={resource._id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedResource(resource)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CatIcon size={20} color={colors.primary} />
                </div>
                <span className="badge" style={{ background: colors.primary + "20", color: colors.primary, textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
                  {resource.category.replace("-", " ")}
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{resource.title}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {resource.summary}
              </div>

              {resource.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {resource.tags.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="badge" style={{ background: colors.surfaceLight, color: colors.textSecondary, fontSize: 11 }}>{tag}</span>
                  ))}
                </div>
              )}

              {resource.featured && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                  <Star size={12} color={colors.primary} fill={colors.primary} />
                  <span style={{ fontSize: 12, color: colors.primary, fontWeight: 600 }}>Featured</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(!resources || resources.length === 0) && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <BookOpen size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No resources yet</div>
          <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Content is being curated for this category</div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="modal-overlay" onClick={() => setSelectedResource(null)}>
          <div className="modal-content" style={{ maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resource Details</h2>
              <button className="modal-close" onClick={() => setSelectedResource(null)}><X size={18} /></button>
            </div>

            <span className="badge" style={{ background: colors.primary + "20", color: colors.primary, textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
              {selectedResource.category.replace("-", " ")}
            </span>

            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12, lineHeight: 1.3 }}>{selectedResource.title}</h2>
            <p style={{ fontSize: 15, color: colors.primary, marginTop: 8, lineHeight: 1.5, fontWeight: 500 }}>{selectedResource.summary}</p>

            <div style={{ height: 1, background: colors.border, margin: "20px 0" }} />

            <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.7 }}>{selectedResource.content}</p>

            {selectedResource.sourceUrl && (
              <a
                href={selectedResource.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ marginTop: 20, display: "inline-flex" }}
              >
                <ExternalLink size={16} /> View Source
              </a>
            )}

            {selectedResource.tags?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20 }}>
                {selectedResource.tags.map((tag: string) => (
                  <span key={tag} className="badge" style={{ background: colors.surfaceLight, color: colors.textSecondary }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
