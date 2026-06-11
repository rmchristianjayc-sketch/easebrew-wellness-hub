"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const DARK = "#1B201A";
const MID = "#4E504F";
const SIDEBAR_W = 220;

const QUICK_MESSAGES = [
  { label: "Daily Reminder", icon: "☕", title: "EaseBrew Reminder ☕", body: "Naiinom mo na ba ang EaseBrew mo ngayon? Stay consistent para sa best results!" },
  { label: "Weekly Check-in", icon: "💪", title: "Weekly Wellness Check-in 💪", body: "Kumusta ang pakiramdam mo ngayong linggo? Sana okay na ang joints mo!" },
  { label: "Re-order Reminder", icon: "🛒", title: "Malapit na maubos! 🛒", body: "Mukhang malapit na maubos ang EaseBrew mo. Mag-order na para walang gap sa wellness journey mo!" },
  { label: "Promo Alert", icon: "🎉", title: "Special Promo! 🎉", body: "May espesyal na offer kami ngayon! Check mo ang aming latest deals sa EaseBrew." },
  { label: "Milestone", icon: "🏆", title: "30 Days Complete! 🏆", body: "Congrats sa 30 days ng consistent EaseBrew! Ikwento mo sa amin ang iyong results!" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active }: { active: string }) {
  const [username, setUsername] = useState("");
  useEffect(() => { setUsername(localStorage.getItem("eb_admin_username") || "Admin"); }, []);

  // ✅ No "Codes" — Admin only
  const links = [
    { href: "/admin", icon: "⚡", label: "Dashboard" },
    { href: "/admin/analytics", icon: "📊", label: "Analytics" },
    { href: "/admin/content", icon: "✏️", label: "Content" },
    { href: "/admin/notifications", icon: "🔔", label: "Notifications" },
  ];

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    localStorage.removeItem("eb_admin_role");
    localStorage.removeItem("eb_admin_username");
    window.location.href = "/admin/login";
  }

  return (
    <aside style={{ width: SIDEBAR_W, minHeight: "100vh", background: G, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 100, boxShadow: "2px 0 12px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: GOLD, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>☕</div>
          <div>
            <div style={{ color: GOLD, fontWeight: "bold", fontSize: 14 }}>EaseBrew</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Admin Panel</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(l => {
          const isActive = active === l.href;
          return (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: isActive ? "rgba(254,210,85,0.15)" : "transparent", borderLeft: isActive ? `3px solid ${GOLD}` : "3px solid transparent", cursor: "pointer" }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 17 }}>{l.icon}</span>
                <span style={{ color: isActive ? GOLD : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: isActive ? "bold" : "normal" }}>{l.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
          <div>
            <div style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>{username}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Administrator</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: "100%", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  function applyQuick(msg: typeof QUICK_MESSAGES[0], idx: number) {
    setTitle(msg.title); setBody(msg.body);
    setSelected(idx); setSent(false); setError("");
  }

  async function handleSend() {
    if (!title || !body) { setError("Please enter both title and message."); return; }
    setSending(true); setError("");
    try {
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
      setTimeout(() => { setSent(false); setSelected(null); }, 3000);
    } catch { setError("Failed to send. Please try again."); }
    setSending(false);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 8,
    border: "1.5px solid #e0e0e0", fontSize: 13, outline: "none",
    boxSizing: "border-box", color: DARK, fontFamily: "Inter, system-ui, sans-serif",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/notifications" />

      <main style={{ marginLeft: SIDEBAR_W, flex: 1, padding: "32px 36px", minWidth: 0, display: "flex", gap: 24 }}>

        {/* ── Left: Quick Messages ── */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 6px" }}>Notifications</h1>
          <p style={{ color: MID, fontSize: 13, margin: "0 0 20px" }}>Send messages to all customers</p>

          <h2 style={{ color: DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>⚡ Quick Messages</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_MESSAGES.map((msg, i) => {
              const isSelected = selected === i;
              return (
                <button key={i} onClick={() => applyQuick(msg, i)} style={{
                  background: isSelected ? G : "white",
                  border: `1.5px solid ${isSelected ? G : "#e0e0e0"}`,
                  borderRadius: 12, padding: "12px 14px",
                  textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: isSelected ? "0 2px 8px rgba(57,97,59,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = G; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{msg.icon}</span>
                  <div>
                    <div style={{ color: isSelected ? "white" : DARK, fontWeight: "bold", fontSize: 13 }}>{msg.label}</div>
                    <div style={{ color: isSelected ? "rgba(255,255,255,0.7)" : MID, fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{msg.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ background: "#f0f7f0", borderRadius: 12, padding: "16px", marginTop: 20, border: `1px solid ${G}30` }}>
            <p style={{ color: G, fontWeight: "bold", fontSize: 12, margin: "0 0 8px" }}>📋 How push notifications work:</p>
            <ul style={{ color: MID, fontSize: 11, margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
              <li>Customers must allow notifications in the app</li>
              <li>Works on Android & iOS (Safari)</li>
              <li>Appears even when app is closed</li>
              <li>Auto daily reminder sent at 8AM</li>
            </ul>
          </div>
        </div>

        {/* ── Right: Compose ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: "white", borderRadius: 14, padding: "28px 32px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <h2 style={{ color: DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 20px" }}>✏️ Compose Message</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>Notification Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Special announcement!" style={inp}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>Message</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Type your message here..." rows={5}
                  style={{ ...inp, resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "10px 14px", color: "#cc0000", fontSize: 12, marginTop: 14 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleSend} disabled={sending || !title || !body} style={{
              marginTop: 20, background: sent ? "#dcfce7" : (!title || !body) ? "#f0f0f0" : G,
              color: sent ? G : (!title || !body) ? "#aaa" : "white",
              border: "none", borderRadius: 10, padding: "12px 28px",
              fontSize: 14, fontWeight: "bold",
              cursor: (!title || !body) ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}>
              {sent ? "✅ Sent to all customers!" : sending ? "Sending..." : "🔔 Send to All Customers"}
            </button>
          </div>

          {(title || body) && (
            <div style={{ background: "white", borderRadius: 14, padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <h3 style={{ color: DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📱 Preview
              </h3>
              <div style={{ maxWidth: 360, background: "#1c1c1e", borderRadius: 20, padding: "20px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                <div style={{ background: "#2c2c2e", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, background: G, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>☕</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      <span style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>EaseBrew</span>
                      <span style={{ color: "#888", fontSize: 11 }}>now</span>
                    </div>
                    <div style={{ color: "white", fontSize: 13, fontWeight: "bold", marginBottom: 2 }}>{title || "Title..."}</div>
                    <div style={{ color: "#aaa", fontSize: 12, lineHeight: 1.4 }}>{body || "Message..."}</div>
                  </div>
                </div>
              </div>
              <p style={{ color: "#bbb", fontSize: 11, marginTop: 12 }}>This is how the notification will appear on customers' phones.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}