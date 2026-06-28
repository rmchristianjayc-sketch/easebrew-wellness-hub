"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard, clearAdminAuthCache } from "@/lib/useAdminGuard";
import type { AccessCode } from "@/lib/supabase";
import {
  Users, TrendingUp, BadgeDollarSign, Clock,
  AlertTriangle, ChevronRight, Package,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 10,
      padding: "20px 22px",
      border: "1px solid #dde4df",
      boxShadow: "0 1px 3px rgba(20,35,25,0.05), 0 4px 16px rgba(20,35,25,0.06)",
      borderTop: `3px solid ${accent}`,
      position: "relative",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(20,35,25,0.05), 0 4px 16px rgba(20,35,25,0.06)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: "grid", placeItems: "center",
        }}>
          <Icon size={20} color={accent} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#1B201A", lineHeight: 1, marginBottom: 5, fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#4E504F", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.7px", fontFamily: "Inter, system-ui, sans-serif" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#b0bdb6", marginTop: 5, fontFamily: "Inter, system-ui, sans-serif" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #dde4df", boxShadow: "0 1px 3px rgba(20,35,25,0.05)", padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--admin-border, #eaeeec)" }}>
        <h2 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", margin: 0, fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { checking, username, role } = useAdminGuard(["owner"]);
  const [codes,      setCodes]     = useState<AccessCode[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchCodes = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/codes?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
      else setFetchError(true);
    } catch { setFetchError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { if (!checking) fetchCodes(); }, [checking, fetchCodes]);

  async function handleLogout() {
    clearAdminAuthCache();
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const now          = new Date();
  const used         = codes.filter(c => c.is_used);
  const active       = used.filter((c): c is AccessCode & { expires_at: string } =>
    Boolean(c.expires_at && new Date(c.expires_at) > now));
  const expired      = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused       = codes.filter(c => !c.is_used);
  const totalRevenue = used.reduce((s, c) => s + (c.tier || 0), 0);
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;
  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const tierEntries  = Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0]));
  const maxTierCount = Math.max(...tierEntries.map(([, v]) => v), 1);

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin" username={username} role={role} onLogout={handleLogout} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        {/* ── Welcome bar ── */}
        <div style={{
          background: "linear-gradient(135deg, #0f2518 0%, #183b28 45%, #2a5c34 100%)",
          borderRadius: 14,
          padding: "22px 28px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(15,37,24,0.28)",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "#FED255", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: 6, fontFamily: "Inter, system-ui, sans-serif", opacity: 0.85 }}>
              ☕ R&amp;M Digital Trading
            </div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "-0.3px" }}>
              Good day, {username || "Admin"} 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, margin: 0, fontFamily: "Inter, system-ui, sans-serif" }}>
              {now.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "rgba(254,210,85,0.15)",
            border: "1px solid rgba(254,210,85,0.25)",
            display: "grid", placeItems: "center",
          }}>
            <Package size={24} color="#FED255" strokeWidth={1.8} />
          </div>
        </div>

        {/* ── Error ── */}
        {fetchError && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#9f1239", fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--admin-font)" }}>
            <AlertTriangle size={16} />
            Hindi ma-load ang data. I-refresh ang page.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard icon={Users}           label="Active Customers" value={active.length}                          accent="#39613B" />
              <StatCard icon={BadgeDollarSign} label="Total Revenue"    value={`₱${totalRevenue.toLocaleString()}`}  accent="#f59e0b" />
              <StatCard icon={TrendingUp}      label="New This Month"   value={newThisMonth}                          accent="#3b82f6" />
              <StatCard icon={Clock}           label="Expired"          value={expired.length} sub={`${unused.length} unused codes`} accent="#ef4444" />
            </div>

            {/* ── Two column ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Expiring soon */}
              <SectionCard
                title="Expiring Soon"
                action={
                  expiringSoon.length > 0 ? (
                    <span className="a-badge a-badge-yellow">{expiringSoon.length} within 7 days</span>
                  ) : undefined
                }
              >
                {expiringSoon.length === 0 ? (
                  <div style={{ color: "var(--ink-mid)", fontSize: 13, textAlign: "center", padding: "24px 0", fontFamily: "var(--admin-font)" }}>
                    No expiring customers
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 280, overflowY: "auto" }}>
                    {expiringSoon.map((c, i) => {
                      const d    = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                      const warn = d <= 3;
                      return (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "9px 12px", borderRadius: 8,
                          background: warn ? "#fff1f2" : "#fffbeb",
                          borderLeft: `3px solid ${warn ? "#ef4444" : "#f59e0b"}`,
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--admin-font)" }}>{c.customer_name || "Customer"}</div>
                            <div style={{ fontSize: 11, color: "var(--ink-mid)", marginTop: 2, fontFamily: "var(--admin-font)" }}>₱{c.tier?.toLocaleString()} · {c.code}</div>
                          </div>
                          <span className={`a-badge ${warn ? "a-badge-red" : "a-badge-yellow"}`}>{d}d left</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Sales by package */}
              <SectionCard title="Sales by Package">
                {tierEntries.length === 0 ? (
                  <div style={{ color: "var(--ink-mid)", fontSize: 13, textAlign: "center", padding: "24px 0", fontFamily: "var(--admin-font)" }}>
                    No sales yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 280, overflowY: "auto" }}>
                    {tierEntries.map(([tier, count]) => {
                      const pct = Math.round((count / maxTierCount) * 100);
                      return (
                        <div key={tier}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600, fontFamily: "var(--admin-font)" }}>₱{Number(tier).toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: "var(--ink-mid)", fontFamily: "var(--admin-font)" }}>{count}× · ₱{(Number(tier) * count).toLocaleString()}</span>
                          </div>
                          <div style={{ background: "#f0f2f0", borderRadius: 4, height: 6, overflow: "hidden" }}>
                            <div style={{ background: "var(--green)", height: "100%", width: `${pct}%`, borderRadius: 4, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* ── Active customers table ── */}
            <SectionCard
              title="Active Customers"
              action={
                <Link href="/admin/analytics" className="a-btn a-btn-ghost a-btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  View all <ChevronRight size={13} />
                </Link>
              }
            >
              {active.length === 0 ? (
                <div style={{ color: "var(--ink-mid)", fontSize: 13, textAlign: "center", padding: "24px 0", fontFamily: "var(--admin-font)" }}>
                  No active customers yet.
                </div>
              ) : (
                <div className="a-table-wrap" style={{ border: "none", borderRadius: 0, margin: "0 -22px -20px" }}>
                  <table className="a-table">
                    <thead>
                      <tr>
                        {["Customer", "Package", "Packs", "Code", "Expires In", "Status"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {active.slice(0, 8).map((c, i) => {
                        const d    = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                        const warn = d <= 7;
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{c.customer_name || "—"}</td>
                            <td>₱{c.tier?.toLocaleString()}</td>
                            <td>{c.packs}</td>
                            <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{c.code}</td>
                            <td>
                              <span className={`a-badge ${warn ? "a-badge-yellow" : "a-badge-green"}`}>{d}d</span>
                            </td>
                            <td>
                              <span className="a-badge a-badge-green">Active</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {active.length > 8 && (
                <Link href="/admin/analytics" style={{ display: "block", textAlign: "center", color: "var(--green)", fontSize: 12.5, textDecoration: "none", paddingTop: 14, fontWeight: 600, fontFamily: "var(--admin-font)" }}>
                  + {active.length - 8} more customers →
                </Link>
              )}
            </SectionCard>

            <p style={{ textAlign: "center", color: "#c0c8c4", fontSize: 11, marginTop: 28, fontFamily: "var(--admin-font)" }}>
              R&amp;M EaseBrew Wellness Hub
            </p>
          </>
        )}
      </main>
    </div>
  );
}
