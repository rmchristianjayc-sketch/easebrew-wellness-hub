"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/admin/_components/Sidebar";
import type { AccessCode } from "@/lib/supabase";

const G    = "#39613B";
const DARK = "#1B201A";
const MID  = "#4E504F";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: `3px solid ${color}`, display: "flex", flexDirection: "column", gap: 4 }}>
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
  const [codes, setCodes]       = useState<AccessCode[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/codes?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { }
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
      fetchCodes();
    }
    init();
  }, [fetchCodes, router]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const now          = new Date();
  const used         = codes.filter(c => c.is_used);
  const active       = used.filter((c): c is AccessCode & { expires_at: string } => Boolean(c.expires_at && new Date(c.expires_at) > now));
  const expired      = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused       = codes.filter(c => !c.is_used);
  const totalRevenue = used.reduce((s, c) => s + (c.tier || 0), 0);
  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const tierEntries  = Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0]));
  const maxTierCount = Math.max(...tierEntries.map(([, v]) => v), 1);

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin" username={username} onLogout={handleLogout} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard icon="✅" label="Active Customers" value={active.length}                        color={G}        />
              <StatCard icon="💰" label="Total Revenue"    value={`₱${totalRevenue.toLocaleString()}`} color="#f59e0b"  />
              <StatCard icon="🆕" label="New This Month"   value={newThisMonth}                        color="#3b82f6"  />
              <StatCard icon="⏰" label="Expired"          value={expired.length} sub={`${unused.length} unused codes`} color="#ef4444" />
            </div>

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
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: d <= 3 ? "#fff1f1" : "#fffbeb", borderRadius: 10, borderLeft: `3px solid ${d <= 3 ? "#ef4444" : "#f59e0b"}` }}>
                          <div>
                            <div style={{ color: DARK, fontWeight: "bold", fontSize: 13 }}>{c.customer_name || "Customer"}</div>
                            <div style={{ color: MID, fontSize: 11, marginTop: 2 }}>₱{c.tier?.toLocaleString()} · {c.code}</div>
                          </div>
                          <span style={{ background: d <= 3 ? "#ef4444" : "#f59e0b", color: "white", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>{d}d left</span>
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
                <Link href="/admin/analytics" style={{ color: G, fontSize: 12, textDecoration: "none", fontWeight: "bold" }}>View all →</Link>
              </div>
              {active.length === 0 ? (
                <div style={{ color: MID, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No active customers yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      {["Customer", "Package", "Packs", "Code", "Expires In", "Status"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: MID, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.slice(0, 8).map((c, i) => {
                      const d    = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
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
                            <span style={{ background: warn ? "#fef3c7" : "#e8f5e0", color: warn ? "#b45309" : G, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>{d}d</span>
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
