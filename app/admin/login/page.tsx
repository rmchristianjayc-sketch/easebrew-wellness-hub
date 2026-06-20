"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, KeyRound, LockKeyhole, UserRound } from "lucide-react";

const GREEN = "#183b28";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }
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
        gridTemplateColumns: "minmax(360px, 0.9fr) minmax(480px, 1.1fr)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <section
        style={{
          background: GREEN,
          color: "white",
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#FED255", color: GREEN, display: "grid", placeItems: "center" }}>
            <Coffee size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 750 }}>EaseBrew</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", marginTop: 2 }}>Wellness operations</div>
          </div>
        </div>

        <div style={{ maxWidth: 430 }}>
          <div style={{ width: 54, height: 54, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", marginBottom: 22 }}>
            <KeyRound size={27} />
          </div>
          <h1 style={{ fontSize: 34, lineHeight: 1.2, margin: "0 0 14px", letterSpacing: 0 }}>
            Manage customer access with clarity.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Generate codes, monitor active customers, and maintain wellness content from one secure workspace.
          </p>
        </div>

        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, margin: 0 }}>
          R&amp;M EaseBrew Wellness Hub
        </p>
      </section>

      <section style={{ display: "grid", placeItems: "center", padding: "48px", background: "#f4f6f5" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 30 }}>
            <p style={{ color: "#5c6960", fontSize: 12, fontWeight: 750, textTransform: "uppercase", margin: "0 0 8px" }}>
              Secure access
            </p>
            <h2 style={{ color: "#18211b", fontSize: 28, margin: "0 0 8px", letterSpacing: 0 }}>Sign in</h2>
            <p style={{ color: "#667169", fontSize: 14, margin: 0 }}>Use your owner or coach account.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ display: "block" }}>
              <span style={{ color: "#27322b", fontSize: 13, fontWeight: 700, display: "block", marginBottom: 7 }}>Username</span>
              <div style={{ position: "relative" }}>
                <UserRound size={18} style={{ position: "absolute", left: 13, top: 13, color: "#708078" }} />
                <input
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                  placeholder="admin or coach"
                  style={{ width: "100%", minHeight: 44, padding: "10px 14px 10px 42px", border: "1px solid #cbd5ce", borderRadius: 6, background: "white", color: "#18211b", fontSize: 14 }}
                />
              </div>
            </label>

            <label style={{ display: "block" }}>
              <span style={{ color: "#27322b", fontSize: 13, fontWeight: 700, display: "block", marginBottom: 7 }}>Password</span>
              <div style={{ position: "relative" }}>
                <LockKeyhole size={18} style={{ position: "absolute", left: 13, top: 13, color: "#708078" }} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                  placeholder="Enter password"
                  style={{ width: "100%", minHeight: 44, padding: "10px 14px 10px 42px", border: "1px solid #cbd5ce", borderRadius: 6, background: "white", color: "#18211b", fontSize: 14 }}
                />
              </div>
            </label>

            {error && (
              <div role="alert" style={{ background: "#fff1f1", border: "1px solid #efc8c8", borderRadius: 6, padding: "11px 13px", color: "#a82424", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{ minHeight: 46, background: loading ? "#829087" : GREEN, color: "white", border: 0, borderRadius: 6, fontSize: 14, fontWeight: 750, cursor: loading ? "wait" : "pointer" }}
            >
              {loading ? "Signing in..." : "Continue to workspace"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
