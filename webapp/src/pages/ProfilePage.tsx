import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  User, Briefcase, MapPin, Globe, Linkedin, LogOut,
  Edit3, Save, AlertCircle,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { colors } from "../theme";
import { useDemoContext } from "../App";

const COUNTRIES = [
  "Botswana", "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda",
  "Ethiopia", "Tanzania", "Uganda", "Senegal", "Egypt",
  "Morocco", "Cameroon", "DRC", "Mozambique", "Zimbabwe", "Other",
];

const INDUSTRIES = [
  "FinTech", "AgriTech", "HealthTech", "EdTech", "CleanTech",
  "E-Commerce", "Logistics", "Media", "Real Estate", "Manufacturing", "Other",
];

export default function ProfilePage() {
  const { isDemo, exitDemo } = useDemoContext();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const ensureUser = useMutation(api.users.ensureCurrentUser);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (user === null && !isDemo) ensureUser();
  }, [user, isDemo]);

  useEffect(() => {
    if (user) {
      setName(user.name || ""); setBio(user.bio || "");
      setCompany(user.company || ""); setRole(user.role || "");
      setIndustry(user.industry || ""); setCountry(user.country || "");
      setCity(user.city || ""); setLinkedIn(user.linkedIn || "");
      setWebsite(user.website || "");
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        name: name.trim() || undefined, bio: bio.trim() || undefined,
        company: company.trim() || undefined, role: role.trim() || undefined,
        industry: industry || undefined, country: country || undefined,
        city: city.trim() || undefined, linkedIn: linkedIn.trim() || undefined,
        website: website.trim() || undefined, onboarded: true,
      });
      setEditing(false);
    } catch (e: any) { alert(e.message || "Failed to update profile"); }
  };

  if (isDemo) {
    return (
      <div className="page-container">
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Profile</h1>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <User size={36} color="#000" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Guest Explorer</h2>
          <p style={{ color: colors.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
            You're browsing as a guest.<br />Create an account to unlock all features.
          </p>
          <button className="btn-primary" style={{ marginTop: 24 }} onClick={exitDemo}>
            Create Account / Sign In
          </button>
        </div>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <User size={36} color="#000" />
        </div>
        <p style={{ color: colors.textSecondary }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Profile</h1>
        <button
          className={editing ? "btn-primary" : "btn-outline"}
          onClick={editing ? handleSave : () => setEditing(true)}
        >
          {editing ? <><Save size={16} /> Save</> : <><Edit3 size={16} /> Edit</>}
        </button>
      </div>

      {/* Avatar & Name */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        {user?.image ? (
          <img src={user.image} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#000", margin: "0 auto 12px" }}>
            {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
          </div>
        )}
        {editing ? (
          <input className="input" style={{ textAlign: "center", maxWidth: 300, margin: "0 auto" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name || "Set your name"}</h2>
            <p style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{user?.email}</p>
            {user?.role && user?.company && <p style={{ color: colors.primary, fontSize: 14, marginTop: 4 }}>{user.role} at {user.company}</p>}
          </>
        )}
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Bio</label><textarea className="input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." style={{ resize: "vertical" }} /></div>
          <div><label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Company</label><input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" /></div>
          <div><label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Role</label><input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder, CEO" /></div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Industry</label>
            <div className="chip-row">{INDUSTRIES.map((ind) => <button key={ind} className={`chip ${industry === ind ? "active" : ""}`} onClick={() => setIndustry(ind)}>{ind}</button>)}</div>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Country</label>
            <div className="chip-row">{COUNTRIES.map((c) => <button key={c} className={`chip ${country === c ? "active" : ""}`} onClick={() => setCountry(c)}>{c}</button>)}</div>
          </div>
          <div><label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>City</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" /></div>
          <div><label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>LinkedIn</label><input className="input" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
          <div><label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>Website</label><input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" /></div>
        </div>
      ) : (
        <>
          {user?.bio && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>About</div>
              <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.6 }}>{user.bio}</p>
            </div>
          )}
          <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
            {user?.industry && <div className="card" style={{ display: "flex", alignItems: "center", gap: 8 }}><Briefcase size={16} color={colors.primary} /><span style={{ fontSize: 14, color: colors.textSecondary }}>{user.industry}</span></div>}
            {user?.country && <div className="card" style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={16} color={colors.primary} /><span style={{ fontSize: 14, color: colors.textSecondary }}>{user.city ? `${user.city}, ` : ""}{user.country}</span></div>}
            {user?.linkedIn && <div className="card" style={{ display: "flex", alignItems: "center", gap: 8 }}><Linkedin size={16} color={colors.primary} /><span style={{ fontSize: 14, color: colors.textSecondary }}>{user.linkedIn}</span></div>}
            {user?.website && <div className="card" style={{ display: "flex", alignItems: "center", gap: 8 }}><Globe size={16} color={colors.primary} /><span style={{ fontSize: 14, color: colors.textSecondary }}>{user.website}</span></div>}
          </div>

          {!user?.onboarded && (
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, borderColor: colors.primary + "30", background: colors.primary + "10", cursor: "pointer", marginBottom: 24 }} onClick={() => setEditing(true)}>
              <AlertCircle size={24} color={colors.primary} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>Complete Your Profile</div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>Add your details to connect with fellow entrepreneurs</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sign Out */}
      <button
        onClick={() => { if (confirm("Sign out?")) signOut(); }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: 16, marginTop: 32, borderTop: `1px solid ${colors.border}`, color: colors.error, fontWeight: 600, fontSize: 15, background: "none" }}
      >
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
