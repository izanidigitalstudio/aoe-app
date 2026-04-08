import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, Eye, ArrowLeft } from "lucide-react";
import { colors } from "../theme";

type Props = { onDemoAccess?: () => void };

export default function LoginPage({ onDemoAccess }: Props) {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"main" | "email">("main");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (flow === "signUp" && !name.trim()) {
      setError("Please enter your name to sign up.");
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
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "email") {
    return (
      <div className="login-page">
        <div className="login-card">
          <button onClick={() => setMode("main")} style={{
            display: "flex", alignItems: "center", gap: 8, color: colors.text,
            marginBottom: 24, background: "none", border: "none", cursor: "pointer",
            fontSize: 14,
          }}>
            <ArrowLeft size={20} /> Back
          </button>

          <div className="login-logo">AOE</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {flow === "signIn" ? "Welcome Back" : "Join the Movement"}
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 32 }}>
            {flow === "signIn" ? "Sign in to continue your journey" : "Create your account to get started"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {flow === "signUp" && (
              <input
                className="input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            />

            {error && (
              <p style={{ color: colors.error, fontSize: 13, textAlign: "center" }}>{error}</p>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: 14, opacity: loading ? 0.6 : 1 }}
              onClick={handleEmailAuth}
              disabled={loading}
            >
              {loading ? "Please wait..." : flow === "signIn" ? "Sign In" : "Create Account"}
            </button>

            <p style={{ color: colors.textSecondary, fontSize: 13, textAlign: "center", marginTop: 8 }}>
              {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <span
                style={{ color: colors.primary, fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign Up" : "Sign In"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">AOE</div>
        <div className="login-brand">Art of Entrepreneurship</div>
        <div className="login-brand-tag">AFRICA</div>
        <h1 className="login-tagline">The Future is Here</h1>
        <p className="login-subtitle">
          Join Africa's AI entrepreneurship movement.<br />
          Collaborate. Innovate. Transform.
        </p>
        <div className="login-buttons">
          <button
            className="login-btn login-btn-email"
            onClick={() => { setMode("email"); setFlow("signIn"); }}
          >
            <Mail size={18} /> Continue with Email
          </button>
          <div className="login-divider"><span>OR</span></div>
          <button className="login-btn login-btn-demo" onClick={onDemoAccess}>
            <Eye size={18} /> Explore as Guest
          </button>
        </div>
        <p className="login-footer">By continuing, you agree to our Terms of Service</p>
      </div>
    </div>
  );
}
