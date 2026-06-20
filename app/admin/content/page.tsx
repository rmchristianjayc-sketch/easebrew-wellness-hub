"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/_components/Sidebar";

const G    = "#39613B";
const DARK = "#1B201A";
const MID  = "#4E504F";

const CONTENT_LABELS: Record<string, { label: string; group: string; multiline?: boolean; type?: "boolean" }> = {
  // ── Promo ────────────────────────────────────────────────
  promo_enabled: { label: "Ipakita ang Promo Banner?", group: "📢 Promo Announcement", type: "boolean" },
  promo_text:    { label: "Promo Message",              group: "📢 Promo Announcement", multiline: true },

  // ── Homepage ─────────────────────────────────────────────
  hero_title:    { label: "Hero Title (e.g. Kamusta, Nanay at Tatay! 👋)", group: "🏠 Homepage" },
  hero_subtitle: { label: "Hero Subtitle (pangalawang linya sa ilalim ng title)",  group: "🏠 Homepage", multiline: true },

  // ── Products ─────────────────────────────────────────────
  product_1_name: { label: "Product 1 — Pangalan (📊 Tracker)",        group: "🛍️ Products & Gifts" },
  product_1_desc: { label: "Product 1 — Description",                  group: "🛍️ Products & Gifts", multiline: true },
  product_2_name: { label: "Product 2 — Pangalan (🥗 Meal Plan)",       group: "🛍️ Products & Gifts" },
  product_2_desc: { label: "Product 2 — Description",                  group: "🛍️ Products & Gifts", multiline: true },
  product_3_name: { label: "Product 3 — Pangalan (💪 Exercise Guide)",  group: "🛍️ Products & Gifts" },
  product_3_desc: { label: "Product 3 — Description",                  group: "🛍️ Products & Gifts", multiline: true },
  product_4_name: { label: "Product 4 — Pangalan (📖 Recipe Book)",     group: "🛍️ Products & Gifts" },
  product_4_desc: { label: "Product 4 — Description",                  group: "🛍️ Products & Gifts", multiline: true },
  product_5_name: { label: "Product 5 — Pangalan (🏆 Bagong Katawan)",  group: "🛍️ Products & Gifts" },
  product_5_desc: { label: "Product 5 — Description",                  group: "🛍️ Products & Gifts", multiline: true },
  product_6_name: { label: "Product 6 — Pangalan (🌿 VIP Bundle)",      group: "🛍️ Products & Gifts" },
  product_6_desc: { label: "Product 6 — Description",                  group: "🛍️ Products & Gifts", multiline: true },

  // ── Coaches ──────────────────────────────────────────────
  coach_1_name:     { label: "Coach 1 — Pangalan",                              group: "👥 Coach Management" },
  coach_1_number:   { label: "Coach 1 — Phone Number (e.g. 09171234567)",       group: "👥 Coach Management" },
  coach_1_display:  { label: "Coach 1 — Display Number (e.g. 0917 123 4567)",   group: "👥 Coach Management" },
  coach_1_facebook: { label: "Coach 1 — Facebook Link",                         group: "👥 Coach Management" },
  coach_1_photo:    { label: "Coach 1 — Photo Path (e.g. /coaches/josephine.jpg)", group: "👥 Coach Management" },
  coach_2_name:     { label: "Coach 2 — Pangalan",        group: "👥 Coach Management" },
  coach_2_number:   { label: "Coach 2 — Phone Number",    group: "👥 Coach Management" },
  coach_2_display:  { label: "Coach 2 — Display Number",  group: "👥 Coach Management" },
  coach_2_facebook: { label: "Coach 2 — Facebook Link",   group: "👥 Coach Management" },
  coach_2_photo:    { label: "Coach 2 — Photo Path",      group: "👥 Coach Management" },
  coach_3_name:     { label: "Coach 3 — Pangalan",        group: "👥 Coach Management" },
  coach_3_number:   { label: "Coach 3 — Phone Number",    group: "👥 Coach Management" },
  coach_3_display:  { label: "Coach 3 — Display Number",  group: "👥 Coach Management" },
  coach_3_facebook: { label: "Coach 3 — Facebook Link",   group: "👥 Coach Management" },
  coach_3_photo:    { label: "Coach 3 — Photo Path",      group: "👥 Coach Management" },
  coach_4_name:     { label: "Coach 4 — Pangalan",        group: "👥 Coach Management" },
  coach_4_number:   { label: "Coach 4 — Phone Number",    group: "👥 Coach Management" },
  coach_4_display:  { label: "Coach 4 — Display Number",  group: "👥 Coach Management" },
  coach_4_facebook: { label: "Coach 4 — Facebook Link",   group: "👥 Coach Management" },
  coach_4_photo:    { label: "Coach 4 — Photo Path",      group: "👥 Coach Management" },
  coach_5_name:     { label: "Coach 5 — Pangalan",        group: "👥 Coach Management" },
  coach_5_number:   { label: "Coach 5 — Phone Number",    group: "👥 Coach Management" },
  coach_5_display:  { label: "Coach 5 — Display Number",  group: "👥 Coach Management" },
  coach_5_facebook: { label: "Coach 5 — Facebook Link",   group: "👥 Coach Management" },
  coach_5_photo:    { label: "Coach 5 — Photo Path",      group: "👥 Coach Management" },
  coach_6_name:     { label: "Coach 6 — Pangalan",        group: "👥 Coach Management" },
  coach_6_number:   { label: "Coach 6 — Phone Number",    group: "👥 Coach Management" },
  coach_6_display:  { label: "Coach 6 — Display Number",  group: "👥 Coach Management" },
  coach_6_facebook: { label: "Coach 6 — Facebook Link",   group: "👥 Coach Management" },
  coach_6_photo:    { label: "Coach 6 — Photo Path",      group: "👥 Coach Management" },

  // ── Order Links ───────────────────────────────────────────
  order_url_399:   { label: "Order Link — ₱399 (1 Pack)",      group: "🛒 Order Links" },
  order_url_699:   { label: "Order Link — ₱699 (2 Packs)",     group: "🛒 Order Links" },
  order_url_999:   { label: "Order Link — ₱999 (3 Packs)",     group: "🛒 Order Links" },
  order_url_1499:  { label: "Order Link — ₱1,499 (5 Packs)",   group: "🛒 Order Links" },
  order_url_2998:  { label: "Order Link — ₱2,998 (10 Packs)",  group: "🛒 Order Links" },
  order_url_4497:  { label: "Order Link — ₱4,497 (15 Packs)",  group: "🛒 Order Links" },
  order_url_5996:  { label: "Order Link — ₱5,996 (20 Packs)",  group: "🛒 Order Links" },
  order_url_7499:  { label: "Order Link — ₱7,499 (25 Packs)",  group: "🛒 Order Links" },
  order_url_8994:  { label: "Order Link — ₱8,994 (30 Packs)",  group: "🛒 Order Links" },
  order_url_11992: { label: "Order Link — ₱11,992 (40 Packs)", group: "🛒 Order Links" },
  order_url_14990: { label: "Order Link — ₱14,990 (50 Packs)", group: "🛒 Order Links" },

  // ── Wellness Tips ─────────────────────────────────────────
  daily_tip_1: { label: "Tip 1", group: "💡 Wellness Tips", multiline: true },
  daily_tip_2: { label: "Tip 2", group: "💡 Wellness Tips", multiline: true },
  daily_tip_3: { label: "Tip 3", group: "💡 Wellness Tips", multiline: true },
  daily_tip_4: { label: "Tip 4", group: "💡 Wellness Tips", multiline: true },
  daily_tip_5: { label: "Tip 5", group: "💡 Wellness Tips", multiline: true },
  daily_tip_6: { label: "Tip 6", group: "💡 Wellness Tips", multiline: true },
  daily_tip_7: { label: "Tip 7", group: "💡 Wellness Tips", multiline: true },
  daily_tip_8: { label: "Tip 8", group: "💡 Wellness Tips", multiline: true },

  // ── FAQs ─────────────────────────────────────────────────
  faq_1_q: { label: "FAQ 1 — Tanong", group: "❓ FAQs" },
  faq_1_a: { label: "FAQ 1 — Sagot",  group: "❓ FAQs", multiline: true },
  faq_2_q: { label: "FAQ 2 — Tanong", group: "❓ FAQs" },
  faq_2_a: { label: "FAQ 2 — Sagot",  group: "❓ FAQs", multiline: true },
  faq_3_q: { label: "FAQ 3 — Tanong", group: "❓ FAQs" },
  faq_3_a: { label: "FAQ 3 — Sagot",  group: "❓ FAQs", multiline: true },
  faq_4_q: { label: "FAQ 4 — Tanong", group: "❓ FAQs" },
  faq_4_a: { label: "FAQ 4 — Sagot",  group: "❓ FAQs", multiline: true },
  faq_5_q: { label: "FAQ 5 — Tanong", group: "❓ FAQs" },
  faq_5_a: { label: "FAQ 5 — Sagot",  group: "❓ FAQs", multiline: true },
  faq_6_q: { label: "FAQ 6 — Tanong", group: "❓ FAQs" },
  faq_6_a: { label: "FAQ 6 — Sagot",  group: "❓ FAQs", multiline: true },
  faq_7_q: { label: "FAQ 7 — Tanong", group: "❓ FAQs" },
  faq_7_a: { label: "FAQ 7 — Sagot",  group: "❓ FAQs", multiline: true },

  // ── Testimonials ─────────────────────────────────────────
  testimonial_1_name:        { label: "Testimonial 1 — Pangalan (e.g. Nena R.)",    group: "💬 Testimonials" },
  testimonial_1_age:         { label: "Testimonial 1 — Edad",                       group: "💬 Testimonials" },
  testimonial_1_location:    { label: "Testimonial 1 — Lokasyon (e.g. Quezon City)", group: "💬 Testimonials" },
  testimonial_1_quote:       { label: "Testimonial 1 — Quote",                      group: "💬 Testimonials", multiline: true },
  testimonial_1_pain_before: { label: "Testimonial 1 — Pain Score Bago (1-10)",     group: "💬 Testimonials" },
  testimonial_1_pain_after:  { label: "Testimonial 1 — Pain Score Pagkatapos (1-10)", group: "💬 Testimonials" },
  testimonial_2_name:        { label: "Testimonial 2 — Pangalan",    group: "💬 Testimonials" },
  testimonial_2_age:         { label: "Testimonial 2 — Edad",        group: "💬 Testimonials" },
  testimonial_2_location:    { label: "Testimonial 2 — Lokasyon",    group: "💬 Testimonials" },
  testimonial_2_quote:       { label: "Testimonial 2 — Quote",       group: "💬 Testimonials", multiline: true },
  testimonial_2_pain_before: { label: "Testimonial 2 — Pain Score Bago",       group: "💬 Testimonials" },
  testimonial_2_pain_after:  { label: "Testimonial 2 — Pain Score Pagkatapos", group: "💬 Testimonials" },
  testimonial_3_name:        { label: "Testimonial 3 — Pangalan",    group: "💬 Testimonials" },
  testimonial_3_age:         { label: "Testimonial 3 — Edad",        group: "💬 Testimonials" },
  testimonial_3_location:    { label: "Testimonial 3 — Lokasyon",    group: "💬 Testimonials" },
  testimonial_3_quote:       { label: "Testimonial 3 — Quote",       group: "💬 Testimonials", multiline: true },
  testimonial_3_pain_before: { label: "Testimonial 3 — Pain Score Bago",       group: "💬 Testimonials" },
  testimonial_3_pain_after:  { label: "Testimonial 3 — Pain Score Pagkatapos", group: "💬 Testimonials" },

  // ── Videos ────────────────────────────────────────────────
  video_1_title: { label: "Video 1 — Title",                           group: "🎬 Videos" },
  video_1_desc:  { label: "Video 1 — Description",                     group: "🎬 Videos", multiline: true },
  video_1_url:   { label: "Video 1 — YouTube Link (i-paste buong URL)", group: "🎬 Videos" },
  video_2_title: { label: "Video 2 — Title",                           group: "🎬 Videos" },
  video_2_desc:  { label: "Video 2 — Description",                     group: "🎬 Videos", multiline: true },
  video_2_url:   { label: "Video 2 — YouTube Link (i-paste buong URL)", group: "🎬 Videos" },
  video_3_title: { label: "Video 3 — Title",                           group: "🎬 Videos" },
  video_3_desc:  { label: "Video 3 — Description",                     group: "🎬 Videos", multiline: true },
  video_3_url:   { label: "Video 3 — YouTube Link (i-paste buong URL)", group: "🎬 Videos" },

  // ── Notifications ─────────────────────────────────────────
  // ✅ Bug #5 FIX: Tinanggal na ang reorder_reminder_days — dead setting, walang gumagamit
};

const COACH_DIVIDERS: Record<string, string> = {
  coach_1_name: "👤 Coach 1", coach_2_name: "👤 Coach 2",
  coach_3_name: "👤 Coach 3", coach_4_name: "👤 Coach 4",
  coach_5_name: "👤 Coach 5", coach_6_name: "👤 Coach 6",
};
const TESTIMONIAL_DIVIDERS: Record<string, string> = {
  testimonial_1_name: "⭐ Testimonial 1",
  testimonial_2_name: "⭐ Testimonial 2",
  testimonial_3_name: "⭐ Testimonial 3",
};
const FAQ_DIVIDERS: Record<string, string> = {
  faq_1_q: "❓ FAQ 1", faq_2_q: "❓ FAQ 2", faq_3_q: "❓ FAQ 3",
  faq_4_q: "❓ FAQ 4", faq_5_q: "❓ FAQ 5", faq_6_q: "❓ FAQ 6",
  faq_7_q: "❓ FAQ 7",
};
const VIDEO_DIVIDERS: Record<string, string> = {
  video_1_title: "🎬 Video 1",
  video_2_title: "🎬 Video 2",
  video_3_title: "🎬 Video 3",
};

export default function ContentPage() {
  const router = useRouter();
  const [username, setUsername]       = useState("");
  const [content, setContent]         = useState<Record<string, string>>({});
  const [editing, setEditing]         = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState<Record<string, boolean>>({});
  const [saved, setSaved]             = useState<Record<string, boolean>>({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [activeGroup, setActiveGroup] = useState("📢 Promo Announcement");

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/content");
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to load content."); setLoading(false); return; }
      setContent(data.content ?? {});
      setEditing(data.content ?? {});
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) { router.push("/admin/login"); return; }
        const { role, username: u } = await res.json();
        if (role === "coach") { router.push("/admin/codes"); return; }
        setUsername(u);
      } catch {
        router.push("/admin/login");
        return;
      }
      fetchContent();
    }
    init();
  }, [fetchContent, router]);

  async function handleSave(key: string) {
    setSaving(p => ({ ...p, [key]: true }));
    try {
      const res = await fetch("/api/admin/content", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ updates: [{ key, value: editing[key] ?? "" }] }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(p => ({ ...p, [key]: true }));
        setTimeout(() => setSaved(p => ({ ...p, [key]: false })), 2000);
        setContent(p => ({ ...p, [key]: editing[key] ?? "" }));
      } else {
        setError(data.error || "Failed to save.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setSaving(p => ({ ...p, [key]: false }));
  }

  async function handleSaveAll() {
    const keys    = groups[activeGroup] ?? [];
    const changed = keys
      .filter(k => editing[k] !== (content[k] ?? ""))
      .map(k => ({ key: k, value: editing[k] ?? "" }));
    if (changed.length === 0) return;

    const savingMap: Record<string, boolean> = {};
    changed.forEach(({ key }) => { savingMap[key] = true; });
    setSaving(p => ({ ...p, ...savingMap }));

    try {
      const res  = await fetch("/api/admin/content", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ updates: changed }),
      });
      const data = await res.json();
      if (res.ok) {
        const savedMap: Record<string, boolean>  = {};
        const newContent: Record<string, string> = {};
        changed.forEach(({ key, value }) => { savedMap[key] = true; newContent[key] = value; });
        setSaved(p => ({ ...p, ...savedMap }));
        setContent(p => ({ ...p, ...newContent }));
        setTimeout(() => setSaved(p => {
          const cleared = { ...p };
          changed.forEach(({ key }) => { cleared[key] = false; });
          return cleared;
        }), 2000);
      } else {
        setError(data.error || "Failed to save.");
      }
    } catch {
      setError("Something went wrong.");
    }

    const notSavingMap: Record<string, boolean> = {};
    changed.forEach(({ key }) => { notSavingMap[key] = false; });
    setSaving(p => ({ ...p, ...notSavingMap }));
  }

  const groups: Record<string, string[]> = {};
  Object.entries(CONTENT_LABELS).forEach(([key, meta]) => {
    if (!groups[meta.group]) groups[meta.group] = [];
    groups[meta.group].push(key);
  });
  const groupNames = Object.keys(groups);

  const pendingCount       = Object.entries(editing).filter(([k, v]) => v !== (content[k] ?? "")).length;
  const activeGroupPending = (groups[activeGroup] ?? []).filter(k => editing[k] !== (content[k] ?? "")).length;

  if (loading) return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/content" username={username} />
      <main className="admin-main" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: MID }}>Loading content...</div>
      </main>
    </div>
  );

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/content" username={username} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", gap: 24 }}>
        {/* ── Left: Group Tabs ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 6px" }}>Content</h1>
          <p style={{ color: MID, fontSize: 13, margin: "0 0 20px" }}>Edit app text & links</p>

          {pendingCount > 0 && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#b45309" }}>
              ⚠️ {pendingCount} unsaved change{pendingCount > 1 ? "s" : ""}
            </div>
          )}

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {groupNames.map(g => {
              const isActive   = activeGroup === g;
              const hasPending = (groups[g] ?? []).some(k => editing[k] !== (content[k] ?? ""));
              return (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  background: isActive ? G : "white", color: isActive ? "white" : DARK,
                  border: `1.5px solid ${isActive ? G : "#e8e8e8"}`,
                  borderRadius: 10, padding: "10px 14px", fontSize: 12,
                  cursor: "pointer", textAlign: "left", fontWeight: isActive ? "bold" : "normal",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: isActive ? "0 2px 8px rgba(57,97,59,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  <span>{g}</span>
                  {hasPending && !isActive && (
                    <span style={{ width: 8, height: 8, background: "#f59e0b", borderRadius: "50%", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Right: Fields ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && (
            <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "12px 16px", color: "#cc0000", fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
              <button onClick={() => setError("")} style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "#cc0000", fontWeight: "bold" }}>✕</button>
            </div>
          )}

          <div style={{ background: "white", borderRadius: 14, padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ color: DARK, fontSize: 16, fontWeight: "bold", margin: 0 }}>{activeGroup}</h2>
              {activeGroupPending > 0 && (
                <button onClick={handleSaveAll} style={{ background: G, color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                  💾 Save All ({activeGroupPending})
                </button>
              )}
            </div>

            {activeGroup === "🎬 Videos" && (
              <div style={{ background: "#f0f7f0", border: "1px solid #d4e8d4", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 12, color: G, lineHeight: 1.6 }}>
                💡 <strong>Paano gamitin:</strong> I-upload ang video sa YouTube (puwedeng &quot;Unlisted&quot; para hindi makita sa public search), tapos i-copy-paste ang buong link dito (kahit anong format — youtube.com/watch?v=..., youtu.be/..., atbp.)
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {groups[activeGroup]?.map(key => {
                const meta      = CONTENT_LABELS[key];
                const val       = editing[key] ?? "";
                const isSaving  = saving[key];
                const isSaved   = saved[key];
                const hasChange = val !== (content[key] ?? "");

                const fieldStyle: React.CSSProperties = {
                  width: "100%", padding: "10px 13px", borderRadius: 8,
                  border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`,
                  fontSize: 13, outline: "none", boxSizing: "border-box",
                  fontFamily: "Inter, system-ui, sans-serif", color: DARK,
                  background: hasChange ? "#fffbeb" : "white",
                  transition: "border-color 0.2s, background 0.2s",
                };

                const dividerLabel =
                  COACH_DIVIDERS[key] || TESTIMONIAL_DIVIDERS[key] ||
                  FAQ_DIVIDERS[key]   || VIDEO_DIVIDERS[key] || null;

                return (
                  <div key={key}>
                    {dividerLabel && (
                      <div style={{ background: "#f0f7f0", borderRadius: 8, padding: "8px 14px", marginBottom: 14, borderLeft: `3px solid ${G}`, fontSize: 13, fontWeight: "bold", color: G }}>
                        {dividerLabel}
                      </div>
                    )}
                    <div style={{ borderBottom: "1px solid #f5f5f5", paddingBottom: 18 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 6 }}>
                            {meta.label}
                            {hasChange && <span style={{ color: "#f59e0b", marginLeft: 6, fontSize: 11 }}>● Modified</span>}
                          </label>
                          {meta.type === "boolean" ? (
                            <select value={val === "true" ? "true" : "false"}
                              onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                              style={{ ...fieldStyle, cursor: "pointer" }}
                            >
                              <option value="true">✅ Oo — Ipakita</option>
                              <option value="false">🚫 Hindi — Itago</option>
                            </select>
                          ) : meta.multiline ? (
                            <textarea value={val}
                              onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                              rows={3} style={{ ...fieldStyle, resize: "vertical" }}
                            />
                          ) : (
                            <input type="text" value={val}
                              onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                              style={fieldStyle}
                            />
                          )}
                        </div>
                        <button onClick={() => handleSave(key)} disabled={isSaving || !hasChange} style={{
                          marginTop: 22, background: isSaved ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                          color: isSaved ? G : hasChange ? "white" : "#aaa",
                          border: "none", borderRadius: 8, padding: "9px 18px",
                          fontSize: 12, fontWeight: "bold",
                          cursor: hasChange ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                        }}>
                          {isSaved ? "✅ Saved!" : isSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
