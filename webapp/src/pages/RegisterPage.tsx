import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Users, Building2,
  Briefcase, Lightbulb, TrendingUp, User, ChevronRight,
  Mail, Lock,
} from "lucide-react";
import { colors } from "../theme";

const MEMBER_CATEGORIES = [
  {
    id: "platinum_network",
    title: "Platinum Network",
    icon: Users,
    description: "Senior executives, investors, and industry leaders seeking exclusive access to top-tier networking.",
    color: "#C8932E",
  },
  {
    id: "esd_corporate",
    title: "ESD Corporate",
    icon: Building2,
    description: "Corporates looking to support enterprise and supplier development through innovation partnerships.",
    color: "#3B82F6",
  },
  {
    id: "business_community",
    title: "Business Community",
    icon: Briefcase,
    description: "Established business owners seeking peer connections, market insights, and growth opportunities.",
    color: "#2A8C62",
  },
  {
    id: "entrepreneurs",
    title: "Entrepreneurs",
    icon: Lightbulb,
    description: "Founders and innovators building solutions across Africa, looking for mentorship and funding.",
    color: "#E8C068",
  },
  {
    id: "short_term_funders",
    title: "Short-Term Funders",
    icon: TrendingUp,
    description: "Angel investors and fund managers seeking curated deal flow and investment opportunities.",
    color: "#9333EA",
  },
];

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Agriculture", "Healthcare", "Education",
  "Energy & Mining", "Real Estate", "Manufacturing", "Retail & E-commerce",
  "Media & Entertainment", "Logistics & Transport", "Telecommunications",
  "Government & Public Sector", "Non-Profit", "Other",
];

const COUNTRIES = [
  "South Africa", "Nigeria", "Kenya", "Ghana", "Rwanda", "Botswana",
  "Tanzania", "Uganda", "Ethiopia", "Mozambique", "Zambia", "Zimbabwe",
  "Namibia", "Senegal", "Ivory Coast", "Cameroon", "DRC", "Egypt",
  "Morocco", "Tunisia", "Other",
];

export default function RegisterPage() {
  const { signIn } = useAuthActions();
  const completeRegistration = useMutation(api.registration.completeRegistration);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  // Step 1: Category
  const [memberType, setMemberType] = useState("");

  // Step 2: Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const handleCategorySelect = (id: string) => {
    setMemberType(id);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create the account
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        flow: "signUp",
      });

      // Brief delay for auth to propagate
      await new Promise((r) => setTimeout(r, 1500));

      // Step 2: Complete registration with profile data
      await completeRegistration({
        memberType,
        name: name.trim(),
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        industry: industry || undefined,
        country: country || undefined,
        city: city.trim() || undefined,
        contactPhone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      setWelcomeName(name.trim());
      setSuccess(true);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.background, color: colors.text }}>
      {/* Header */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, padding: "14px 24px",
        background: colors.background + "E8", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: colors.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#000",
          }}>AOE</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5 }}>Art of Entrepreneurship</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: colors.primary, letterSpacing: 2 }}>AFRICA</div>
          </div>
        </div>
        <a
          href="/"
          style={{
            background: "transparent", border: `1px solid ${colors.border}`, color: colors.text,
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}
        >Sign In</a>
      </nav>

      {/* Progress Bar */}
      {!success && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: step >= s ? colors.primary : colors.surface,
                  border: `2px solid ${step >= s ? colors.primary : colors.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  color: step >= s ? "#000" : colors.textMuted,
                  transition: "all 0.3s",
                }}>{s}</div>
                {s < 2 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: step > s ? colors.primary : colors.border,
                    borderRadius: 1, transition: "background 0.3s",
                  }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: step >= 1 ? colors.primary : colors.textMuted, fontWeight: 600 }}>
              Choose Category
            </span>
            <span style={{ fontSize: 11, color: step >= 2 ? colors.primary : colors.textMuted, fontWeight: 600 }}>
              Your Details
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <section style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              Join <span style={{ color: colors.primary }}>AOE Africa</span>
            </h1>
            <p style={{ fontSize: 15, color: colors.textSecondary, maxWidth: 450, margin: "0 auto", lineHeight: 1.6 }}>
              Select the membership category that best describes you to personalize your experience.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {MEMBER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const selected = memberType === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: selected ? colors.surface : colors.card,
                    border: `1.5px solid ${selected ? cat.color : colors.border}`,
                    borderRadius: 14, padding: "20px 20px", cursor: "pointer",
                    textAlign: "left", transition: "all 0.2s", width: "100%",
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: cat.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={26} color={cat.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      {cat.title}
                    </div>
                    <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>
                      {cat.description}
                    </div>
                  </div>
                  <ChevronRight size={20} color={colors.textMuted} style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: colors.textMuted, marginTop: 24 }}>
            Already have an account? <a href="/" style={{ color: colors.primary, textDecoration: "none", fontWeight: 600 }}>Sign In</a>
          </p>
        </section>
      )}

      {/* Step 2: Registration Form */}
      {step === 2 && !success && (
        <section style={{ maxWidth: 520, margin: "0 auto", padding: "32px 24px 60px" }}>
          <button
            onClick={() => setStep(1)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "none",
              border: "none", color: colors.textSecondary, fontSize: 14, fontWeight: 600,
              cursor: "pointer", marginBottom: 24, padding: 0,
            }}
          >
            <ArrowLeft size={18} /> Back to Categories
          </button>

          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-block", padding: "5px 14px", borderRadius: 20,
              background: (MEMBER_CATEGORIES.find((c) => c.id === memberType)?.color || colors.primary) + "18",
              color: MEMBER_CATEGORIES.find((c) => c.id === memberType)?.color || colors.primary,
              fontSize: 12, fontWeight: 700, marginBottom: 12,
            }}>
              {MEMBER_CATEGORIES.find((c) => c.id === memberType)?.title}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Complete Your Profile</h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 }}>
              Fill in your details to create your account and join the AOE Africa community.
            </p>
          </div>

          <div style={{
            background: colors.card, borderRadius: 16, padding: 24,
            border: `1px solid ${colors.border}`,
          }}>
            {/* Required fields */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Full Name *</label>
              <div style={inputWrapStyle}>
                <User size={18} color={colors.textMuted} style={{ flexShrink: 0 }} />
                <input
                  style={inputInnerStyle}
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email Address *</label>
              <div style={inputWrapStyle}>
                <Mail size={18} color={colors.textMuted} style={{ flexShrink: 0 }} />
                <input
                  style={inputInnerStyle}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password *</label>
              <div style={inputWrapStyle}>
                <Lock size={18} color={colors.textMuted} style={{ flexShrink: 0 }} />
                <input
                  style={inputInnerStyle}
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{
              height: 1, background: colors.border, margin: "24px 0",
            }} />

            {/* Optional profile fields */}
            <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16, fontWeight: 600 }}>
              Optional  helps us personalize your experience
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Company</label>
                <input
                  style={inputStyle}
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Role / Title</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. CEO, Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Industry</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  style={inputStyle}
                  placeholder="Your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  style={inputStyle}
                  placeholder="+27 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Short Bio</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 80, resize: "vertical", fontFamily: "inherit",
                }}
                placeholder="Tell us about yourself and your entrepreneurial journey..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {error && (
              <p style={{ color: colors.error, fontSize: 13, textAlign: "center", marginTop: 16 }}>{error}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                width: "100%", padding: 15, borderRadius: 12, border: "none",
                background: colors.primary, color: "#000", fontSize: 16, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 24,
              }}
            >
              {loading ? "Creating your account..." : "Create Account & Join"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>

          <p style={{
            textAlign: "center", fontSize: 12, color: colors.textMuted, marginTop: 16,
          }}>
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </section>
      )}

      {/* Step 3: Success */}
      {success && (
        <section style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: colors.accent + "20",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <CheckCircle2 size={48} color={colors.accent} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            Welcome, {welcomeName}!
          </h1>
          <p style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 8 }}>
            Your AOE Africa account has been created successfully.
            A welcome email has been sent to your inbox.
          </p>
          <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 32 }}>
            You're now part of Africa's premier entrepreneurship network.
            Explore events, connect with members, and access AI-powered resources.
          </p>
          <a
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: colors.primary, color: "#000", padding: "14px 36px",
              borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none",
            }}
          >
            Explore the Platform <ArrowRight size={18} />
          </a>

          <div style={{
            marginTop: 40, padding: 24, background: colors.surface, borderRadius: 14,
            border: `1px solid ${colors.border}`, textAlign: "left",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Next Steps:</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Check your email for a welcome message",
                "Complete your profile with more details",
                "Browse upcoming events and RSVP",
                "Connect with other members",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", background: colors.primary + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: colors.primary, flexShrink: 0,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: colors.textSecondary }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: "32px 24px", borderTop: `1px solid ${colors.border}`, textAlign: "center",
      }}>
        <p style={{ fontSize: 12, color: colors.textMuted }}>
          &copy; {new Date().getFullYear()} AOE Africa  Art of Entrepreneurship. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: colors.textSecondary,
  marginBottom: 6,
};

const inputWrapStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "0 14px",
  borderRadius: 10, border: `1px solid ${colors.border}`,
  background: colors.surface,
};

const inputInnerStyle: React.CSSProperties = {
  flex: 1, padding: "12px 0",
  background: "transparent", border: "none", outline: "none",
  color: colors.text, fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  borderRadius: 10, border: `1px solid ${colors.border}`,
  background: colors.surface, color: colors.text, fontSize: 14,
  outline: "none", boxSizing: "border-box",
};