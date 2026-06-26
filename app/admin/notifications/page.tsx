"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";

const G    = "#39613B";
const DARK = "#1B201A";
const MID  = "#4E504F";

const QUICK_MESSAGES = [
  { label: "Daily Reminder",    icon: "☕", title: "EaseBrew Reminder ☕",        body: "Naiinom mo na ba ang EaseBrew mo ngayon? Stay consistent para sa best results!" },
  { label: "Weekly Check-in",   icon: "💪", title: "Weekly Wellness Check-in 💪", body: "Kumusta ang pakiramdam mo ngayong linggo? Sana okay na ang joints mo!" },
  { label: "Re-order Reminder", icon: "🛒", title: "Malapit na maubos! 🛒",        body: "Mukhang malapit na maubos ang EaseBrew mo. Mag-order na para walang gap sa wellness journey mo!" },
  { label: "Promo Alert",       icon: "🎉", title: "Special Promo! 🎉",            body: "May espesyal na offer kami ngayon! Check mo ang aming latest deals sa EaseBrew." },
  { label: "Milestone",         icon: "🏆", title: "30 Days Complete! 🏆",         body: "Congrats sa 30 days ng consistent EaseBrew! Ikwento mo sa amin ang iyong results!" },
];

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  border: "1.5px solid #e0e0e0", fontSize: 13, outline: "none",
  boxSizing: "border-box", color: DARK, fontFamily: "Inter, system-ui, sans-serif",
};

export default function NotificationsPage() {
  const { checking, username, role } = useAdminGuard(['owner']);

  const [title, setTitle]   = useState("");
  const [body, setBody]     = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // App notification state
  const [current, setCurrent] = useState<{ title: string; message: string; active: boolean } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [clearing, setClearing]     = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  useEffect(() => {
    if (checking) return;
    fetch("/api/content")
      .then(r => r.json())
      .then(data => {
        const c = data?.content as Record<string, string> | undefined;
        if (!c) return;
        setCurrent({
          title:   c.notification_title?.trim()   || "",
          message: c.notification_message?.trim() || "",
          active:  c.notification_active === "true",
        });
      })
      .catch(() => {});
  }, [checking]);

  function applyQuick(msg: typeof QUICK_MESSAGES[0], idx: number) {
    setTitle(msg.title);
    setBody(msg.body);
    setSelected(idx);
    setCopied(false);
  }

  function handleCopyMessage() {
    if (!title || !body) return;
    navigator.clipboard.writeText(`${title}\n\n${body}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); })
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = `${title}\n\n${body}`;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
  }

  async function handlePublish() {
    if (!title || !body) return;
    setPublishing(true);
    setPublishMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            { key: "notification_active",  value: "true" },
            { key: "notification_title",   value: title  },
            { key: "notification_message", value: body   },
          ],
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setCurrent({ title, message: body, active: true });
      setPublishMsg("✅ Na-publish na! Makikita na ng lahat ng customers.");
    } catch {
      setPublishMsg("❌ May error. Subukan ulit.");
    }
    setPublishing(false);
  }

  async function handleClear() {
    setClearing(true);
    setPublishMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ key: "notification_active", value: "false" }] }),
      });
      if (!res.ok) throw new Error(await res.text());
      setCurrent(prev => prev ? { ...prev, active: false } : null);
      setPublishMsg("🗑️ Na-clear na ang notification.");
    } catch {
      setPublishMsg("❌ May error. Subukan ulit.");
    }
    setClearing(false);
  }

  if (checking) return null;

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/notifications" role={role} username={username} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", gap: 24 }}>

        {/* ── Left: Quick Messages ── */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 6px" }}>Messages</h1>
          <p style={{ color: MID, fontSize: 13, margin: "0 0 20px" }}>Gumawa at mag-send ng mensahe sa customers</p>

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
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{msg.icon}</span>
                  <div>
                    <div style={{ color: isSel ? "white" : DARK, fontWeight: "bold", fontSize: 13 }}>{msg.label}</div>
                    <div style={{ color: isSel ? "rgba(255,255,255,0.7)" : MID, fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{msg.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {current && current.active && (
            <div style={{ background: "#e8f5e0", borderRadius: 12, padding: "14px", marginTop: 20, border: "1px solid #39613B40" }}>
              <p style={{ color: G, fontWeight: "bold", fontSize: 12, margin: "0 0 6px" }}>📣 Active App Notification:</p>
              <p style={{ color: DARK, fontSize: 12, fontWeight: "bold", margin: "0 0 4px" }}>{current.title}</p>
              <p style={{ color: MID, fontSize: 11, margin: 0, lineHeight: 1.5 }}>{current.message}</p>
            </div>
          )}
        </div>

        {/* ── Right: Compose + Publish ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Compose */}
          <div style={{ background: "white", borderRadius: 14, padding: "28px 32px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <h2 style={{ color: DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 20px" }}>✏️ Compose Message</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setCopied(false); setPublishMsg(""); }}
                  placeholder="e.g. Special announcement!"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>Message</label>
                <textarea
                  value={body}
                  onChange={e => { setBody(e.target.value); setCopied(false); setPublishMsg(""); }}
                  placeholder="Type your message here..."
                  rows={4}
                  style={{ ...inp, resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = G}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {/* Publish to App */}
              <button
                onClick={handlePublish}
                disabled={!title || !body || publishing}
                style={{
                  background: (!title || !body || publishing) ? "#f0f0f0" : G,
                  color: (!title || !body || publishing) ? "#aaa" : "white",
                  border: "none", borderRadius: 10, padding: "12px 22px",
                  fontSize: 13, fontWeight: "bold",
                  cursor: (!title || !body || publishing) ? "not-allowed" : "pointer",
                }}
              >
                {publishing ? "Publishing..." : "📣 Publish to App"}
              </button>

              {/* Copy for Messenger/Viber */}
              <button
                onClick={handleCopyMessage}
                disabled={!title || !body}
                style={{
                  background: copied ? "#dcfce7" : (!title || !body) ? "#f0f0f0" : "white",
                  color: copied ? G : (!title || !body) ? "#aaa" : DARK,
                  border: `1.5px solid ${(!title || !body) ? "#e0e0e0" : "#d0d0d0"}`,
                  borderRadius: 10, padding: "12px 22px",
                  fontSize: 13, fontWeight: "bold",
                  cursor: (!title || !body) ? "not-allowed" : "pointer",
                }}
              >
                {copied ? "✅ Copied!" : "📋 Copy (Messenger/Viber)"}
              </button>

              {/* Clear active notification */}
              {current?.active && (
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  style={{
                    background: "white", color: "#ef4444",
                    border: "1.5px solid #fca5a5",
                    borderRadius: 10, padding: "12px 22px",
                    fontSize: 13, fontWeight: "bold",
                    cursor: clearing ? "not-allowed" : "pointer",
                  }}
                >
                  {clearing ? "Clearing..." : "🗑️ Clear Notification"}
                </button>
              )}
            </div>

            {publishMsg && (
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: "bold", color: publishMsg.startsWith("✅") || publishMsg.startsWith("🗑️") ? G : "#ef4444" }}>
                {publishMsg}
              </p>
            )}
          </div>

          {/* Preview */}
          {(title || body) && (
            <div style={{ background: "white", borderRadius: 14, padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <h3 style={{ color: DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📱 App Preview
              </h3>
              <div style={{ maxWidth: 420, background: DARK, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", border: `2px solid ${G}` }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>📣</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#FED255", fontWeight: "bold", fontSize: 14, margin: "0 0 4px" }}>{title || "Title..."}</p>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{body || "Message..."}</p>
                </div>
              </div>
              <p style={{ color: "#bbb", fontSize: 11, marginTop: 10 }}>
                Ganito lalabas sa itaas ng customer hub kapag na-publish.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div style={{ background: "#fef9e7", borderRadius: 12, padding: "18px 20px", border: "1px solid #FED25560" }}>
            <p style={{ color: "#b45309", fontWeight: "bold", fontSize: 13, margin: "0 0 10px" }}>📋 Paano gamitin:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: "1px solid #e0e0e0" }}>
                <p style={{ color: DARK, fontWeight: "bold", fontSize: 13, margin: "0 0 6px" }}>📣 Publish to App</p>
                <p style={{ color: MID, fontSize: 12, margin: 0, lineHeight: 1.6 }}>Lalabas sa banner ng customer app — makikita ng lahat ng customers agad.</p>
              </div>
              <div style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: "1px solid #e0e0e0" }}>
                <p style={{ color: DARK, fontWeight: "bold", fontSize: 13, margin: "0 0 6px" }}>📋 Copy (Messenger/Viber)</p>
                <p style={{ color: MID, fontSize: 12, margin: 0, lineHeight: 1.6 }}>I-copy at i-paste sa personal na chat ng customer sa Messenger, Viber, o SMS.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
