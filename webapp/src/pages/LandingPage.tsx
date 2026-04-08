import { useState, useRef } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ArrowRight, Mail, Eye, Users, Globe, Utensils, Sparkles,
  Calendar, MapPin, ChevronDown, CheckCircle2, Lightbulb,
  Network, BookOpen, X, ArrowLeft, Mic, Building2,
} from "lucide-react";
import { colors } from "../theme";

type Props = { onDemoAccess?: () => void };

const DINNER_CITIES = [
  { city: "Johannesburg", country: "South Africa", date: "Feb 2026", status: "upcoming" },
  { city: "Gaborone", country: "Botswana", date: "10 Apr 2026", status: "upcoming" },
  { city: "Lagos", country: "Nigeria", date: "Jun 2026", status: "upcoming" },
  { city: "Nairobi", country: "Kenya", date: "Aug 2026", status: "upcoming" },
  { city: "Kigali", country: "Rwanda", date: "Oct 2026", status: "upcoming" },
  { city: "Accra", country: "Ghana", date: "Dec 2026", status: "upcoming" },
];

const VALUE_PROPS = [
  {
    icon: Utensils,
    title: "Exclusive Dinner Events",
    desc: "Join intimate dinners across Africa where entrepreneurs, investors, and industry leaders converge to shape the future.",
  },
  {
    icon: Network,
    title: "Pan-African Network",
    desc: "Connect with a curated community of founders, VCs, and tech leaders building across the continent.",
  },
  {
    icon: Sparkles,
    title: "AI & Innovation Hub",
    desc: "Access cutting-edge AI resources, tools, case studies, and guides tailored for African entrepreneurs.",
  },
  {
    icon: BookOpen,
    title: "Resources & Insights",
    desc: "Stay ahead with conferences, podcasts, funding directories, and industry intelligence.",
  },
];

const STATS = [
  { value: "15+", label: "African Countries" },
  { value: "500+", label: "Members" },
  { value: "12", label: "Tour Cities" },
  { value: "50+", label: "AI Resources" },
];

export default function LandingPage({ onDemoAccess }: Props) {
  const { signIn } = useAuthActions();
  const [showAuth, setShowAuth] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const registerRef = useRef<HTMLDivElement>(null);

  const scrollToRegister = () => {
    setShowAuth(true);
    setFlow("signUp");
    setTimeout(() => registerRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (flow === "signUp" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        name: flow === "signUp" ? name.trim() : undefined,
        flow,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.background, color: colors.text, overflowX: "hidden" }}>

      {/* ─── Navbar ─── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => { setShowAuth(true); setFlow("signIn"); setTimeout(() => registerRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
            style={{
              background: "transparent", border: `1px solid ${colors.border}`, color: colors.text,
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >Sign In</button>
          <button
            onClick={scrollToRegister}
            style={{
              background: colors.primary, border: "none", color: "#000",
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >Join Now</button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{
        padding: "80px 24px 60px", textAlign: "center", maxWidth: 800, margin: "0 auto",
        position: "relative",
      }}>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 20,
          background: colors.primary + "15", color: colors.primary,
          fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 24,
        }}>
          THE FUTURE IS HERE DINNER TOUR 2026
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.1,
          marginBottom: 20, letterSpacing: -1,
        }}>
          Rebuilding Africa<br />Through <span style={{ color: colors.primary }}>AI & Collaboration</span>
        </h1>
        <p style={{
          fontSize: "clamp(16px, 2.5vw, 20px)", color: colors.textSecondary,
          lineHeight: 1.6, maxWidth: 600, margin: "0 auto 36px",
        }}>
          Join the premier network of African entrepreneurs, innovators, and investors shaping
          the continent's future through technology and collaboration.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/register"
            style={{
              background: colors.primary, border: "none", color: "#000", padding: "14px 32px",
              borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
            }}
          >
            Register Now <ArrowRight size={18} />
          </a>
          <button
            onClick={onDemoAccess}
            style={{
              background: colors.surface, border: `1px solid ${colors.border}`, color: colors.text,
              padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <Eye size={18} /> Explore as Guest
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ marginTop: 48, opacity: 0.4, animation: "bounce 2s infinite" }}>
          <ChevronDown size={28} />
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{
        padding: "40px 24px", maxWidth: 900, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: colors.surface, borderRadius: 16, padding: "24px 16px",
            textAlign: "center", border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: colors.primary }}>{s.value}</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ─── Value Propositions ─── */}
      <section style={{ padding: "60px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>
          Why Join <span style={{ color: colors.primary }}>AOE Africa</span>?
        </h2>
        <p style={{ fontSize: 15, color: colors.textSecondary, textAlign: "center", marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>
          Everything you need to thrive as an entrepreneur on the continent.
        </p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20,
        }}>
          {VALUE_PROPS.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} style={{
                background: colors.surface, borderRadius: 16, padding: 28,
                border: `1px solid ${colors.border}`, transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: colors.primary + "15",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <Icon size={26} color={colors.primary} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Dinner Tour ─── */}
      <section style={{
        padding: "60px 24px", background: colors.surface,
        borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
              borderRadius: 20, background: colors.primary + "15", color: colors.primary,
              fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 16,
            }}>
              <Utensils size={14} /> DINNER TOUR 2026
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              The Future is Here
            </h2>
            <p style={{ fontSize: 15, color: colors.textSecondary, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              Exclusive dinners across Africa bringing together the brightest minds in tech, business, and innovation.
            </p>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16,
          }}>
            {DINNER_CITIES.map((c, i) => (
              <div key={i} style={{
                background: colors.card, borderRadius: 14, padding: 20,
                border: `1px solid ${colors.border}`, textAlign: "center",
                transition: "transform 0.2s",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: colors.primary + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <MapPin size={22} color={colors.primary} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{c.city}</div>
                <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginTop: 2 }}>{c.country}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>
                  <Calendar size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{c.date}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href="/register"
              style={{
                background: colors.primary, border: "none", color: "#000", padding: "12px 28px",
                borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
              }}
            >
              Reserve Your Seat <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── What You Get ─── */}
      <section style={{ padding: "60px 24px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>
          What Members Get
        </h2>
        {[
          { icon: Users, text: "Access to an exclusive network of 500+ African entrepreneurs and investors" },
          { icon: Utensils, text: "Priority invitations to The Future is Here Dinner Tour events" },
          { icon: Sparkles, text: "AI tools, case studies, and guides curated for African markets" },
          { icon: Mic, text: "Directory of 100+ podcasts covering entrepreneurship and innovation" },
          { icon: Globe, text: "Conference listings and delegate registration across the continent" },
          { icon: Lightbulb, text: "Innovation Hub to showcase projects and find collaborators or funding" },
          { icon: Building2, text: "Access to African VC and funding directories" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
              borderBottom: i < 6 ? `1px solid ${colors.border}` : "none",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: colors.primary + "12",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={20} color={colors.primary} />
              </div>
              <span style={{ fontSize: 15, lineHeight: 1.5 }}>{item.text}</span>
            </div>
          );
        })}
      </section>

      {/* ─── Registration / Sign In ─── */}
      <section ref={registerRef} style={{
        padding: "60px 24px", background: colors.surface,
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <CheckCircle2 size={56} color={colors.accent} style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome to AOE Africa!</h2>
              <p style={{ color: colors.textSecondary, fontSize: 15 }}>
                Your account has been created. You'll be redirected shortly.
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", background: colors.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#000", margin: "0 auto 16px",
                }}>AOE</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                  {flow === "signUp" ? "Join the Movement" : "Welcome Back"}
                </h2>
                <p style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {flow === "signUp"
                    ? "Create your free account and join Africa's premier entrepreneurship network."
                    : "Sign in to continue your journey."}
                </p>
              </div>

              <div style={{
                background: colors.card, borderRadius: 16, padding: 28,
                border: `1px solid ${colors.border}`,
              }}>
                {/* Tab Toggle */}
                <div style={{
                  display: "flex", background: colors.surface, borderRadius: 10,
                  padding: 4, marginBottom: 24,
                }}>
                  {(["signUp", "signIn"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFlow(f); setError(""); }}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                        background: flow === f ? colors.primary : "transparent",
                        color: flow === f ? "#000" : colors.textSecondary,
                        transition: "all 0.2s",
                      }}
                    >{f === "signUp" ? "Register" : "Sign In"}</button>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {flow === "signUp" && (
                    <input
                      style={inputStyle}
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  )}
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  />

                  {error && (
                    <p style={{ color: colors.error, fontSize: 13, textAlign: "center", margin: 0 }}>{error}</p>
                  )}

                  <button
                    onClick={handleAuth}
                    disabled={loading}
                    style={{
                      width: "100%", padding: 14, borderRadius: 10, border: "none",
                      background: colors.primary, color: "#000", fontSize: 15, fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {loading ? "Please wait..." : flow === "signUp" ? "Create Account" : "Sign In"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>

                <div style={{
                  display: "flex", alignItems: "center", gap: 12, margin: "20px 0",
                }}>
                  <div style={{ flex: 1, height: 1, background: colors.border }} />
                  <span style={{ fontSize: 12, color: colors.textMuted }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: colors.border }} />
                </div>

                <button
                  onClick={onDemoAccess}
                  style={{
                    width: "100%", padding: 12, borderRadius: 10,
                    background: colors.surface, border: `1px solid ${colors.border}`,
                    color: colors.text, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Eye size={16} /> Explore as Guest
                </button>
              </div>

              <p style={{
                textAlign: "center", fontSize: 12, color: colors.textMuted, marginTop: 16,
              }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        padding: "40px 24px", borderTop: `1px solid ${colors.border}`,
        textAlign: "center",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: colors.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: "#000",
          }}>AOE</div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Art of Entrepreneurship Africa</span>
        </div>
        <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          Connecting African entrepreneurs through AI, innovation, and collaboration.<br />
          www.aoeafrica.org.za
        </p>
        <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 16 }}>
          &copy; {new Date().getFullYear()} AOE Africa. All rights reserved.
        </p>
      </footer>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: colors.surface,
  color: colors.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};