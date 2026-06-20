"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const G = "#39613B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      // ✅ FIXED: Wala nang localStorage — ang role ay nasa httpOnly cookie na (JWT)
      // Basahin lang via /api/admin/me kapag kailangan sa UI
      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: CREAM,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "Georgia, serif",
    }}>
      <div style={{
        background: "white", borderRadius: "20px", padding: "40px 32px",
        width: "100%", maxWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px", height: "64px", background: G, borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "28px",
          }}>☕</div>
          <h1 style={{ color: G, fontSize: "22px", fontWeight: "bold", margin: 0 }}>EaseBrew Admin</h1>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "6px" }}>Sign in to your dashboard</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", color: DARK, fontWeight: "bold", display: "block", marginBottom: "6px" }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="owner or coach" onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "2px solid #e0e0e0", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", color: DARK, fontWeight: "bold", display: "block", marginBottom: "6px" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "2px solid #e0e0e0", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {error && (
            <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "8px", padding: "10px 14px", color: "#cc0000", fontSize: "13px" }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            background: loading ? "#ccc" : G, color: "white", border: "none",
            borderRadius: "12px", padding: "14px", fontSize: "16px",
            fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px",
          }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#aaa", fontSize: "12px", marginTop: "24px" }}>
          R&M EaseBrew Wellness Hub © 2025
        </p>
      </div>
    </div>
  );
}
