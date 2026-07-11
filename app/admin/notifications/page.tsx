"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { Sun, Lightbulb, BarChart3, Droplets, Tag, Heart, Moon, PenLine, type LucideIcon } from "lucide-react";

const G = "#39613B", DARK = "#1B201A", MID = "#4E504F";

const QUICK_MESSAGES: { label: string; icon: LucideIcon; iconBg: string; title: string; body: string }[] = [
  { label: "Morning Reminder",  icon: Sun,        iconBg: "#F59E0B", title: "Magandang Umaga!",              body: "Magandang umaga! Huwag kalimutan ang EaseBrew mo — inumin 30 mins bago kumain bilang bahagi ng daily routine mo." },
  { label: "Wellness Tip",      icon: Lightbulb,  iconBg: "#8B5CF6", title: "Wellness Tip",                  body: "Alam mo ba? Ang turmeric at luya ay tradisyonal na Pinoy ingredients. Idagdag mo sa mga pagkain mo — perfect kasama ng EaseBrew." },
  { label: "Tracker Reminder",  icon: BarChart3,  iconBg: "#2563EB", title: "I-log ang Progress Mo!",        body: "Buksan ang Wellness Hub mo at i-update ang tracker — para makita mo ang trend ng progress mo. Kahit ilang minuto lang!" },
  { label: "Hydration",         icon: Droplets,   iconBg: "#06B6D4", title: "Uminom ng Tubig!",              body: "Mag-inom ng 8 baso ng tubig araw-araw — mahalaga sa katawan mo at bahagi ng daily wellness routine." },
  { label: "Promo",             icon: Tag,        iconBg: "#E74C3C", title: "May Promo!",                    body: "[I-edit ito — ilagay ang promo details, presyo, o bundle]. I-message ang coach mo para sa details!" },
  { label: "Encouragement",     icon: Heart,      iconBg: "#EC4899", title: "Ituloy Lang!",                  body: "Tuloy-tuloy lang sa EaseBrew at malusog na pamumuhay! Tandaan — consistency ang susi." },
  { label: "Evening Reminder",  icon: Moon,       iconBg: "#6366F1", title: "Magandang Gabi!",               body: "Magandang gabi! Huwag kalimutan ang pangalawang sachet ng EaseBrew bago matulog. Matulog ng 7-8 oras — mahalaga sa recovery ng katawan." },
  { label: "Custom",            icon: PenLine,    iconBg: MID,       title: "",                              body: "" },
];



export default function NotificationsPage() {
  const { checking, username, role } = useAdminGuard(['owner']);

  const [title, setTitle]   = useState("");
  const [body, setBody]     = useState("");
  const [selected, setSelected] = useState<number | null>(null);

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
      setPublishMsg("✅ Published! All customers can now see it.");
    } catch {
      setPublishMsg("❌ Error occurred. Please try again.");
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
      setPublishMsg("🗑️ Notification cleared.");
    } catch {
      setPublishMsg("❌ Error occurred. Please try again.");
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
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1B201A", margin: 0, fontFamily: "var(--admin-font)" }}>Messages</h1>
          <p style={{ fontSize: 13, color: "#6b7a70", margin: "4px 0 20px", fontFamily: "var(--admin-font)" }}>Create and send messages to customers</p>

          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1B201A", margin: "0 0 12px", textTransform: "uppercase" as const, letterSpacing: "0.3px", fontFamily: "var(--admin-font)" }}>Quick Messages</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_MESSAGES.map((msg, i) => {
              const isSel = selected === i;
              return (
                <button key={i} onClick={() => applyQuick(msg, i)} style={{
                  background: isSel ? "#39613B" : "white", border: `1.5px solid ${isSel ? "#39613B" : "#e8ece9"}`,
                  borderRadius: 14, padding: "12px 14px", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 11,
                  boxShadow: isSel ? "0 4px 12px rgba(57,97,59,0.2)" : "0 1px 3px rgba(20,35,25,0.04)",
                  transition: "all 0.15s", fontFamily: "var(--admin-font)",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: isSel ? "rgba(255,255,255,0.2)" : msg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <msg.icon size={17} color="#fff" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={{ color: isSel ? "white" : DARK, fontWeight: 700, fontSize: 13 }}>{msg.label}</div>
                    <div style={{ color: isSel ? "rgba(255,255,255,0.65)" : MID, fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{msg.title}</div>
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
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8ece9", boxShadow: "0 1px 3px rgba(20,35,25,0.04)", padding: "24px 28px" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1B201A", margin: "0 0 18px", textTransform: "uppercase" as const, letterSpacing: "0.3px", fontFamily: "var(--admin-font)" }}>Compose Message</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1B201A", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Title</label>
                <input type="text" value={title}
                  onChange={e => { setTitle(e.target.value); setPublishMsg(""); }}
                  placeholder="e.g. Special announcement!"
                  style={{ width: "100%", minHeight: 40, padding: "9px 14px", borderRadius: 10, border: "1px solid #e8ece9", background: "#fff", fontFamily: "var(--admin-font)", fontSize: 13, color: "#1B201A", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1B201A", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Message</label>
                <textarea value={body}
                  onChange={e => { setBody(e.target.value); setPublishMsg(""); }}
                  placeholder="Type your message here..."
                  rows={4}
                  style={{ width: "100%", minHeight: 40, padding: "9px 14px", borderRadius: 10, border: "1px solid #e8ece9", background: "#fff", fontFamily: "var(--admin-font)", fontSize: 13, color: "#1B201A", outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
              <button onClick={handlePublish} disabled={!title || !body || publishing}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40, padding: "0 18px", borderRadius: 10, border: "none", background: "#39613B", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--admin-font)", opacity: (!title || !body || publishing) ? 0.5 : 1, transition: "opacity 0.15s" }}>
                {publishing ? "Publishing..." : "Publish to App"}
              </button>
{current?.active && (
                <button onClick={handleClear} disabled={clearing}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40, padding: "0 18px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--admin-font)" }}>
                  {clearing ? "Clearing..." : "Clear Notification"}
                </button>
              )}
            </div>

            {publishMsg && (
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: publishMsg.startsWith("✅") || publishMsg.startsWith("🗑️") ? "#39613B" : "#ef4444", fontFamily: "Inter, system-ui, sans-serif" }}>
                {publishMsg}
              </p>
            )}
          </div>

          {/* Preview */}
          {(title || body) && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8ece9", padding: "24px 28px", boxShadow: "0 1px 3px rgba(20,35,25,0.04)" }}>
              <h3 style={{ color: DARK, fontSize: 13, fontWeight: 700, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.3px", fontFamily: "var(--admin-font)" }}>
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
                This is how it will appear at the top of the customer hub once published.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
