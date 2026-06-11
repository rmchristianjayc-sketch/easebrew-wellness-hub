"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const DARK = "#1B201A";
const MID = "#4E504F";
const SIDEBAR_W = 220;

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active, username, onLogout }: { active: string; username: string; onLogout: () => void }) {
  // ✅ No "Codes" — Admin only sees these
  const links = [
    { href: "/admin", icon: "⚡", label: "Dashboard" },
    { href: "/admin/analytics", icon: "📊", label: "Analytics" },
    { href: "/admin/content", icon: "✏️", label: "Content" },
    { href: "/admin/notifications", icon: "🔔", label: "Notifications" },
  ];

  return (
    <aside style={{
      width: SIDEBAR_W, minHeight: "100vh", background: G,
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 100,
      boxShadow: "2px 0 12px rgba(0,0,0,0.12)",
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, background: GOLD, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>☕</div>
          <div>
            <div style={{ color: GOLD, fontWeight: "bold", fontSize: 14, lineHeight: 1.2 }}>EaseBrew</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(l => {
          const isActive = active === l.href;
          return (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                background: isActive ? "rgba(254,210,85,0.15)" : "transparent",
                borderLeft: isActive ? `3px solid ${GOLD}` : "3px solid transparent",
                transition: "all 0.15s", cursor: "pointer",
              }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 17 }}>{l.icon}</span>
                <span style={{ color: isActive ? GOLD : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: isActive ? "bold" : "normal" }}>
                  {l.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, background: "rgba(255,255,255,0.15)",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, flexShrink: 0,
          }}>👤</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "white", fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {username}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Administrator</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: "100%", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
          padding: "8px 12px", fontSize: 12, cursor: "pointer", textAlign: "left",
        }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "20px 22px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: `3px solid ${color}`,
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: MID, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa" }}>{sub}</div>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = localStorage.getItem("eb_admin_role") || "";
    const u = localStorage.getItem("eb_admin_username") || "";
    if (!r) { router.push("/admin/login"); return; }
    if (r === "coach") { router.push("/admin/codes"); return; }
    setUsername(u);
    fetchCodes();
  }, []);

  async function fetchCodes() {
    try {
      const res = await fetch("/api/admin/generate-code?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { }
    setLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    localStorage.removeItem("eb_admin_role");
    localStorage.removeItem("eb_admin_username");
    router.push("/admin/login");
  }

  const now = new Date();
  const used = codes.filter(c => c.is_used);
  const active = used.filter(c => c.expires_at && new Date(c.expires_at) > now);
  const expired = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused = codes.filter(c => !c.is_used);
  const totalRevenue = used.reduce((s, c) => s + (c.tier || 0), 0);
  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const tierEntries = Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0]));
  const maxTierCount = Math.max(...tierEntries.map(([, v]) => v), 1);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin" username={username} onLogout={handleLogout} />

      <main style={{ marginLeft: SIDEBAR_W, flex: 1, padding: "32px 36px", minWidth: 0 }}>

        {/* ✅ Top Bar — no Generate Code button */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: 0 }}>Dashboard</h1>
          <p style={{ color: MID, fontSize: 13, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: MID }}>Loading dashboard...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard icon="✅" label="Active Customers" value={active.length} color={G} />
              <StatCard icon="💰" label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} color="#f59e0b" />
              <StatCard icon="🆕" label="New This Month" value={newThisMonth} color="#3b82f6" />
              <StatCard icon="⏰" label="Expired" value={expired.length} sub={`${unused.length} unused codes`} color="#ef4444" />
            </div>

            {/* Two Column Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Expiring Soon */}
              <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>⚠️ Expiring Soon</h2>
                  {expiringSoon.length > 0 && (
                    <span style={{ background: "#fef3c7", color: "#b45309", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: "bold" }}>
                      {expiringSoon.length} within 7 days
                    </span>
                  )}
                </div>
                {expiringSoon.length === 0 ? (
                  <div style={{ color: MID, fontSize: 13, textAlign: "center", padding: "24px 0" }}>🎉 No expiring customers</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {expiringSoon.map((c, i) => {
                      const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                      return (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "10px 14px", background: d <= 3 ? "#fff1f1" : "#fffbeb",
                          borderRadius: 10, borderLeft: `3px solid ${d <= 3 ? "#ef4444" : "#f59e0b"}`,
                        }}>
                          <div>
                            <div style={{ color: DARK, fontWeight: "bold", fontSize: 13 }}>{c.customer_name || "Customer"}</div>
                            <div style={{ color: MID, fontSize: 11, marginTop: 2 }}>₱{c.tier?.toLocaleString()} · {c.code}</div>
                          </div>
                          <span style={{
                            background: d <= 3 ? "#ef4444" : "#f59e0b",
                            color: "white", borderRadius: 8, padding: "3px 10px",
                            fontSize: 11, fontWeight: "bold",
                          }}>{d}d left</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sales by Package */}
              <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 14px" }}>💰 Sales by Package</h2>
                {tierEntries.length === 0 ? (
                  <div style={{ color: MID, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No sales yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
                    {tierEntries.map(([tier, count]) => {
                      const pct = Math.round((count / maxTierCount) * 100);
                      return (
                        <div key={tier}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: DARK, fontWeight: "bold" }}>₱{Number(tier).toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: MID }}>{count} order{count > 1 ? "s" : ""} · ₱{(Number(tier) * count).toLocaleString()}</span>
                          </div>
                          <div style={{ background: "#f0f0f0", borderRadius: 6, height: 7, overflow: "hidden" }}>
                            <div style={{ background: G, height: "100%", width: `${pct}%`, borderRadius: 6, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Customers Table */}
            <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>👥 Active Customers</h2>
                <Link href="/admin/analytics" style={{ color: G, fontSize: 12, textDecoration: "none", fontWeight: "bold" }}>
                  View all →
                </Link>
              </div>
              {active.length === 0 ? (
                <div style={{ color: MID, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No active customers yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      {["Customer", "Package", "Packs", "Code", "Expires In", "Status"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: MID, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.slice(0, 8).map((c, i) => {
                      const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                      const warn = d <= 7;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f8f8f8" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <td style={{ padding: "10px 12px", fontSize: 13, color: DARK, fontWeight: "bold" }}>{c.customer_name || "—"}</td>
                          <td style={{ padding: "10px 12px", fontSize: 13, color: MID }}>₱{c.tier?.toLocaleString()}</td>
                          <td style={{ padding: "10px 12px", fontSize: 13, color: MID }}>{c.packs}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: G, fontFamily: "monospace", fontWeight: "bold" }}>{c.code}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              background: warn ? "#fef3c7" : "#e8f5e0",
                              color: warn ? "#b45309" : G,
                              borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold",
                            }}>{d}d</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: "#e8f5e0", color: G, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>Active</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {active.length > 8 && (
                <Link href="/admin/analytics" style={{ display: "block", textAlign: "center", color: G, fontSize: 12, textDecoration: "none", padding: "12px 0 2px", fontWeight: "bold" }}>
                  + {active.length - 8} more customers →
                </Link>
              )}
            </div>

            <p style={{ textAlign: "center", color: "#ccc", fontSize: 11, marginTop: 28 }}>
              R&M EaseBrew Wellness Hub © 2025
            </p>
          </>
        )}
      </main>
    </div>
  );
}