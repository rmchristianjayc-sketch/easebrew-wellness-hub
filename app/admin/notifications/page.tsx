"use client";
import { useState } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";

const G = "#39613B";
const DARK = "#1B201A";
const MID = "#4E504F";

const QUICK_MESSAGES = [
  { label: "Daily Reminder",    icon: "☕", title: "EaseBrew Reminder ☕",        body: "Naiinom mo na ba ang EaseBrew mo ngayon? Stay consistent para sa best results!" },
  { label: "Weekly Check-in",   icon: "💪", title: "Weekly Wellness Check-in 💪", body: "Kumusta ang pakiramdam mo ngayong linggo? Sana okay na ang joints mo!" },
  { label: "Re-order Reminder", icon: "🛒", title: "Malapit na maubos! 🛒",        body: "Mukhang malapit na maubos ang EaseBrew mo. Mag-order na para walang gap sa wellness journey mo!" },
  { label: "Promo Alert",       icon: "🎉", title: "Special Promo! 🎉",            body: "May espesyal na offer kami ngayon! Check mo ang aming latest deals sa EaseBrew." },
  { label: "Milestone",         icon: "🏆", title: "30 Days Complete! 🏆",         body: "Congrats sa 30 days ng consistent EaseBrew! Ikwento mo sa amin ang iyong results!" },
];

export default function NotificationsPage() {
  const { checking, username } = useAdminGuard(['owner']);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  function applyQuick(msg: typeof QUICK_MESSAGES[0], idx: number) {
    setTitle(msg.title);
    setBody(msg.body);
    setSelected(idx);
    setCopied(false);
  }

  function handleCopyMessage() {
    if (!title || !body) return;
    navigator.clipboard.writeText(`${title}\n\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 8,
    border: "1.5px solid #e0e0e0", fontSize: 13, outline: "none",
    boxSizing: "border-box", color: DARK, fontFamily: "Inter, system-ui, sans-serif",
  };

  if (checking) return null;

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/notifications" username={username} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", gap: 24 }}>

        {/* ── Left: Quick Messages ── */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 6px" }}>Notifications</h1>
          <p style={{ color: MID, fontSize: 13, margin: "0 0 20px" }}>Gumawa ng mensahe para sa customers</p>

          <h2 style={{ color: DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>⚡ Quick Messages</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_MESSAGES.map((msg, i) => {
              const isSel = selected === i;
              return (
                <button key={i} onClick={() => applyQuick(msg, i)} style={{
                  background: isSel ? G : "white", border: `1.5px solid ${isSel ? G : "#e0e0e0"}`,
                  borderRadius: 12, padding: "12px 14px", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: isSel ? "0 2px 8px rgba(57,97,59,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.borderColor = G; }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{msg.icon}</span>
                  <div>
                    <div style={{ color: isSel ? "white" : DARK, fontWeight: "bold", fontSize: 13 }}>{msg.label}</div>
                    <div style={{ color: isSel ? "rgba(255,255,255,0.7)" : MID, fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{msg.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ background: "#fef9e7", borderRadius: 12, padding: "16px", marginTop: 20, border: "1px solid #FED25560" }}>
            <p style={{ color: "#b45309", fontWeight: "bold", fontSize: 12, margin: "0 0 8px" }}>📋 Paano gamitin:</p>
            <ol style={{ color: MID, fontSize: 11, margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
              <li>Pumili ng Quick Message o mag-type ng sarili</li>
              <li>I-copy ang mensahe gamit ang button sa ibaba</li>
              <li>I-paste sa Messenger, Viber, o SMS ng customer</li>
            </ol>
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#fff8e1", borderRadius: 8, border: "1px solid #FED255" }}>
              <p style={{ color: "#b45309", fontSize: 11, margin: 0 }}>
                💡 <strong>Push notification</strong> feature — coming soon. Kailangan ng Supabase Edge Functions setup para gumana.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Compose ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: "white", borderRadius: 14, padding: "28px 32px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <h2 style={{ color: DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 20px" }}>✏️ Compose Message</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>Title</label>
                <input type="text" value={title} onChange={e => { setTitle(e.target.value); setCopied(false); }} placeholder="e.g. Special announcement!" style={inp}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>Message</label>
                <textarea value={body} onChange={e => { setBody(e.target.value); setCopied(false); }} placeholder="Type your message here..." rows={5}
                  style={{ ...inp, resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            </div>
            <button onClick={handleCopyMessage} disabled={!title || !body} style={{
              marginTop: 20,
              background: copied ? "#dcfce7" : (!title || !body) ? "#f0f0f0" : G,
              color: copied ? G : (!title || !body) ? "#aaa" : "white",
              border: "none", borderRadius: 10, padding: "12px 28px",
              fontSize: 14, fontWeight: "bold",
              cursor: (!title || !body) ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}>
              {copied ? "✅ Copied! I-paste na sa Messenger/Viber" : "📋 Copy Message"}
            </button>
            {copied && (
              <p style={{ color: G, fontSize: 12, marginTop: 10, fontWeight: "bold" }}>
                ✅ Nakopya na! I-paste mo na sa Messenger, Viber, o SMS ng iyong customers.
              </p>
            )}
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
              <p style={{ color: "#bbb", fontSize: 11, marginTop: 12 }}>
                Ganito ang hitsura ng mensahe mo kapag na-paste sa Messenger o Viber.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
