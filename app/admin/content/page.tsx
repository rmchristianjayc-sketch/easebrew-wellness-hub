"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { HeartPulse, UtensilsCrossed, Dumbbell, Crown, Activity, Pill, IdCard, Home, ShoppingBag, Users, Lightbulb, HelpCircle, MessageSquare, Film, Plus, Trash2, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { DEFAULT_COACHES, parseCoachesFromContent } from "@/lib/coaches";
import type { Coach } from "@/lib/coaches";

const G    = "#39613B";
const DARK = "#1B201A";
const MID  = "#4E504F";

// keep legacy constants for inline field styles throughout the page
const CONTENT_LABELS: Record<string, { label: string; group: string; multiline?: boolean; type?: "boolean" }> = {
  // ── Homepage ─────────────────────────────────────────────
  hero_title:    { label: "Hero Title", group: "🏠 Homepage" },
  hero_subtitle: { label: "Hero Subtitle",  group: "🏠 Homepage", multiline: true },

  // ── Products ─────────────────────────────────────────────
  product_1_name: { label: "Product 1 — Name (📊 Daily Health Tracker)",   group: "🛍️ Products & Gifts" },
  product_1_desc: { label: "Product 1 — Description",                     group: "🛍️ Products & Gifts", multiline: true },
  product_2_name: { label: "Product 2 — Name (🥗 Meal Plan + Recipe Book)", group: "🛍️ Products & Gifts" },
  product_2_desc: { label: "Product 2 — Description",                     group: "🛍️ Products & Gifts", multiline: true },
  product_3_name: { label: "Product 3 — Name (💪 Home Exercise Guide)",    group: "🛍️ Products & Gifts" },
  product_3_desc: { label: "Product 3 — Description",                     group: "🛍️ Products & Gifts", multiline: true },
  product_4_name: { label: "Product 4 — Name (🏆 Complete Wellness Program)", group: "🛍️ Products & Gifts" },
  product_4_desc: { label: "Product 4 — Description",                     group: "🛍️ Products & Gifts", multiline: true },

  // ── Coaches — managed via custom UI, not individual keys ──


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
  faq_1_q: { label: "FAQ 1 — Question", group: "❓ FAQs" },
  faq_1_a: { label: "FAQ 1 — Answer",   group: "❓ FAQs", multiline: true },
  faq_2_q: { label: "FAQ 2 — Question", group: "❓ FAQs" },
  faq_2_a: { label: "FAQ 2 — Answer",   group: "❓ FAQs", multiline: true },
  faq_3_q: { label: "FAQ 3 — Question", group: "❓ FAQs" },
  faq_3_a: { label: "FAQ 3 — Answer",   group: "❓ FAQs", multiline: true },
  faq_4_q: { label: "FAQ 4 — Question", group: "❓ FAQs" },
  faq_4_a: { label: "FAQ 4 — Answer",   group: "❓ FAQs", multiline: true },
  faq_5_q: { label: "FAQ 5 — Question", group: "❓ FAQs" },
  faq_5_a: { label: "FAQ 5 — Answer",   group: "❓ FAQs", multiline: true },
  faq_6_q: { label: "FAQ 6 — Question", group: "❓ FAQs" },
  faq_6_a: { label: "FAQ 6 — Answer",   group: "❓ FAQs", multiline: true },
  faq_7_q: { label: "FAQ 7 — Question", group: "❓ FAQs" },
  faq_7_a: { label: "FAQ 7 — Answer",   group: "❓ FAQs", multiline: true },

  // ── Testimonials ─────────────────────────────────────────
  testimonial_1_name:        { label: "Testimonial 1 — Name",               group: "💬 Testimonials" },
  testimonial_1_age:         { label: "Testimonial 1 — Age",                group: "💬 Testimonials" },
  testimonial_1_location:    { label: "Testimonial 1 — Location",           group: "💬 Testimonials" },
  testimonial_1_quote:       { label: "Testimonial 1 — Quote",              group: "💬 Testimonials", multiline: true },
  testimonial_1_pain_before: { label: "Testimonial 1 — Pain Before (1-10)", group: "💬 Testimonials" },
  testimonial_1_pain_after:  { label: "Testimonial 1 — Pain After (1-10)",  group: "💬 Testimonials" },
  testimonial_2_name:        { label: "Testimonial 2 — Name",               group: "💬 Testimonials" },
  testimonial_2_age:         { label: "Testimonial 2 — Age",                group: "💬 Testimonials" },
  testimonial_2_location:    { label: "Testimonial 2 — Location",           group: "💬 Testimonials" },
  testimonial_2_quote:       { label: "Testimonial 2 — Quote",              group: "💬 Testimonials", multiline: true },
  testimonial_2_pain_before: { label: "Testimonial 2 — Pain Before (1-10)", group: "💬 Testimonials" },
  testimonial_2_pain_after:  { label: "Testimonial 2 — Pain After (1-10)",  group: "💬 Testimonials" },
  testimonial_3_name:        { label: "Testimonial 3 — Name",               group: "💬 Testimonials" },
  testimonial_3_age:         { label: "Testimonial 3 — Age",                group: "💬 Testimonials" },
  testimonial_3_location:    { label: "Testimonial 3 — Location",           group: "💬 Testimonials" },
  testimonial_3_quote:       { label: "Testimonial 3 — Quote",              group: "💬 Testimonials", multiline: true },
  testimonial_3_pain_before: { label: "Testimonial 3 — Pain Before (1-10)", group: "💬 Testimonials" },
  testimonial_3_pain_after:  { label: "Testimonial 3 — Pain After (1-10)",  group: "💬 Testimonials" },

  // ── Videos ────────────────────────────────────────────────
  video_1_title: { label: "Video 1 — Title",                           group: "🎬 Videos" },
  video_1_desc:  { label: "Video 1 — Description",                     group: "🎬 Videos", multiline: true },
  video_1_url:   { label: "Video 1 — YouTube Link", group: "🎬 Videos" },
  video_2_title: { label: "Video 2 — Title",                           group: "🎬 Videos" },
  video_2_desc:  { label: "Video 2 — Description",                     group: "🎬 Videos", multiline: true },
  video_2_url:   { label: "Video 2 — YouTube Link", group: "🎬 Videos" },
  video_3_title: { label: "Video 3 — Title",                           group: "🎬 Videos" },
  video_3_desc:  { label: "Video 3 — Description",                     group: "🎬 Videos", multiline: true },
  video_3_url:   { label: "Video 3 — YouTube Link", group: "🎬 Videos" },

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

const PRODUCTS_META: { n: number; icon: LucideIcon; iconBg: string; name: string; desc: string; tier: string }[] = [
  { n: 1, icon: HeartPulse,      iconBg: "#E74C3C", name: "Daily Health Tracker",       desc: "Track your pain levels, energy, and weight daily. Simple — just 1 minute per day.", tier: "₱999+"  },
  { n: 2, icon: UtensilsCrossed, iconBg: "#27AE60", name: "Meal Plan + Recipe Book",     desc: "50-day Pinoy-friendly meal plan and 30 healthy recipes for joint pain, arthritis, and fatigue.", tier: "₱1,499+" },
  { n: 3, icon: Dumbbell,        iconBg: "#2980B9", name: "Home Exercise Guide",        desc: "Gentle exercises you can do at home. For those with joint pain — no gym needed.", tier: "₱2,998+" },
  { n: 4, icon: Crown,           iconBg: "#F39C12", name: "Complete Wellness Program",  desc: "Everything included: 90-day program, full exercise plan, meal guide, and weekly check-in. The complete package.", tier: "₱4,497+" },
];

const FREE_TOOLS_META: { icon: LucideIcon; iconBg: string; name: string; route: string }[] = [
  { icon: Activity, iconBg: "#8E44AD", name: "Blood Pressure Monitor", route: "/blood-pressure" },
  { icon: Pill,     iconBg: "#E67E22", name: "Medication Reminder",    route: "/medication" },
  { icon: IdCard,   iconBg: "#16A085", name: "Medical Card",           route: "/medical-card" },
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
      {PRODUCTS_META.map(({ n, icon: Icon, iconBg, name, desc, tier }, idx) => {
        const nameKey = `product_${n}_name`;
        const descKey = `product_${n}_desc`;
        const nameVal = editing[nameKey] ?? "";
        const descVal = editing[descKey] ?? "";
        const nameChanged = nameVal !== (content[nameKey] ?? "");
        const descChanged = descVal !== (content[descKey] ?? "");
        const hasPending = nameChanged || descChanged;
        const allSaved = saved[nameKey] && saved[descKey];
        const displayName = nameVal.trim() || name;
        const displayDesc = descVal.trim() || desc;
        return (
          <div key={n} style={{ background: "white", border: "1.5px solid #e8e8e8", borderRadius: 14, overflow: "hidden" }}>
            {/* Product header with colored accent */}
            <div style={{ background: `${iconBg}10`, borderBottom: `2px solid ${iconBg}25`, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${iconBg}40` }}>
                  <Icon size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: DARK }}>{displayName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, background: `${iconBg}20`, color: iconBg, padding: "2px 8px", borderRadius: 99 }}>Tier {idx + 1}</span>
                    <span style={{ fontSize: 11, color: MID }}>Unlocks at {tier}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {hasPending && (
                  <button onClick={async () => {
                    const updates = [{ key: nameKey, value: nameVal }, { key: descKey, value: descVal }];
                    const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                    if (res.ok) {
                      setContent(p => ({ ...p, [nameKey]: nameVal, [descKey]: descVal }));
                      setSaved(p => ({ ...p, [nameKey]: true, [descKey]: true }));
                      setTimeout(() => setSaved(p => ({ ...p, [nameKey]: false, [descKey]: false })), 2000);
                    }
                  }} style={{ background: allSaved ? "#dcfce7" : G, color: allSaved ? G : "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {allSaved ? "✅ Saved!" : "Save"}
                  </button>
                )}
              </div>
            </div>

            {/* Preview + Edit fields */}
            <div style={{ padding: "14px 18px" }}>
              {/* Live preview */}
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MID, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 6 }}>Customer preview</div>
                <div style={{ fontSize: 13, color: DARK, lineHeight: 1.5 }}>{displayDesc}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                    Custom name {nameChanged && <span style={{ color: "#f59e0b" }}>●</span>}
                  </label>
                  <input type="text" value={nameVal}
                    onChange={e => setEditing(p => ({ ...p, [nameKey]: e.target.value }))}
                    placeholder={name}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${nameChanged ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, background: nameChanged ? "#fffbeb" : "white", color: DARK }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                    Custom description {descChanged && <span style={{ color: "#f59e0b" }}>●</span>}
                  </label>
                  <textarea value={descVal}
                    onChange={e => setEditing(p => ({ ...p, [descKey]: e.target.value }))}
                    rows={2} placeholder={desc}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${descChanged ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, background: descChanged ? "#fffbeb" : "white", color: DARK }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Free Health Tools */}
      <div style={{ borderTop: "2px solid #e8e8e8", paddingTop: 20, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: MID, textTransform: "uppercase", letterSpacing: 0.5 }}>Free Health Tools</span>
          <span style={{ fontSize: 10, fontWeight: 600, background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: 99 }}>Included in all packages</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {FREE_TOOLS_META.map(({ icon: FIcon, iconBg, name, route }) => (
            <div key={name} style={{ background: "white", border: "1.5px solid #e8e8e8", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${iconBg}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FIcon size={18} color={iconBg} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: DARK }}>{name}</div>
                <div style={{ fontSize: 11, color: MID }}>{route}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  const [activeGroup, setActiveGroup] = useState("🏠 Homepage");
  const [coaches, setCoaches]         = useState<Coach[]>([]);
  const [coachesSaving, setCoachesSaving] = useState(false);
  const [coachesSaved, setCoachesSaved]   = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/content");
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to load content."); setLoading(false); return; }
      setContent(data.content ?? {});
      setEditing(data.content ?? {});
      setCoaches(parseCoachesFromContent(data.content ?? {}));
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

  function updateCoach(idx: number, field: keyof Coach, value: string) {
    setCoaches(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    setCoachesSaved(false);
  }

  function addCoach() {
    setCoaches(prev => [...prev, { name: "", number: "", display: "", facebook: "", photo: "" }]);
    setCoachesSaved(false);
  }

  function removeCoach(idx: number) {
    setCoaches(prev => prev.filter((_, i) => i !== idx));
    setCoachesSaved(false);
  }

  async function saveCoaches() {
    const valid = coaches.filter(c => c.name.trim());
    if (valid.length === 0) { setError("At least one coach is required."); return; }
    setCoachesSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ key: "coaches_data", value: JSON.stringify(valid) }] }),
      });
      if (res.ok) {
        setCoaches(valid);
        setCoachesSaved(true);
        setTimeout(() => setCoachesSaved(false), 2500);
      } else { setError("Failed to save coaches."); }
    } catch { setError("Something went wrong."); }
    setCoachesSaving(false);
  }

  const groups: Record<string, string[]> = {};
  Object.entries(CONTENT_LABELS).forEach(([key, meta]) => {
    if (!groups[meta.group]) groups[meta.group] = [];
    groups[meta.group].push(key);
  });
  // Coach Management uses custom UI, not CONTENT_LABELS — ensure it appears in tabs
  if (!groups["👥 Coach Management"]) groups["👥 Coach Management"] = [];
  const groupNames = Object.keys(groups);

  const pendingCount       = Object.entries(editing).filter(([k, v]) => v !== (content[k] ?? "")).length;
  const activeGroupPending = (groups[activeGroup] ?? []).filter(k => editing[k] !== (content[k] ?? "")).length;

  if (checking || loading) return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/content" username={username} />
      <main className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: MID, fontFamily: "var(--admin-font)", fontSize: 13 }}>Loading content...</div>
      </main>
    </div>
  );

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/content" username={username} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", gap: 24 }}>
        {/* ── Left: Group Tabs ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1B201A", margin: 0, fontFamily: "var(--admin-font)" }}>Content</h1>
          <p style={{ fontSize: 13, color: "#6b7a70", margin: "4px 0 18px", fontFamily: "var(--admin-font)" }}>Edit app text &amp; links</p>

          {pendingCount > 0 && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#b45309" }}>
              ⚠️ {pendingCount} unsaved change{pendingCount > 1 ? "s" : ""}
            </div>
          )}

          <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(() => {
              const GROUP_ICONS: Record<string, LucideIcon> = {
                "🏠 Homepage": Home,
                "🛍️ Products & Gifts": ShoppingBag,
                "👥 Coach Management": Users,
                "💡 Wellness Tips": Lightbulb,
                "❓ FAQs": HelpCircle,
                "💬 Testimonials": MessageSquare,
                "🎬 Videos": Film,
              };
              return groupNames.map(g => {
                const isActive   = activeGroup === g;
                const hasPending = (groups[g] ?? []).some(k => editing[k] !== (content[k] ?? ""));
                const IconComp   = GROUP_ICONS[g];
                const cleanLabel = g.replace(/^[\p{Emoji}\p{Emoji_Component}️‍]+\s*/u, "");
                return (
                  <button key={g} onClick={() => setActiveGroup(g)} style={{
                    background: isActive ? "#FED255" : "transparent",
                    color: isActive ? "#183b28" : "var(--ink)",
                    border: "none",
                    borderRadius: 10, padding: "10px 14px", fontSize: 13,
                    cursor: "pointer", textAlign: "left", fontWeight: isActive ? 700 : 400,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    fontFamily: "var(--admin-font)",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {IconComp && <IconComp size={15} strokeWidth={2.2} />}
                      {cleanLabel}
                    </span>
                    {hasPending && !isActive && (
                      <span style={{ width: 7, height: 7, background: "#f59e0b", borderRadius: "50%", flexShrink: 0 }} />
                    )}
                  </button>
                );
              });
            })()}
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

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8ece9", boxShadow: "0 1px 3px rgba(20,35,25,0.04)", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1B201A", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.3px", fontFamily: "var(--admin-font)" }}>{activeGroup.replace(/^[\p{Emoji}\p{Emoji_Component}️‍]+\s*/u, "")}</h2>
              {activeGroupPending > 0 && (
                <button onClick={handleSaveAll} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 18px", borderRadius: 10, border: "none", background: "#39613B", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--admin-font)" }}>
                  Save All ({activeGroupPending})
                </button>
              )}
            </div>

            {/* ── COACH MANAGEMENT — dynamic list ── */}
            {activeGroup === "👥 Coach Management" ? (
              <div>
                <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>{coaches.length} coach{coaches.length !== 1 ? "es" : ""}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={addCoach} style={{ display: "flex", alignItems: "center", gap: 5, background: G, color: "white", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      <Plus size={13} /> Add Coach
                    </button>
                    <button onClick={saveCoaches} disabled={coachesSaving} style={{ background: coachesSaved ? "#16a34a" : "#1B201A", color: "white", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: coachesSaving ? 0.5 : 1 }}>
                      {coachesSaving ? "Saving..." : coachesSaved ? "Saved!" : "Save All Coaches"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {coaches.map((coach, idx) => (
                    <div key={idx} style={{ background: "#f9fdfb", border: "1.5px solid #c3ddc5", borderRadius: 12, padding: 16, position: "relative" as const }}>
                      <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#e8e8e8", border: `2px solid ${G}` }}>
                          {coach.photo ? (
                            <Image src={coach.photo} alt={coach.name || "Coach"} width={44} height={44} style={{ objectFit: "cover", width: 44, height: 44 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}><Users size={18} color="#999" /></div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: DARK }}>{coach.name || `Coach ${idx + 1}`}</div>
                          {coach.display && <div style={{ fontSize: 12, color: MID, marginTop: 1 }}>{coach.display}</div>}
                        </div>
                        <button onClick={() => removeCoach(idx)} title="Remove coach" style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 7, padding: "6px", cursor: "pointer", color: "#dc2626", flexShrink: 0 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {([
                        { field: "name" as const,     label: "Name",           placeholder: "e.g. Coach Maria" },
                        { field: "number" as const,   label: "Phone",          placeholder: "09xxxxxxxxx" },
                        { field: "display" as const,  label: "Display Number", placeholder: "0917 xxx xxxx" },
                        { field: "facebook" as const, label: "Facebook",       placeholder: "https://facebook.com/..." },
                        { field: "photo" as const,    label: "Photo URL",      placeholder: "/coaches/name.jpg" },
                      ]).map(({ field, label, placeholder }) => (
                        <div key={field} style={{ marginBottom: 6 }}>
                          <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                            {label}{field === "name" && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
                          </label>
                          <input type="text" value={coach[field]}
                            onChange={e => updateCoach(idx, field, e.target.value)}
                            placeholder={placeholder}
                            style={{ width: "100%", padding: "6px 10px", borderRadius: 7, border: "1.5px solid #e0e0e0", fontSize: 12, outline: "none", boxSizing: "border-box" as const, background: "white", color: DARK }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            ) : activeGroup === "🛍️ Products & Gifts" ? (
              <ProductsSection editing={editing} content={content} saved={saved} setEditing={setEditing} setContent={setContent} setSaved={setSaved} />

            /* ── WELLNESS TIPS — numbered list with defaults ── */
            ) : activeGroup === "💡 Wellness Tips" ? (
              (() => {
                const DEFAULT_TIPS = [
                  "Drink EaseBrew 30 mins before eating for the best effect.",
                  "Drink 8 glasses of water daily — dehydration makes joint pain worse.",
                  "Walk 15 mins after eating for better digestion.",
                  "Eat fish (salmon or bangus) 3x a week for omega-3.",
                  "Turmeric and ginger are natural anti-inflammatory — add them to your meals daily.",
                  "Sleep 7-8 hours — this is when your joints and muscles repair.",
                  "Malunggay is a superfood — add it to sinigang, tinola, or lugaw.",
                  "",
                ];
                const filledCount = [1,2,3,4,5,6,7,8].filter(n => (editing[`daily_tip_${n}`] ?? "").trim()).length;
                return (
                  <div>
                    <div style={{ background: "#f0f7f0", border: "1px solid #d4e8d4", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: G }}>
                        💡 These tips rotate daily on the customer hub. Leave blank to use defaults.
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: filledCount > 0 ? G : MID }}>
                        {filledCount}/8 custom
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[1,2,3,4,5,6,7,8].map(n => {
                        const key = `daily_tip_${n}`;
                        const val = editing[key] ?? "";
                        const hasChange = val !== (content[key] ?? "");
                        const isSaved2 = saved[key];
                        const defaultTip = DEFAULT_TIPS[n - 1] || "";
                        const displayTip = val.trim() || defaultTip;
                        const isCustom = val.trim() !== "";
                        return (
                          <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: isCustom ? G : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isCustom ? "white" : MID }}>{n}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {displayTip && !isCustom && (
                                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6, lineHeight: 1.4, fontStyle: "italic" }}>
                                  Default: {defaultTip}
                                </div>
                              )}
                              <textarea value={val}
                                onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                                rows={2} placeholder={defaultTip || "Write a wellness tip..."}
                                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, background: hasChange ? "#fffbeb" : "white", color: DARK }}
                              />
                            </div>
                            <button onClick={() => handleSave(key)} disabled={!hasChange} style={{
                              background: isSaved2 ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                              color: isSaved2 ? G : hasChange ? "white" : "#aaa",
                              border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: hasChange ? "pointer" : "not-allowed",
                              flexShrink: 0, marginTop: 2,
                            }}>{isSaved2 ? "✅" : "Save"}</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()

            /* ── FAQs — card per Q&A pair ── */
            ) : activeGroup === "❓ FAQs" ? (
              (() => {
                const DEFAULT_FAQ_LIST = [
                  { q: "When should I drink EaseBrew?", a: "Morning and evening — 2 sachets per day for best results. Drink 30 mins before meals for the best effect." },
                  { q: "Is it safe for people with ulcer?", a: "Yes, but drink it after eating a little. Don't drink on an empty stomach." },
                  { q: "When will I feel the effect?", a: "Most customers feel a change within 7-14 days of consistent use. For deeper results — 30-90 days." },
                  { q: "How many sachets per day?", a: "2 sachets per day — one in the morning, one in the evening. This is the recommended dosage for the best results." },
                  { q: "How do I access my free digital products?", a: "Tap the button on each product card. All products included in your order are automatically accessible!" },
                  { q: "Does EaseBrew have side effects?", a: "EaseBrew is made from natural herbs. No known side effects for most people. If you have allergies or maintenance medicine — consult your doctor first." },
                  { q: "", a: "" },
                ];
                const filledCount = [1,2,3,4,5,6,7].filter(n => (editing[`faq_${n}_q`] ?? "").trim() || (editing[`faq_${n}_a`] ?? "").trim()).length;
                return (
                  <div>
                    <div style={{ background: "#fef9f0", border: "1px solid #f0dfc0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "#8B6914" }}>
                        ❓ Customers see these on the main page. Leave blank to use defaults.
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: filledCount > 0 ? G : MID }}>
                        {filledCount}/7 custom
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[1,2,3,4,5,6,7].map(n => {
                        const qKey = `faq_${n}_q`;
                        const aKey = `faq_${n}_a`;
                        const qVal = editing[qKey] ?? "";
                        const aVal = editing[aKey] ?? "";
                        const hasChange = qVal !== (content[qKey] ?? "") || aVal !== (content[aKey] ?? "");
                        const isCustom = qVal.trim() || aVal.trim();
                        const allSaved2 = saved[qKey] && saved[aKey];
                        const def = DEFAULT_FAQ_LIST[n - 1] || { q: "", a: "" };
                        return (
                          <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: isCustom ? "#C0863B" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isCustom ? "white" : MID }}>{n}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {!isCustom && def.q && (
                                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, lineHeight: 1.4, fontStyle: "italic", background: "#fafafa", borderRadius: 6, padding: "6px 8px" }}>
                                  <strong>Default Q:</strong> {def.q}<br/>
                                  <strong>Default A:</strong> {def.a}
                                </div>
                              )}
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <div>
                                  <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>Question</label>
                                  <input type="text" value={qVal}
                                    onChange={e => setEditing(p => ({ ...p, [qKey]: e.target.value }))}
                                    placeholder={def.q || "Write the question..."}
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>Answer</label>
                                  <textarea value={aVal}
                                    onChange={e => setEditing(p => ({ ...p, [aKey]: e.target.value }))}
                                    rows={2} placeholder={def.a || "Write the answer..."}
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                  />
                                </div>
                              </div>
                            </div>
                            <button onClick={async () => {
                              const updates = [{ key: qKey, value: qVal }, { key: aKey, value: aVal }];
                              const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
                              if (res.ok) {
                                setContent(p => ({ ...p, [qKey]: qVal, [aKey]: aVal }));
                                setSaved(p => ({ ...p, [qKey]: true, [aKey]: true }));
                                setTimeout(() => setSaved(p => ({ ...p, [qKey]: false, [aKey]: false })), 2000);
                              }
                            }} disabled={!hasChange} style={{
                              background: allSaved2 ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                              color: allSaved2 ? G : hasChange ? "white" : "#aaa",
                              border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: hasChange ? "pointer" : "not-allowed",
                              flexShrink: 0, marginTop: 2,
                            }}>{allSaved2 ? "✅" : "Save"}</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()

            /* ── TESTIMONIALS — card per person ── */
            ) : activeGroup === "💬 Testimonials" ? (
              (() => {
                const DEFAULT_TESTIMONIALS = [
                  { name: "Nena R.", age: "58", location: "Quezon City", quote: "After 3 weeks, my knee feels so much lighter. I don't need to take medicine every day anymore.", painBefore: "8", painAfter: "3" },
                  { name: "Mang Tony", age: "64", location: "Cebu City", quote: "I didn't believe it at first but I tried it. Now — I can't imagine my morning without EaseBrew.", painBefore: "7", painAfter: "2" },
                  { name: "Ate Susan", age: "52", location: "Davao", quote: "The free meal plan and recipe book — super helpful! Now I know which foods make my arthritis worse.", painBefore: "6", painAfter: "3" },
                ];
                const filledCount = [1,2,3].filter(n => {
                  const keys = [`testimonial_${n}_name`,`testimonial_${n}_quote`];
                  return keys.some(k => (editing[k] ?? "").trim());
                }).length;
                return (
                  <div>
                    <div style={{ background: "#fef0f5", border: "1px solid #f0c0d0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "#9B2C5A" }}>
                        💬 Real customer stories shown on the main page. Leave blank to use defaults.
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: filledCount > 0 ? G : MID }}>
                        {filledCount}/3 custom
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[1,2,3].map(n => {
                        const fields = [
                          { key: `testimonial_${n}_name`, label: "Name", placeholder: "" },
                          { key: `testimonial_${n}_age`, label: "Age", placeholder: "" },
                          { key: `testimonial_${n}_location`, label: "Location", placeholder: "" },
                          { key: `testimonial_${n}_pain_before`, label: "Pain Before (1-10)", placeholder: "" },
                          { key: `testimonial_${n}_pain_after`, label: "Pain After (1-10)", placeholder: "" },
                        ];
                        const quoteKey = `testimonial_${n}_quote`;
                        const allKeys = [...fields.map(f => f.key), quoteKey];
                        const isCustom = allKeys.some(k => (editing[k] ?? "").trim());
                        const hasChange = allKeys.some(k => (editing[k] ?? "") !== (content[k] ?? ""));
                        const allSaved2 = allKeys.every(k => saved[k]);
                        const def = DEFAULT_TESTIMONIALS[n - 1];
                        const displayName = (editing[`testimonial_${n}_name`] ?? "").trim() || def.name;
                        const displayAge = (editing[`testimonial_${n}_age`] ?? "").trim() || def.age;
                        const displayLoc = (editing[`testimonial_${n}_location`] ?? "").trim() || def.location;
                        const displayQuote = (editing[quoteKey] ?? "").trim() || def.quote;
                        const displayBefore = (editing[`testimonial_${n}_pain_before`] ?? "").trim() || def.painBefore;
                        const displayAfter = (editing[`testimonial_${n}_pain_after`] ?? "").trim() || def.painAfter;
                        return (
                          <div key={n} style={{ background: "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: "16px 18px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: isCustom ? "#9B2C5A" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: isCustom ? "white" : MID }}>{n}</span>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 13, color: DARK }}>{displayName}, {displayAge} — {displayLoc}</span>
                              </div>
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
                              }} disabled={!hasChange} style={{
                                background: allSaved2 ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                                color: allSaved2 ? G : hasChange ? "white" : "#aaa",
                                border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: hasChange ? "pointer" : "not-allowed",
                              }}>{allSaved2 ? "✅" : "Save"}</button>
                            </div>
                            {/* Live preview card */}
                            <div style={{ background: "#FFFDF5", border: "1px solid #f0e8d0", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                              <div style={{ fontSize: 11, color: MID, marginBottom: 6, fontWeight: 600 }}>CUSTOMER PREVIEW</div>
                              <div style={{ fontSize: 12, color: DARK, lineHeight: 1.5, fontStyle: "italic", marginBottom: 8 }}>
                                &ldquo;{displayQuote}&rdquo;
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: MID }}>— {displayName}, {displayAge}, {displayLoc}</span>
                                <span style={{ fontSize: 11, fontWeight: 700 }}>
                                  <span style={{ color: "#E74C3C" }}>{displayBefore}</span>
                                  <span style={{ color: MID }}> → </span>
                                  <span style={{ color: G }}>{displayAfter}</span>
                                  <span style={{ color: MID }}> pain score</span>
                                </span>
                              </div>
                            </div>
                            {/* Edit fields */}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 8, marginBottom: 8 }}>
                              {fields.slice(0, 3).map(({ key, label }) => {
                                const defVal = key.includes("_name") ? def.name : key.includes("_age") ? def.age : def.location;
                                return (
                                  <div key={key}>
                                    <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>{label}</label>
                                    <input type="text" value={editing[key] ?? ""}
                                      onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                                      placeholder={defVal}
                                      style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>Quote</label>
                              <textarea value={editing[quoteKey] ?? ""}
                                onChange={e => setEditing(p => ({ ...p, [quoteKey]: e.target.value }))}
                                rows={2} placeholder={def.quote}
                                style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                              />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {fields.slice(3).map(({ key, label }) => {
                                const defVal = key.includes("_before") ? def.painBefore : def.painAfter;
                                return (
                                  <div key={key}>
                                    <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>{label}</label>
                                    <input type="text" value={editing[key] ?? ""}
                                      onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                                      placeholder={defVal}
                                      style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()

            /* ── VIDEOS — card per video ── */
            ) : activeGroup === "🎬 Videos" ? (
              (() => {
                const DEFAULT_VIDEO_LIST = [
                  { title: "How to Prepare EaseBrew", desc: "The right way to maximize the herbal benefits of EaseBrew.", url: "" },
                  { title: "Simple Exercises for Joint Pain", desc: "Low-impact exercises that are safe for seniors and those with arthritis.", url: "" },
                  { title: "", desc: "", url: "" },
                ];
                const filledCount = [1,2,3].filter(n => (editing[`video_${n}_url`] ?? "").trim()).length;
                const extractId = (url: string) => {
                  if (!url) return "";
                  const patterns = [
                    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
                    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
                    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                  ];
                  for (const p of patterns) { const m = url.trim().match(p); if (m) return m[1]; }
                  return "";
                };
                return (
                  <div>
                    <div style={{ background: "#eef0f7", border: "1px solid #c0c8e0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "#3B4A8B", lineHeight: 1.5 }}>
                        🎬 Upload to YouTube (set as &quot;Unlisted&quot; if needed), then paste the link here.
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: filledCount > 0 ? G : MID, whiteSpace: "nowrap" as const, marginLeft: 12 }}>
                        {filledCount}/3 linked
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[1,2,3].map(n => {
                        const titleKey = `video_${n}_title`;
                        const descKey = `video_${n}_desc`;
                        const urlKey = `video_${n}_url`;
                        const allKeys = [titleKey, descKey, urlKey];
                        const hasChange = allKeys.some(k => (editing[k] ?? "") !== (content[k] ?? ""));
                        const allSaved2 = allKeys.every(k => saved[k]);
                        const def = DEFAULT_VIDEO_LIST[n - 1];
                        const urlVal = (editing[urlKey] ?? "").trim();
                        const videoId = extractId(urlVal);
                        const displayTitle = (editing[titleKey] ?? "").trim() || def.title;
                        const displayDesc = (editing[descKey] ?? "").trim() || def.desc;
                        const hasUrl = !!urlVal;
                        return (
                          <div key={n} style={{ background: "white", border: `1.5px solid ${hasChange ? "#f59e0b" : "#e8e8e8"}`, borderRadius: 12, padding: "16px 18px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: hasUrl ? "#3B4A8B" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: hasUrl ? "white" : MID }}>{n}</span>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 13, color: DARK }}>{displayTitle || `Video ${n}`}</span>
                                {!hasUrl && <span style={{ fontSize: 11, color: "#bbb" }}>— No link yet</span>}
                              </div>
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
                              }} disabled={!hasChange} style={{
                                background: allSaved2 ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                                color: allSaved2 ? G : hasChange ? "white" : "#aaa",
                                border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: hasChange ? "pointer" : "not-allowed",
                              }}>{allSaved2 ? "✅" : "Save"}</button>
                            </div>
                            {/* YouTube thumbnail preview */}
                            {videoId ? (
                              <div style={{ marginBottom: 12, borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0", position: "relative" as const }}>
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                  alt="Video thumbnail"
                                  style={{ width: "100%", height: 160, objectFit: "cover" as const, display: "block" }}
                                />
                                <div style={{ position: "absolute" as const, bottom: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "white", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>
                                  ▶ {displayTitle}
                                </div>
                              </div>
                            ) : !hasUrl && def.title ? (
                              <div style={{ marginBottom: 12, background: "#f8f9fb", border: "1px dashed #d0d5e0", borderRadius: 8, padding: "20px 16px", textAlign: "center" as const }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>▶</div>
                                <div style={{ fontSize: 12, color: MID, fontStyle: "italic" }}>
                                  Default: {def.title}
                                </div>
                                <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{def.desc}</div>
                                <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>Paste a YouTube link below to show this video</div>
                              </div>
                            ) : null}
                            {/* Edit fields */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div>
                                <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>YouTube Link</label>
                                <input type="text" value={editing[urlKey] ?? ""}
                                  onChange={e => setEditing(p => ({ ...p, [urlKey]: e.target.value }))}
                                  placeholder="https://youtube.com/watch?v=..."
                                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1.5px solid ${hasChange ? "#f59e0b" : urlVal && !videoId ? "#E74C3C" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                />
                                {urlVal && !videoId && (
                                  <div style={{ fontSize: 10, color: "#E74C3C", marginTop: 2 }}>Invalid YouTube URL — use format: youtube.com/watch?v=... or youtu.be/...</div>
                                )}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div>
                                  <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>Title</label>
                                  <input type="text" value={editing[titleKey] ?? ""}
                                    onChange={e => setEditing(p => ({ ...p, [titleKey]: e.target.value }))}
                                    placeholder={def.title || "Video title..."}
                                    style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 10, color: MID, fontWeight: 700, display: "block", marginBottom: 2, textTransform: "uppercase" as const }}>Description</label>
                                  <input type="text" value={editing[descKey] ?? ""}
                                    onChange={e => setEditing(p => ({ ...p, [descKey]: e.target.value }))}
                                    placeholder={def.desc || "Short description..."}
                                    style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${hasChange ? "#f59e0b" : "#e0e0e0"}`, fontSize: 12, outline: "none", boxSizing: "border-box" as const, color: DARK, background: hasChange ? "#fffbeb" : "white" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()

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
                    fontFamily: "var(--admin-font)", color: DARK,
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
                                <option value="true">✅ Yes — Show</option>
                                <option value="false">🚫 No — Hide</option>
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
