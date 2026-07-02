"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { PRICE_CONFIG } from "@/lib/price-config";

const G    = "#39613B";
const DARK = "#1B201A";
const MID  = "#4E504F";

// keep legacy constants for inline field styles throughout the page
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

const PRODUCTS_META = [
  { n: 1, emoji: "📊", name: "Pain Tracker",   tier: "Lahat ng customers"   },
  { n: 2, emoji: "🥗", name: "Meal Plan",      tier: "₱1,499+"              },
  { n: 3, emoji: "💪", name: "Exercise Guide", tier: "₱1,499+"              },
  { n: 4, emoji: "📖", name: "Recipe Book",    tier: "₱2,998+"              },
  { n: 5, emoji: "🏆", name: "Bagong Katawan", tier: "₱4,497+"              },
  { n: 6, emoji: "🌿", name: "VIP Bundle",     tier: "Pinakamataas na tier" },
];

type ContentState = Record<string, string>;
type BoolState    = Record<string, boolean>;

function ProductsSection({ editing, content, saved, setEditing, setContent, setSaved }: {
  editing: ContentState; content: ContentState; saved: BoolState;
  setEditing: React.Dispatch<React.SetStateAction<ContentState>>;
  setContent: React.Dispatch<React.SetStateAction<ContentState>>;
  setSaved:   React.Dispatch<React.SetStateAction<BoolState>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {PRODUCTS_META.map(({ n, emoji, name, tier }) => {
        const nameKey = `product_${n}_name`;
        const descKey = `product_${n}_desc`;
        const nameVal = editing[nameKey] ?? "";
        const descVal = editing[descKey] ?? "";
        const nameChanged = nameVal !== (content[nameKey] ?? "");
        const descChanged = descVal !== (content[descKey] ?? "");
        const hasPending = nameChanged || descChanged;
        const allSaved = saved[nameKey] && saved[descKey];
        return (
          <div key={n} style={{ background: "white", border: "1.5px solid #e8e8e8", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{emoji}</span>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 14, color: DARK }}>{name}</div>
                  <div style={{ fontSize: 11, color: MID }}>👥 {tier}</div>
                </div>
              </div>
              {hasPending && (
                <button onClick={async () => {
                  const updates = [{ key: nameKey, value: nameVal }, { key: descKey, value: descVal }];
                  const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                  if (res.ok) {
                    setContent(p => ({ ...p, [nameKey]: nameVal, [descKey]: descVal }));
                    setSaved(p => ({ ...p, [nameKey]: true, [descKey]: true }));
                    setTimeout(() => setSaved(p => ({ ...p, [nameKey]: false, [descKey]: false })), 2000);
                  }
                }} style={{ background: allSaved ? "#dcfce7" : G, color: allSaved ? G : "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                  {allSaved ? "✅ Saved!" : "💾 Save"}
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 4 }}>
                  Pangalan {nameChanged && <span style={{ color: "#f59e0b" }}>●</span>}
                </label>
                <input type="text" value={nameVal}
                  onChange={e => setEditing(p => ({ ...p, [nameKey]: e.target.value }))}
                  placeholder={`e.g. ${name}`}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${nameChanged ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, background: nameChanged ? "#fffbeb" : "white", color: DARK }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 4 }}>
                  Description {descChanged && <span style={{ color: "#f59e0b" }}>●</span>}
                </label>
                <textarea value={descVal}
                  onChange={e => setEditing(p => ({ ...p, [descKey]: e.target.value }))}
                  rows={2} placeholder="Ilarawan ang feature na ito..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${descChanged ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, background: descChanged ? "#fffbeb" : "white", color: DARK }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ContentPage() {
  const { checking, username } = useAdminGuard(['owner']);
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
    if (!checking) fetchContent();
  }, [checking, fetchContent]);

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

  async function clearCoach(n: number) {
    const keys = [`coach_${n}_name`, `coach_${n}_number`, `coach_${n}_display`, `coach_${n}_facebook`, `coach_${n}_photo`];
    const updates = keys.map(k => ({ key: k, value: "" }));
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        const cleared: Record<string, string> = {};
        keys.forEach(k => { cleared[k] = ""; });
        setEditing(p => ({ ...p, ...cleared }));
        setContent(p => ({ ...p, ...cleared }));
      }
    } catch { /* silent */ }
  }

  const groups: Record<string, string[]> = {};
  Object.entries(CONTENT_LABELS).forEach(([key, meta]) => {
    if (!groups[meta.group]) groups[meta.group] = [];
    groups[meta.group].push(key);
  });
  const groupNames = Object.keys(groups);

  const pendingCount       = Object.entries(editing).filter(([k, v]) => v !== (content[k] ?? "")).length;
  const activeGroupPending = (groups[activeGroup] ?? []).filter(k => editing[k] !== (content[k] ?? "")).length;

  if (checking || loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7f5", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/content" username={username} />
      <main style={{ flex: 1, marginLeft: 248, padding: "36px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: MID }}>Loading content...</div>
      </main>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7f5", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/content" username={username} />

      <main style={{ flex: 1, minWidth: 0, marginLeft: 248, padding: "36px 40px", display: "flex", gap: 24 }}>
        {/* ── Left: Group Tabs ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B201A", margin: 0, fontFamily: "Inter, system-ui, sans-serif" }}>Content</h1>
          <p style={{ fontSize: 13, color: "#4E504F", margin: "4px 0 18px", fontFamily: "Inter, system-ui, sans-serif" }}>Edit app text &amp; links</p>

          {pendingCount > 0 && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#b45309" }}>
              ⚠️ {pendingCount} unsaved change{pendingCount > 1 ? "s" : ""}
            </div>
          )}

          <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {groupNames.map(g => {
              const isActive   = activeGroup === g;
              const hasPending = (groups[g] ?? []).some(k => editing[k] !== (content[k] ?? ""));
              return (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  background: isActive ? "#FED255" : "transparent",
                  color: isActive ? "#183b28" : "var(--ink)",
                  border: "none",
                  borderRadius: 7, padding: "9px 12px", fontSize: 12.5,
                  cursor: "pointer", textAlign: "left", fontWeight: isActive ? 700 : 400,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}>
                  <span>{g}</span>
                  {hasPending && !isActive && (
                    <span style={{ width: 7, height: 7, background: "#f59e0b", borderRadius: "50%", flexShrink: 0 }} />
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

          <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #dde4df", boxShadow: "0 1px 3px rgba(20,35,25,0.05)", padding: "22px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1B201A", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.5px", fontFamily: "Inter, system-ui, sans-serif" }}>{activeGroup}</h2>
              {activeGroupPending > 0 && (
                <button onClick={handleSaveAll} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 30, padding: "0 10px", borderRadius: 6, border: "none", background: "#39613B", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}>
                  Save All ({activeGroupPending})
                </button>
              )}
            </div>

            {/* ── COACH MANAGEMENT — card grid ── */}
            {activeGroup === "👥 Coach Management" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[1,2,3,4,5,6].map(n => {
                  const fields: { key: string; label: string }[] = [
                    { key: `coach_${n}_name`,     label: "Pangalan" },
                    { key: `coach_${n}_number`,   label: "Phone (09xxxxxxxxx)" },
                    { key: `coach_${n}_display`,  label: "Display (0917 xxx xxxx)" },
                    { key: `coach_${n}_facebook`, label: "Facebook Link" },
                    { key: `coach_${n}_photo`,    label: "Photo URL" },
                  ];
                  const hasAny = fields.some(f => (editing[f.key] ?? "").trim() !== "");
                  const hasPending = fields.some(f => (editing[f.key] ?? "") !== (content[f.key] ?? ""));
                  return (
                    <div key={n} style={{ background: hasAny ? "#f9fdfb" : "#fafafa", border: `1.5px solid ${hasAny ? "#c3ddc5" : "#e8e8e8"}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontWeight: "bold", fontSize: 13, color: hasAny ? G : MID }}>
                          👤 Coach {n} {!hasAny && <span style={{ fontWeight: "normal", color: "#bbb" }}>— Walang laman</span>}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          {hasPending && (
                            <button onClick={async () => {
                              const updates = fields.map(f => ({ key: f.key, value: editing[f.key] ?? "" }));
                              const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                              if (res.ok) {
                                const saved: Record<string, string> = {};
                                updates.forEach(({ key, value }) => { saved[key] = value; });
                                setContent(p => ({ ...p, ...saved }));
                                const s: Record<string, boolean> = {};
                                fields.forEach(f => { s[f.key] = true; });
                                setSaved(p => ({ ...p, ...s }));
                                setTimeout(() => setSaved(p => { const c = { ...p }; fields.forEach(f => { c[f.key] = false; }); return c; }), 2000);
                              }
                            }} style={{ background: G, color: "white", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: "bold" }}>
                              💾 Save
                            </button>
                          )}
                          {hasAny && (
                            <button onClick={() => clearCoach(n)} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#dc2626", cursor: "pointer" }}>
                              🗑️ Clear
                            </button>
                          )}
                        </div>
                      </div>
                      {fields.map(({ key, label }) => {
                        const val = editing[key] ?? "";
                        const changed = val !== (content[key] ?? "");
                        return (
                          <div key={key} style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>
                              {label}{changed && <span style={{ color: "#f59e0b", marginLeft: 4 }}>●</span>}
                            </label>
                            <input type="text" value={val}
                              onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                              placeholder={label}
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${changed ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, background: changed ? "#fffbeb" : "white", color: DARK }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

            /* ── ORDER LINKS — table with tier info + test button ── */
            ) : activeGroup === "🛒 Order Links" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#f0f7f0", border: "1px solid #d4e8d4", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: G }}>
                  💡 Gamitin ang Shopee, Lazada, Facebook, o kahit anong checkout link. I-click ang <strong>🔗 Test</strong> para i-verify na gumagana ang link.
                </div>
                {Object.entries(PRICE_CONFIG).map(([price, cfg]) => {
                  const key = `order_url_${price}`;
                  const val = editing[key] ?? "";
                  const hasChange = val !== (content[key] ?? "");
                  const isSaved = saved[key];
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ width: 170, flexShrink: 0 }}>
                        <div style={{ fontWeight: "bold", fontSize: 13, color: DARK }}>₱{Number(price).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: MID }}>{cfg.packs} pack{cfg.packs > 1 ? "s" : ""} · {cfg.validityDays} days</div>
                      </div>
                      <input type="text" value={val}
                        onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                        placeholder="https://..."
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", background: hasChange ? "#fffbeb" : "white", color: DARK }}
                      />
                      {val && (
                        <a href={val} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                          <button type="button" style={{ background: "#f0f7f0", border: "1px solid #c3ddc5", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: G, cursor: "pointer", whiteSpace: "nowrap" }}>
                            🔗 Test
                          </button>
                        </a>
                      )}
                      <button onClick={() => handleSave(key)} disabled={!hasChange || saving[key]} style={{
                        background: isSaved ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                        color: isSaved ? G : hasChange ? "white" : "#aaa",
                        border: "none", borderRadius: 8, padding: "8px 14px",
                        fontSize: 12, fontWeight: "bold",
                        cursor: hasChange ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                      }}>
                        {isSaved ? "✅" : saving[key] ? "..." : "Save"}
                      </button>
                    </div>
                  );
                })}
              </div>

            ) : activeGroup === "🛍️ Products & Gifts" ? (
              <ProductsSection editing={editing} content={content} saved={saved} setEditing={setEditing} setContent={setContent} setSaved={setSaved} />

            /* ── WELLNESS TIPS — 2-col grid ── */
            ) : activeGroup === "💡 Wellness Tips" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[1,2,3,4,5,6,7,8].map(n => {
                  const key = `daily_tip_${n}`;
                  const val = editing[key] ?? "";
                  const hasChange = val !== (content[key] ?? "");
                  const isSaved2 = saved[key];
                  return (
                    <div key={n} style={{ background: "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontWeight: "bold", fontSize: 12, color: val ? G : MID }}>💡 Tip {n}</span>
                        <button onClick={() => handleSave(key)} disabled={!hasChange} style={{
                          background: isSaved2 ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                          color: isSaved2 ? G : hasChange ? "white" : "#aaa",
                          border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: "bold", cursor: hasChange ? "pointer" : "not-allowed",
                        }}>{isSaved2 ? "✅" : "Save"}</button>
                      </div>
                      <textarea value={val}
                        onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                        rows={3} placeholder="Isulat ang tip dito..."
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, background: hasChange ? "#fffbeb" : "white", color: DARK }}
                      />
                    </div>
                  );
                })}
              </div>

            /* ── FAQs — card per Q&A pair ── */
            ) : activeGroup === "❓ FAQs" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2,3,4,5,6,7].map(n => {
                  const qKey = `faq_${n}_q`;
                  const aKey = `faq_${n}_a`;
                  const qVal = editing[qKey] ?? "";
                  const aVal = editing[aKey] ?? "";
                  const hasChange = qVal !== (content[qKey] ?? "") || aVal !== (content[aKey] ?? "");
                  const hasContent2 = qVal.trim() || aVal.trim();
                  const allSaved2 = saved[qKey] && saved[aKey];
                  return (
                    <div key={n} style={{ background: hasContent2 ? "#f9fdfb" : "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontWeight: "bold", fontSize: 13, color: hasContent2 ? G : MID }}>❓ FAQ {n} {!hasContent2 && <span style={{ fontWeight: "normal", color: "#bbb" }}>— Walang laman</span>}</span>
                        {hasChange && (
                          <button onClick={async () => {
                            const updates = [{ key: qKey, value: qVal }, { key: aKey, value: aVal }];
                            const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                            if (res.ok) {
                              setContent(p => ({ ...p, [qKey]: qVal, [aKey]: aVal }));
                              setSaved(p => ({ ...p, [qKey]: true, [aKey]: true }));
                              setTimeout(() => setSaved(p => ({ ...p, [qKey]: false, [aKey]: false })), 2000);
                            }
                          }} style={{ background: allSaved2 ? "#dcfce7" : G, color: allSaved2 ? G : "white", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
                            {allSaved2 ? "✅ Saved!" : "💾 Save"}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>Tanong</label>
                          <input type="text" value={qVal}
                            onChange={e => setEditing(p => ({ ...p, [qKey]: e.target.value }))}
                            placeholder="Isulat ang tanong..."
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>Sagot</label>
                          <textarea value={aVal}
                            onChange={e => setEditing(p => ({ ...p, [aKey]: e.target.value }))}
                            rows={2} placeholder="Isulat ang sagot..."
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, color: DARK }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            /* ── TESTIMONIALS — card per person ── */
            ) : activeGroup === "💬 Testimonials" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[1,2,3].map(n => {
                  const fields = [
                    { key: `testimonial_${n}_name`, label: "Pangalan", placeholder: "e.g. Nena R." },
                    { key: `testimonial_${n}_age`, label: "Edad", placeholder: "e.g. 58" },
                    { key: `testimonial_${n}_location`, label: "Lokasyon", placeholder: "e.g. Quezon City" },
                    { key: `testimonial_${n}_pain_before`, label: "Pain Bago (1-10)", placeholder: "e.g. 8" },
                    { key: `testimonial_${n}_pain_after`, label: "Pain Pagkatapos (1-10)", placeholder: "e.g. 3" },
                  ];
                  const quoteKey = `testimonial_${n}_quote`;
                  const allKeys = [...fields.map(f => f.key), quoteKey];
                  const hasContent2 = allKeys.some(k => (editing[k] ?? "").trim());
                  const hasChange = allKeys.some(k => (editing[k] ?? "") !== (content[k] ?? ""));
                  const allSaved2 = allKeys.every(k => saved[k]);
                  return (
                    <div key={n} style={{ background: hasContent2 ? "#f9fdfb" : "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span style={{ fontWeight: "bold", fontSize: 13, color: hasContent2 ? G : MID }}>⭐ Testimonial {n} {!hasContent2 && <span style={{ fontWeight: "normal", color: "#bbb" }}>— Walang laman</span>}</span>
                        {hasChange && (
                          <button onClick={async () => {
                            const updates = allKeys.map(k => ({ key: k, value: editing[k] ?? "" }));
                            const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                            if (res.ok) {
                              const s: Record<string, string> = {};
                              allKeys.forEach(k => { s[k] = editing[k] ?? ""; });
                              setContent(p => ({ ...p, ...s }));
                              const sv: Record<string, boolean> = {};
                              allKeys.forEach(k => { sv[k] = true; });
                              setSaved(p => ({ ...p, ...sv }));
                              setTimeout(() => setSaved(p => { const c = { ...p }; allKeys.forEach(k => { c[k] = false; }); return c; }), 2000);
                            }
                          }} style={{ background: allSaved2 ? "#dcfce7" : G, color: allSaved2 ? G : "white", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
                            {allSaved2 ? "✅ Saved!" : "💾 Save"}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                        {fields.slice(0, 3).map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>{label}</label>
                            <input type="text" value={editing[key] ?? ""}
                              onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                              placeholder={placeholder}
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>Quote</label>
                        <textarea value={editing[quoteKey] ?? ""}
                          onChange={e => setEditing(p => ({ ...p, [quoteKey]: e.target.value }))}
                          rows={2} placeholder="Isulat ang testimonial quote..."
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, color: DARK }}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {fields.slice(3).map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>{label}</label>
                            <input type="text" value={editing[key] ?? ""}
                              onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                              placeholder={placeholder}
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            /* ── VIDEOS — card per video ── */
            ) : activeGroup === "🎬 Videos" ? (
              <>
                <div style={{ background: "#f0f7f0", border: "1px solid #d4e8d4", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: G, lineHeight: 1.6 }}>
                  💡 <strong>Paano gamitin:</strong> I-upload ang video sa YouTube (puwedeng &quot;Unlisted&quot; para hindi makita sa public search), tapos i-copy-paste ang buong link dito.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[1,2,3].map(n => {
                    const titleKey = `video_${n}_title`;
                    const descKey = `video_${n}_desc`;
                    const urlKey = `video_${n}_url`;
                    const allKeys = [titleKey, descKey, urlKey];
                    const hasContent2 = allKeys.some(k => (editing[k] ?? "").trim());
                    const hasChange = allKeys.some(k => (editing[k] ?? "") !== (content[k] ?? ""));
                    const allSaved2 = allKeys.every(k => saved[k]);
                    return (
                      <div key={n} style={{ background: hasContent2 ? "#f9fdfb" : "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontWeight: "bold", fontSize: 13, color: hasContent2 ? G : MID }}>🎬 Video {n} {!hasContent2 && <span style={{ fontWeight: "normal", color: "#bbb" }}>— Walang laman</span>}</span>
                          {hasChange && (
                            <button onClick={async () => {
                              const updates = allKeys.map(k => ({ key: k, value: editing[k] ?? "" }));
                              const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                              if (res.ok) {
                                const s: Record<string, string> = {};
                                allKeys.forEach(k => { s[k] = editing[k] ?? ""; });
                                setContent(p => ({ ...p, ...s }));
                                const sv: Record<string, boolean> = {};
                                allKeys.forEach(k => { sv[k] = true; });
                                setSaved(p => ({ ...p, ...sv }));
                                setTimeout(() => setSaved(p => { const c = { ...p }; allKeys.forEach(k => { c[k] = false; }); return c; }), 2000);
                              }
                            }} style={{ background: allSaved2 ? "#dcfce7" : G, color: allSaved2 ? G : "white", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
                              {allSaved2 ? "✅ Saved!" : "💾 Save"}
                            </button>
                          )}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 8 }}>
                          <div>
                            <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>Title</label>
                            <input type="text" value={editing[titleKey] ?? ""}
                              onChange={e => setEditing(p => ({ ...p, [titleKey]: e.target.value }))}
                              placeholder="Video title..."
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>YouTube Link</label>
                            <input type="text" value={editing[urlKey] ?? ""}
                              onChange={e => setEditing(p => ({ ...p, [urlKey]: e.target.value }))}
                              placeholder="https://youtube.com/watch?v=..."
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: MID, fontWeight: "bold", display: "block", marginBottom: 3 }}>Description</label>
                          <textarea value={editing[descKey] ?? ""}
                            onChange={e => setEditing(p => ({ ...p, [descKey]: e.target.value }))}
                            rows={2} placeholder="Maikling description..."
                            style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, color: DARK }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>

            /* ── Default: Promo & Homepage (simple fields) ── */
            ) : (
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
                  return (
                    <div key={key}>
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
