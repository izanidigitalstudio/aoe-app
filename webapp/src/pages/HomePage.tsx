import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, MapPin, Users, FolderKanban, Utensils,
  Server, Languages, HeartPulse, Leaf, Wallet, GraduationCap,
  CloudSun, Package, Zap, Shield, X, Globe, TrendingUp,
  Building2, Mic, Calendar,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { colors } from "../theme";
import { useDemoContext } from "../App";

const ICON_MAP: Record<string, any> = {
  server: Server, language: Languages, medical: HeartPulse,
  leaf: Leaf, wallet: Wallet, school: GraduationCap,
  cloud: CloudSun, cube: Package, flash: Zap, shield: Shield,
};

const UPCOMING_PROJECTS = [
  { title: "Cassava AI Factory", location: "SA, Egypt, Nigeria, Kenya, Morocco", description: "NVIDIA-powered AI data centers with 15,000+ GPUs", icon: "server", status: "In Development", timeline: "2025-2027", partners: ["NVIDIA", "Cassava Technologies", "AfDB"], impact: "Projected to create 10,000+ direct tech jobs and reduce AI compute costs by 60% for African companies." },
  { title: "Masakhane Language AI", location: "Pan-African", description: "Integrating 50+ African languages into AI models", icon: "language", status: "Active Research", timeline: "2020-Ongoing", partners: ["Masakhane Community", "Google Research", "Mozilla"], impact: "Over 400 researchers across 30+ African countries contributing to open-source African language datasets." },
  { title: "AfricAI Healthcare", location: "Kenya, Rwanda, Uganda", description: "AI-driven diagnostic systems for disease detection", icon: "medical", status: "Pilot Phase", timeline: "2024-2026", partners: ["WHO Africa", "PATH", "Univ. of Nairobi"], impact: "Targeting 500+ rural clinics, potentially reaching 2 million patients annually." },
  { title: "AgriTech AI Initiative", location: "Nigeria, Zambia, Ghana", description: "AI for crop optimization and yield prediction", icon: "leaf", status: "Growth Phase", timeline: "2023-2026", partners: ["FAO", "AGRA", "IBM Research Africa"], impact: "Serving 100,000+ smallholder farmers with potential to increase crop yields by 30-40%." },
  { title: "FintechAI Expansion", location: "SA, Kenya, Nigeria", description: "AI-powered financial inclusion and payments", icon: "wallet", status: "Scaling", timeline: "2024-2027", partners: ["Mastercard Foundation", "Central Banks"], impact: "Target to bring 50 million previously unbanked Africans into the formal financial system." },
  { title: "EduTech AI Platform", location: "Tanzania, Ethiopia, Senegal", description: "Adaptive learning with AI personalization", icon: "school", status: "Pilot Phase", timeline: "2024-2026", partners: ["UNESCO", "African Union", "Khan Academy"], impact: "Piloting in 200 schools with plans to reach 1 million students across 10 countries." },
];

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

export default function HomePage() {
  const { isDemo } = useDemoContext();
  const navigate = useNavigate();
  const user = useQuery(api.users.getCurrentUser);
  const events = useQuery(api.events.listEvents, {});
  const projects = useQuery(api.projects.listProjects, {});
  const members = useQuery(api.users.listMembers, {});
  const stats = useQuery(api.admin.getStats, {});
  const seedData = useMutation(api.init.seedData);
  const [selectedProject, setSelectedProject] = useState<(typeof UPCOMING_PROJECTS)[number] | null>(null);

  useEffect(() => { seedData().catch(() => {}); }, []);

  const upcomingEvents = events?.filter((e) => e.status === "upcoming").slice(0, 3);
  const firstName = !isDemo && user?.name ? user.name.split(" ")[0] : "Member";

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="card" style={{ marginBottom: 16, borderColor: colors.primary + "30" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {user?.image ? (
            <img src={user.image} alt="" style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${colors.primary}`, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: colors.primary, border: `2px solid ${colors.primary}` }}>
              {firstName.charAt(0)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: colors.textSecondary }}>{getGreeting()},</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{firstName}</div>
            {!isDemo && user?.role && user?.company && (
              <div style={{ fontSize: 11, color: colors.primary, fontWeight: 600 }}>{user.role} at {user.company}</div>
            )}
          </div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>AOE</div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="card" style={{ marginBottom: 24, borderColor: colors.primary + "30", padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3 }}>Rebuilding Africa Through<br />AI & Collaboration</h1>
        <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
          Connect with entrepreneurs across the continent who are leveraging AI to transform their industries.
        </p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/events")}>
          Explore Dinner Tour <ArrowRight size={16} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex-row" style={{ marginBottom: 32 }}>
        <div className="stat-card"><div className="stat-number">{stats?.totalMembers ?? 0}</div><div className="stat-label">Members</div></div>
        <div className="stat-card"><div className="stat-number">{events?.length ?? 0}</div><div className="stat-label">Tour Cities</div></div>
        <div className="stat-card"><div className="stat-number">{projects?.length ?? 0}</div><div className="stat-label">Projects</div></div>
      </div>

      {/* Dinner Tour Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="section-header">
            <h2 className="section-title">Dinner Tour Events</h2>
            <span className="see-all" onClick={() => navigate("/events")}>See All</span>
          </div>
          <div className="scroll-row">
            {upcomingEvents.map((event) => (
              <div
                key={event._id}
                className="card"
                style={{ minWidth: 200, cursor: "pointer" }}
                onClick={() => navigate("/events")}
              >
                <div style={{ height: 70, background: colors.surfaceLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Utensils color={colors.primary} size={28} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{event.city}</div>
                <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600 }}>{event.country}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                  <Users size={12} color={colors.primary} /> {event.rsvpCount}/{event.capacity}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Projects */}
      <section style={{ marginBottom: 32 }}>
        <div className="section-header"><h2 className="section-title">Upcoming Projects</h2></div>
        <div className="scroll-row">
          {UPCOMING_PROJECTS.map((project, i) => {
            const Icon = ICON_MAP[project.icon] || FolderKanban;
            return (
              <div key={i} className="card" style={{ minWidth: 200, cursor: "pointer" }} onClick={() => setSelectedProject(project)}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Icon size={22} color={colors.primary} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{project.title}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{project.location}</div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 1.4 }}>{project.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conferences Banner */}
      <section style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 24, borderColor: colors.primary + "30" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>Upcoming Conferences</h2>
          <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
            See upcoming conferences in Africa in the space of Entrepreneurship, Investment, Infrastructure, Technology and AI.
          </p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/ai-hub")}>
            Explore Conferences <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Podcasts Banner */}
      <section style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 24, borderColor: colors.primary + "30" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.primary + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mic size={22} color={colors.primary} />
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>SA Podcast Directory</h2>
          <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
            Top South African podcasts covering entrepreneurship, tech, AI, finance, startups and innovation.
          </p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/ai-hub")}>
            Browse Podcasts <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* AOE Network Members */}
      <div className="section">
        <h2 className="section-title">AOE Network</h2>
      </div>

      {/* Platinum Network Members */}
      {members && members.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="section-header">
            <h2 className="section-title">Platinum Network</h2>
            <span className="see-all" onClick={() => navigate("/network")}>See All</span>
          </div>
          <div className="scroll-row">
            {members.slice(0, 10).map((member) => (
              <div
                key={member._id}
                className="card"
                style={{ minWidth: 110, textAlign: "center", cursor: "pointer", padding: 12 }}
                onClick={() => navigate("/network")}
              >
                {member.image ? (
                  <img src={member.image} alt="" style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${colors.primary}40`, margin: "0 auto 6px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors.primary + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: colors.primary, margin: "0 auto 6px" }}>
                    {(member.name || "A").charAt(0)}
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {member.name?.split(" ")[0]}
                </div>
                <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 2 }}>{member.industry}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Project Details</h2>
              <button className="modal-close" onClick={() => setSelectedProject(null)}><X size={18} /></button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                {(() => { const Icon = ICON_MAP[selectedProject.icon] || FolderKanban; return <Icon size={36} color={colors.primary} />; })()}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{selectedProject.title}</h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <span className="badge" style={{ background: colors.primary + "15", color: colors.primary }}>
                  <MapPin size={12} /> {selectedProject.location}
                </span>
                <span className="badge" style={{ background: colors.accent + "20", color: colors.accentLight }}>
                  {selectedProject.status}
                </span>
                <span className="badge" style={{ background: colors.surface, color: colors.textSecondary }}>
                  <Calendar size={12} /> {selectedProject.timeline}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Expected Impact</h3>
              <div style={{ background: colors.primary + "10", border: `1px solid ${colors.primary}20`, borderRadius: 12, padding: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <TrendingUp size={20} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 14, color: colors.primary, lineHeight: 1.5, fontWeight: 500 }}>{selectedProject.impact}</p>
              </div>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Key Partners</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedProject.partners.map((p, i) => (
                  <span key={i} className="badge" style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}>
                    <Building2 size={12} color={colors.primary} /> {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}