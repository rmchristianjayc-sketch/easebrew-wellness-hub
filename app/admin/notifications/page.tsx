"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";

const G = "#39613B", DARK = "#1B201A", MID = "#4E504F";

const QUICK_MESSAGES = [
  { label: "Daily Reminder",    icon: "☕", title: "EaseBrew Reminder ☕",        body: "Naiinom mo na ba ang EaseBrew mo ngayon? Stay consistent para sa best results!" },
  { label: "Weekly Check-in",   icon: "💪", title: "Weekly Wellness Check-in 💪", body: "Kumusta ang pakiramdam mo ngayong linggo? Sana okay na ang joints mo!" },
  { label: "Re-order Reminder", icon: "🛒", title: "Malapit na maubos! 🛒",        body: "Mukhang malapit na maubos ang EaseBrew mo. Mag-order na para walang gap sa wellness journey mo!" },
  { label: "Promo Alert",       icon: "🎉", title: "Special Promo! 🎉",            body: "May espesyal na offer kami ngayon! Check mo ang aming latest deals sa EaseBrew." },
  { label: "Milestone",         icon: "🏆", title: "30 Days Complete! 🏆",         body: "Congrats sa 30 days ng consistent EaseBrew! Ikwento mo sa amin ang iyong results!" },
];

const MESSENGER_TEMPLATES = [
  {
    label: "Umaga Check-in",
    icon: "🌅",
    text: "Magandang umaga po! ☀️ Huwag kalimutang uminom ng EaseBrew ngayong umaga bago kumain. Mahal namin kayo! — R&M EaseBrew",
  },
  {
    label: "Gabi Reminder",
    icon: "🌙",
    text: "Magandang gabi po! 🌙 Bago po kayo matulog, inumin ang EaseBrew para sa pinaka-mabuting resulta. Stay consistent — kaya ninyo ito! — R&M EaseBrew",
  },
  {
    label: "Progress Check",
    icon: "📊",
    text: "Kumusta na po ang pakiramdam ninyo? 😊 Sana bumababa na ang sakit! I-log po sa Pain Tracker para makita natin ang inyong progress. Ipagpatuloy lang! — R&M EaseBrew",
  },
  {
    label: "Malapit Mag-expire",
    icon: "⏰",
    text: "Hello po! 👋 Malapit na po mag-expire ang inyong EaseBrew subscription. Para hindi mapuputol ang inyong wellness journey, mag-order na po kayo ng bagong package. Message lang po kayo sa inyong coach! — R&M EaseBrew",
  },
  {
    label: "Payday Promo",
    icon: "💰",
    text: "Payday na po! 🎉 Ngayong payday, mag-stock up na ng EaseBrew para sa inyong pamilya. May espesyal na package kami para sa inyong budget. Message lang po para sa details! — R&M EaseBrew",
  },
  {
    label: "Missed a Few Days",
    icon: "💌",
    text: "Kamusta na po kayo? 🙏 Medyo hindi kayo naka-log sa tracker recently. Huwag po kayong mag-alala — pwede pa kayong magsimulang muli ngayon! Consistent na tayo ulit. — R&M EaseBrew",
  },
  {
    label: "7-Day Milestone",
    icon: "🌟",
    text: "WOW! 🌟 Isang linggo na kayong nag-iinom ng EaseBrew! Magaling! Patuloy lang — ang mga resulta ay darating sa mga susunod na linggo. Ipinagmamalaki namin kayo! — R&M EaseBrew",
  },
  {
    label: "30-Day Congrats",
    icon: "🏆",
    text: "CONGRATS! 🏆 30 days na kayong consistent sa EaseBrew! Ang ganda ng inyong discipline! Ikwento ninyo sa amin ang inyong results — inspire tayo ng iba! — R&M EaseBrew",
  },
];


export default function NotificationsPage() {
  const { checking, username, role } = useAdminGuard(['owner']);

  const [title, setTitle]   = useState("");
  const [body, setBody]     = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [messengerCopiedIdx, setMessengerCopiedIdx] = useState<number | null>(null);

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
          <h1 className="a-page-title">Messages</h1>
          <p className="a-page-subtitle" style={{ marginBottom: 20 }}>Create and send messages to customers</p>

          <h2 className="a-section-title" style={{ marginBottom: 12 }}>Quick Messages</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_MESSAGES.map((msg, i) => {
              const isSel = selected === i;
              return (
                <button key={i} onClick={() => applyQuick(msg, i)} style={{
                  background: isSel ? "var(--green)" : "white", border: `1.5px solid ${isSel ? "var(--green)" : "#e0e0e0"}`,
                  borderRadius: 10, padding: "11px 13px", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 11,
                  boxShadow: isSel ? "0 2px 8px rgba(57,97,59,0.18)" : "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.15s", fontFamily: "var(--admin-font)",
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{msg.icon}</span>
                  <div>
                    <div style={{ color: isSel ? "white" : "var(--ink)", fontWeight: 700, fontSize: 13 }}>{msg.label}</div>
                    <div style={{ color: isSel ? "rgba(255,255,255,0.65)" : "var(--ink-mid)", fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{msg.title}</div>
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

          {/* ── Messenger / Viber Templates ── */}
          <div style={{ marginTop: 24 }}>
            <h2 className="a-section-title" style={{ marginBottom: 6 }}>Messenger Templates</h2>
            <p style={{ color: "var(--ink-mid)", fontSize: 11, margin: "0 0 10px", lineHeight: 1.5, fontFamily: "var(--admin-font)" }}>Copy at i-paste sa Messenger, Viber, o SMS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MESSENGER_TEMPLATES.map((t, i) => {
                const isCopied = messengerCopiedIdx === i;
                return (
                  <button key={i}
                    onClick={() => {
                      navigator.clipboard.writeText(t.text).then(() => {
                        setMessengerCopiedIdx(i);
                        setTimeout(() => setMessengerCopiedIdx(null), 2500);
                      }).catch(() => {});
                    }}
                    style={{
                      background: isCopied ? "#e8f5e0" : "white",
                      border: `1.5px solid ${isCopied ? G : "#e0e0e0"}`,
                      borderRadius: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s",
                    }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{isCopied ? "✅" : t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: isCopied ? G : DARK, fontWeight: "bold", fontSize: 12 }}>{isCopied ? "Copied!" : t.label}</div>
                      {!isCopied && <div style={{ color: MID, fontSize: 10, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text.slice(0, 55)}…</div>}
                    </div>
                    <span style={{ fontSize: 10, color: isCopied ? G : "#ccc", flexShrink: 0 }}>📋</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Compose + Publish ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Compose */}
          <div className="a-card" style={{ padding: "24px 28px" }}>
            <h2 className="a-section-title" style={{ marginBottom: 18 }}>Compose Message</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Title</label>
                <input className="a-input" type="text" value={title}
                  onChange={e => { setTitle(e.target.value); setCopied(false); setPublishMsg(""); }}
                  placeholder="e.g. Special announcement!"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Message</label>
                <textarea className="a-input" value={body}
                  onChange={e => { setBody(e.target.value); setCopied(false); setPublishMsg(""); }}
                  placeholder="Type your message here..."
                  rows={4}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
              <button onClick={handlePublish} disabled={!title || !body || publishing}
                className="a-btn a-btn-primary" style={{ opacity: (!title || !body || publishing) ? 0.5 : 1 }}>
                {publishing ? "Publishing..." : "Publish to App"}
              </button>
              <button onClick={handleCopyMessage} disabled={!title || !body}
                className={`a-btn ${copied ? "a-btn-primary" : "a-btn-ghost"}`} style={{ opacity: (!title || !body) ? 0.5 : 1 }}>
                {copied ? "Copied!" : "Copy (Messenger/Viber)"}
              </button>
              {current?.active && (
                <button onClick={handleClear} disabled={clearing} className="a-btn a-btn-danger">
                  {clearing ? "Clearing..." : "Clear Notification"}
                </button>
              )}
            </div>

            {publishMsg && (
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: publishMsg.startsWith("✅") || publishMsg.startsWith("🗑️") ? "var(--green)" : "#ef4444", fontFamily: "var(--admin-font)" }}>
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
