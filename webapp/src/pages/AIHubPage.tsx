import { useState } from "react";
import { Search, X, DollarSign, ExternalLink, MapPin, Clock, Award, ChevronRight } from "lucide-react";
import { colors } from "../theme";

import { AFRICAN_VCS } from "../../data/africanVCs";
import { AI_TOOLS } from "../../data/aiTools";
import { AI_GUIDES } from "../../data/aiGuides";
import { CASE_STUDIES } from "../../data/caseStudies";

type TabKey = "funders" | "tools" | "guides" | "cases";

const TABS: { key: TabKey; label: string }[] = [
  { key: "funders", label: "Funders" },
  { key: "tools", label: "AI Tools" },
  { key: "guides", label: "Guides" },
  { key: "cases", label: "Cases" },
];

export default function AIHubPage() {
  const [tab, setTab] = useState<TabKey>("funders");
  const [search, setSearch] = useState("");

  return (
    <div className="page-container">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>AI Hub</h1>
        <p style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 4 }}>
          Resources for African Entrepreneurs
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-row" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => { setTab(t.key); setSearch(""); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-box" style={{ marginBottom: 20 }}>
        <Search size={18} />
        <input placeholder={`Search ${tab}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={16} /></button>}
      </div>

      {/* Funders Tab */}
      {tab === "funders" && (
        <div style={{ display: "grid", gap: 8 }}>
          {AFRICAN_VCS.filter((vc) => {
            const s = search.toLowerCase();
            return !search || vc.name?.toLowerCase().includes(s) || vc.firm?.toLowerCase().includes(s) || vc.focus?.toLowerCase().includes(s);
          }).slice(0, 50).map((vc, i) => (
            <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: colors.primary, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{vc.name}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>{vc.firm}</div>
                {vc.focus && <div style={{ fontSize: 11, color: colors.primary, marginTop: 2 }}>{vc.focus}</div>}
              </div>
              {vc.country && (
                <span className="badge" style={{ background: colors.primary + "10", color: colors.primary }}>
                  <MapPin size={10} /> {vc.country}
                </span>
              )}
            </div>
          ))}
          {AFRICAN_VCS.length === 0 && <DataNotice />}
        </div>
      )}

      {/* Tools Tab */}
      {tab === "tools" && (
        <div className="grid-2">
          {AI_TOOLS.filter((t) => !search || t.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 30).map((tool, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{tool.name}</div>
                <span className="badge" style={{ background: tool.pricing === "Free" ? colors.success + "20" : colors.warning + "20", color: tool.pricing === "Free" ? colors.success : colors.warning }}>
                  <DollarSign size={10} /> {tool.pricing}
                </span>
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.4 }}>{tool.description}</div>
              {tool.category && <div style={{ fontSize: 11, color: colors.primary, marginTop: 8, fontWeight: 600 }}>{tool.category}</div>}
            </div>
          ))}
          {AI_TOOLS.length === 0 && <DataNotice />}
        </div>
      )}

      {/* Guides Tab */}
      {tab === "guides" && (
        <div style={{ display: "grid", gap: 12 }}>
          {AI_GUIDES.filter((g) => !search || g.title?.toLowerCase().includes(search.toLowerCase())).slice(0, 20).map((guide, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{guide.title}</div>
                {guide.level && <span className="badge" style={{ background: guide.level === "Beginner" ? colors.success + "20" : guide.level === "Advanced" ? colors.error + "20" : colors.info + "20", color: guide.level === "Beginner" ? colors.success : guide.level === "Advanced" ? colors.error : colors.info }}><Award size={10} /> {guide.level}</span>}
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.4 }}>{guide.summary}</div>
              {guide.duration && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, color: colors.textMuted }}><Clock size={12} /> {guide.duration}</div>}
            </div>
          ))}
          {AI_GUIDES.length === 0 && <DataNotice />}
        </div>
      )}

      {/* Cases Tab */}
      {tab === "cases" && (
        <div style={{ display: "grid", gap: 12 }}>
          {CASE_STUDIES.filter((c) => !search || c.title?.toLowerCase().includes(search.toLowerCase())).slice(0, 20).map((cs, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                {cs.industry && <span className="badge" style={{ background: colors.primary + "15", color: colors.primary }}>{cs.industry}</span>}
                {cs.country && <span className="badge" style={{ background: colors.surface, color: colors.textSecondary }}>{cs.country}</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{cs.title}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.4 }}>{cs.challenge}</div>
              {cs.aiTools?.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {cs.aiTools.slice(0, 3).map((t: string, j: number) => (
                    <span key={j} className="badge" style={{ background: colors.accent + "15", color: colors.accentLight }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {CASE_STUDIES.length === 0 && <DataNotice />}
        </div>
      )}
    </div>
  );
}

function DataNotice() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>
      <p style={{ color: colors.textMuted, fontSize: 14 }}>
        Copy the <code style={{ color: colors.primary }}>data/</code> folder from the mobile project to load content.
      </p>
    </div>
  );
}