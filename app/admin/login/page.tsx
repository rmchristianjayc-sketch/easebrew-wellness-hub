"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BarChart3, KeyRound, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

const DARK_GREEN = "#183b28";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      router.push(data.role === "coach" ? "/admin/codes" : "/admin");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="admin-shell"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(340px, 0.9fr) minmax(460px, 1.1fr)",
        fontFamily: "var(--admin-font)",
      }}
    >
      {/* ── Left panel ── */}
      <section style={{
        background: DARK_GREEN,
        color: "white",
        padding: "52px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* bg image */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
          <Image src="/images/hero-product.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(24,59,40,0.97) 0%, rgba(24,59,40,0.75) 100%)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#FED255", display: "grid", placeItems: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rm-logo.png" alt="RM" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2px" }}>R&amp;M EaseBrew</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>Wellness operations</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 380 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, marginBottom: 22,
            background: "rgba(254,210,85,0.12)", border: "1.5px solid rgba(254,210,85,0.25)",
            display: "grid", placeItems: "center",
          }}>
            <KeyRound size={26} color="#FED255" />
          </div>
          <h1 style={{ fontSize: 30, lineHeight: 1.25, margin: "0 0 14px", fontWeight: 800, letterSpacing: "-0.3px" }}>
            Manage customer access with confidence.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.62)", fontSize: 14, lineHeight: 1.75, margin: "0 0 28px" }}>
            Generate codes, monitor active customers, and maintain wellness content from one secure workspace.
          </p>

          {/* Feature badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: ShieldCheck, label: "Role-based access control" },
              { icon: BarChart3,   label: "Real-time analytics dashboard" },
              { icon: KeyRound,    label: "Instant code generation" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(254,210,85,0.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={14} color="#FED255" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: "relative", zIndex: 1, color: "rgba(255,255,255,0.28)", fontSize: 11, margin: 0 }}>
          © R&amp;M Digital Trading
        </p>
      </section>

      {/* ── Right panel ── */}
      <section style={{
        display: "grid",
        placeItems: "center",
        padding: "48px",
        background: "#f2f4f2",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e0ede3", color: DARK_GREEN, borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 16 }}>
              <ShieldCheck size={12} />
              SECURE ACCESS
            </div>
            <h2 style={{ color: "#18211b", fontSize: 26, margin: "0 0 6px", fontWeight: 800, letterSpacing: "-0.3px" }}>
              Sign in to workspace
            </h2>
            <p style={{ color: "#667169", fontSize: 13.5, margin: 0 }}>
              Use your owner or coach credentials.
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Username */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#27322b", marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <UserRound size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a9e90", pointerEvents: "none" }} />
                <input
                  className="a-input"
                  autoComplete="username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); if (error) setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="admin or coach"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#27322b", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <LockKeyhole size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a9e90", pointerEvents: "none" }} />
                <input
                  className="a-input"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="Enter password"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8a9e90", fontSize: 11, fontWeight: 600, padding: "4px" }}
                  tabIndex={-1}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 7, padding: "10px 13px", color: "#9f1239", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="a-btn a-btn-primary a-btn-lg"
              style={{
                width: "100%",
                marginTop: 4,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: loading ? "none" : "0 4px 16px rgba(24,59,40,0.22)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in..." : "Continue to workspace →"}
            </button>
          </div>

          {/* Footer note */}
          <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#8a9e90" }}>
            Access is restricted to authorized R&amp;M staff only.
          </p>
        </div>
      </section>
    </main>
  );
}
