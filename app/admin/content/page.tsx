"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const DARK = "#1B201A";
const MID = "#4E504F";
const SIDEBAR_W = 220;

type ContentItem = { id: string; key: string; value: string; updated_at: string; updated_by: string };

const CONTENT_LABELS: Record<string, { label: string; group: string; multiline?: boolean; type?: "boolean" }> = {
  // ── Promo Announcement ──────────────────────────────────────
  promo_enabled:   { label: "Ipakita ang Promo Banner?",  group: "📢 Promo Announcement", type: "boolean" },
  promo_text:      { label: "Promo Message",              group: "📢 Promo Announcement", multiline: true },

  // ── Products & Gifts ────────────────────────────────────────
  product_1_name:  { label: "Product 1 — Pangalan (📊 Tracker)",         group: "🛍️ Products & Gifts" },
  product_1_desc:  { label: "Product 1 — Description",                   group: "🛍️ Products & Gifts", multiline: true },
  product_2_name:  { label: "Product 2 — Pangalan (🥗 Meal Plan)",        group: "🛍️ Products & Gifts" },
  product_2_desc:  { label: "Product 2 — Description",                   group: "🛍️ Products & Gifts", multiline: true },
  product_3_name:  { label: "Product 3 — Pangalan (💪 Exercise Guide)",   group: "🛍️ Products & Gifts" },
  product_3_desc:  { label: "Product 3 — Description",                   group: "🛍️ Products & Gifts", multiline: true },
  product_4_name:  { label: "Product 4 — Pangalan (📖 Recipe Book)",      group: "🛍️ Products & Gifts" },
  product_4_desc:  { label: "Product 4 — Description",                   group: "🛍️ Products & Gifts", multiline: true },
  product_5_name:  { label: "Product 5 — Pangalan (🏆 Bagong Katawan)",   group: "🛍️ Products & Gifts" },
  product_5_desc:  { label: "Product 5 — Description",                   group: "🛍️ Products & Gifts", multiline: true },
  product_6_name:  { label: "Product 6 — Pangalan (🌿 VIP Bundle)",       group: "🛍️ Products & Gifts" },
  product_6_desc:  { label: "Product 6 — Description",                   group: "🛍️ Products & Gifts", multiline: true },

  // ── Coach Management ────────────────────────────────────────
  coach_1_name:     { label: "Coach 1 — Pangalan",        group: "👥 Coach Management" },
  coach_1_number:   { label: "Coach 1 — Phone Number (e.g. 09171234567)", group: "👥 Coach Management" },
  coach_1_display:  { label: "Coach 1 — Display Number (e.g. 0917 123 4567)", group: "👥 Coach Management" },
  coach_1_facebook: { label: "Coach 1 — Facebook Link",   group: "👥 Coach Management" },
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

  // ── Homepage ─────────────────────────────────────────────────
  hero_title:    { label: "Hero Title",    group: "🏠 Homepage" },
  hero_subtitle: { label: "Hero Subtitle", group: "🏠 Homepage", multiline: true },

  // ── Order Links ──────────────────────────────────────────────
  order_url_399:   { label: "Order Link — ₱399 (1 Pack)",    group: "🛒 Order Links" },
  order_url_699:   { label: "Order Link — ₱699 (2 Packs)",   group: "🛒 Order Links" },
  order_url_999:   { label: "Order Link — ₱999 (3 Packs)",   group: "🛒 Order Links" },
  order_url_1499:  { label: "Order Link — ₱1,499 (5 Packs)", group: "🛒 Order Links" },
  order_url_2998:  { label: "Order Link — ₱2,998 (10 Packs)", group: "🛒 Order Links" },
  order_url_4497:  { label: "Order Link — ₱4,497 (15 Packs)", group: "🛒 Order Links" },
  order_url_5996:  { label: "Order Link — ₱5,996 (20 Packs)", group: "🛒 Order Links" },
  order_url_7499:  { label: "Order Link — ₱7,499 (25 Packs)", group: "🛒 Order Links" },
  order_url_8994:  { label: "Order Link — ₱8,994 (30 Packs)", group: "🛒 Order Links" },
  order_url_11992: { label: "Order Link — ₱11,992 (40 Packs)", group: "🛒 Order Links" },
  order_url_14990: { label: "Order Link — ₱14,990 (50 Packs)", group: "🛒 Order Links" },

  // ── Notifications ────────────────────────────────────────────
  reorder_reminder_days: { label: "Re-order Reminder (days before expiry)", group: "🔔 Notifications" },

  // ── Wellness Tips ────────────────────────────────────────────
  daily_tip_1: { label: "Daily Tip 1", group: "💡 Wellness Tips", multiline: true },
  daily_tip_2: { label: "Daily Tip 2", group: "💡 Wellness Tips", multiline: true },
  daily_tip_3: { label: "Daily Tip 3", group: "💡 Wellness Tips", multiline: true },
  daily_tip_4: { label: "Daily Tip 4", group: "💡 Wellness Tips", multiline: true },
  daily_tip_5: { label: "Daily Tip 5", group: "💡 Wellness Tips", multiline: true },
};

// Coach dividers — show a visual separator between each coach inside the group
const COACH_DIVIDERS: Record<string, string> = {
  coach_1_name: "👤 Coach 1",
  coach_2_name: "👤 Coach 2",
  coach_3_name: "👤 Coach 3",
  coach_4_name: "👤 Coach 4",
  coach_5_name: "👤 Coach 5",
  coach_6_name: "👤 Coach 6",
};

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active }: { active: string }) {
  const [username, setUsername] = useState("");
  useEffect(() => { setUsername(localStorage.getItem("eb_admin_username") || "Admin"); }, []);

  const links = [
    { href: "/admin",               icon: "⚡", label: "Dashboard"     },
    { href: "/admin/analytics",     icon: "📊", label: "Analytics"     },
    { href: "/admin/content",       icon: "✏️", label: "Content"       },
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
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: isActive ? "rgba(254,210,85,0.15)" : "transparent", borderLeft: isActive ? `3px solid ${GOLD}` : "3px solid transparent", cursor: "pointer" }}
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

// ─── Main ─────────────────────────────────────────────────────
export default function ContentPage() {
  const [content, setContent]   = useState<Record<string, ContentItem>>({});
  const [editing, setEditing]   = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [saved, setSaved]       = useState<Record<string, boolean>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeGroup, setActiveGroup] = useState("📢 Promo Announcement");

  useEffect(() => { fetchContent(); }, []);

  async function fetchContent() {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (!res.ok) { setError("Failed to load content."); return; }
      const map: Record<string, ContentItem> = {};
      const editMap: Record<string, string> = {};
      data.content.forEach((c: ContentItem) => { map[c.key] = c; editMap[c.key] = c.value; });
      setContent(map);
      setEditing(editMap);
    } catch { setError("Something went wrong."); }
    setLoading(false);
  }

  async function handleSave(key: string) {
    setSaving(p => ({ ...p, [key]: true }));
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editing[key] }),
      });
      if (res.ok) {
        setSaved(p => ({ ...p, [key]: true }));
        setTimeout(() => setSaved(p => ({ ...p, [key]: false })), 2000);
        fetchContent();
      }
    } catch { }
    setSaving(p => ({ ...p, [key]: false }));
  }

  // Save all changed fields in the active group at once
  async function handleSaveAll() {
    const keys = groups[activeGroup] ?? [];
    const changed = keys.filter(k => editing[k] !== (content[k]?.value ?? ""));
    await Promise.all(changed.map(k => handleSave(k)));
  }

  const groups: Record<string, string[]> = {};
  Object.entries(CONTENT_LABELS).forEach(([key, meta]) => {
    if (!groups[meta.group]) groups[meta.group] = [];
    groups[meta.group].push(key);
  });
  const groupNames = Object.keys(groups);

  const pendingCount = Object.entries(editing).filter(([k, v]) => v !== (content[k]?.value ?? "")).length;
  const activeGroupPending = (groups[activeGroup] ?? []).filter(k => editing[k] !== (content[k]?.value ?? "")).length;

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/content" />
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: MID }}>Loading content...</div>
      </main>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/content" />

      <main style={{ marginLeft: SIDEBAR_W, flex: 1, padding: "32px 36px", minWidth: 0, display: "flex", gap: 24 }}>

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
              const isActive = activeGroup === g;
              const hasPending = (groups[g] ?? []).some(k => editing[k] !== (content[k]?.value ?? ""));
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
            <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "12px 16px", color: "#cc0000", fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>
          )}

          <div style={{ background: "white", borderRadius: 14, padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            {/* Group header + Save All button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ color: DARK, fontSize: 16, fontWeight: "bold", margin: 0 }}>{activeGroup}</h2>
              {activeGroupPending > 0 && (
                <button onClick={handleSaveAll} style={{
                  background: G, color: "white", border: "none", borderRadius: 8,
                  padding: "8px 18px", fontSize: 12, fontWeight: "bold", cursor: "pointer",
                }}>
                  💾 Save All ({activeGroupPending})
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {groups[activeGroup]?.map(key => {
                const meta = CONTENT_LABELS[key];
                const val  = editing[key] ?? "";
                const isSaving = saving[key];
                const isSaved  = saved[key];
                const hasChange = val !== (content[key]?.value ?? "");

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
                    {/* Coach section divider */}
                    {COACH_DIVIDERS[key] && (
                      <div style={{
                        background: "#f0f7f0", borderRadius: 8, padding: "8px 14px",
                        marginBottom: 14, borderLeft: `3px solid ${G}`,
                        fontSize: 13, fontWeight: "bold", color: G,
                      }}>
                        {COACH_DIVIDERS[key]}
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

                          {content[key]?.updated_at && (
                            <div style={{ color: "#bbb", fontSize: 10, marginTop: 4 }}>
                              Updated {new Date(content[key].updated_at).toLocaleDateString("en-PH")} by {content[key].updated_by}
                            </div>
                          )}
                        </div>

                        <button onClick={() => handleSave(key)} disabled={isSaving || !hasChange} style={{
                          marginTop: 22, background: isSaved ? "#dcfce7" : hasChange ? G : "#f0f0f0",
                          color: isSaved ? G : hasChange ? "white" : "#aaa",
                          border: "none", borderRadius: 8, padding: "9px 18px",
                          fontSize: 12, fontWeight: "bold",
                          cursor: hasChange ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                          transition: "background 0.2s",
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