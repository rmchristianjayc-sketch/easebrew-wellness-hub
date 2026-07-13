"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard, clearAdminAuthCache } from "@/lib/useAdminGuard";
import { getCoachLabel } from "@/lib/coachLabel";
import type { AccessCode } from "@/lib/supabase";
import {
  Users, TrendingUp, Clock,
  AlertTriangle, Package, ArrowUpRight,
  CalendarDays,
} from "lucide-react";

function PesoIcon({ size = 21, color = "#fff", strokeWidth = 2, style }: { size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="700" fill={color} stroke="none" fontFamily="Arial, sans-serif">₱</text>
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  bg: string;
}) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 16,
      padding: "22px 24px",
      border: "1px solid #e8ece9",
      boxShadow: "0 1px 3px rgba(20,35,25,0.04)",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(20,35,25,0.04)";
      }}
    >
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: bg, opacity: 0.08,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: bg,
          display: "grid", placeItems: "center",
        }}>
          <Icon size={21} color="#fff" strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#1B201A", lineHeight: 1, marginBottom: 6, fontFamily: "var(--admin-font)", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "#6b7a70", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.8px", fontFamily: "var(--admin-font)" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#a3b0a8", marginTop: 6, fontFamily: "var(--admin-font)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, icon: Icon, action, children, noPad }: {
  title: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #e8ece9",
      boxShadow: "0 1px 3px rgba(20,35,25,0.04)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 22px",
        borderBottom: "1px solid #f0f2f1",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <Icon size={15} color="#39613B" strokeWidth={2.2} />}
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1B201A", margin: 0, fontFamily: "var(--admin-font)", letterSpacing: "0.2px" }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div style={noPad ? {} : { padding: "18px 22px" }}>
        {children}
      </div>
    </div>
  );
}

function AtensyonPanel({
  expiringSoon, unused,
}: {
  expiringSoon: (AccessCode & { expires_at: string })[];
  unused: AccessCode[];
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const now = new Date();
  const critical = expiringSoon.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 3;
  });
  const soon = expiringSoon.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d > 3 && d <= 7;
  });
  const staleUnused = unused.filter(c => {
    if (!c.created_at) return false;
    const days = Math.floor((now.getTime() - new Date(c.created_at).getTime()) / 86400000);
    return days >= 3;
  });
  const totalAtensyon = critical.length + soon.length + staleUnused.length;

  function copyReorderMessage(c: AccessCode) {
    if (!c.expires_at) return;
    const daysLeft = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    const expiresDate = new Date(c.expires_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
    const msg = `Hi ${c.customer_name || ""}! Your EaseBrew access will expire on ${expiresDate} (${daysLeft} days left). Please order a new package to keep your wellness journey going. Thank you!`;
    navigator.clipboard.writeText(msg).then(() => { setCopiedCode(c.code); setTimeout(() => setCopiedCode(null), 2500); }).catch(() => {});
  }

  type Section = {
    key: string;
    label: string;
    icon: string;
    color: string;
    items: AccessCode[];
    action: (c: AccessCode) => React.ReactNode;
  };

  const sections: Section[] = [
    {
      key: "critical", label: "Expiring in 3 days", icon: "🚨",
      color: "#991b1b",
      items: critical,
      action: (c) => (
        <button onClick={() => copyReorderMessage(c)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--admin-font)" }}>
          {copiedCode === c.code ? "Copied ✓" : "Copy message"}
        </button>
      ),
    },
    {
      key: "soon", label: "Expiring in 4-7 days", icon: "⚠️",
      color: "#92400e",
      items: soon,
      action: (c) => (
        <button onClick={() => copyReorderMessage(c)} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--admin-font)" }}>
          {copiedCode === c.code ? "Copied ✓" : "Copy message"}
        </button>
      ),
    },
    {
      key: "stale", label: "Codes not yet verified (3+ days)", icon: "💤",
      color: "#3730a3",
      items: staleUnused.slice(0, 20),
      action: () => (
        <Link href="/admin/codes" style={{ background: "#6366f1", color: "#fff", borderRadius: 6, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, textDecoration: "none", fontFamily: "var(--admin-font)" }}>
          Follow up
        </Link>
      ),
    },
  ];

  const activeSections = sections.filter(s => s.items.length > 0);

  const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e8ece9", fontSize: 13, fontFamily: "var(--admin-font)" };

  return (
    <div style={{
      background: totalAtensyon === 0 ? "#f0fdf4" : "#fff",
      border: `1.5px solid ${totalAtensyon === 0 ? "#bbf7d0" : "#fcd34d"}`,
      borderRadius: 16, padding: "18px 22px", marginBottom: 22,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: totalAtensyon === 0 ? 0 : 16 }}>
        <span style={{ fontSize: 18 }}>{totalAtensyon === 0 ? "✅" : "🔔"}</span>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#1B201A", margin: 0, fontFamily: "var(--admin-font)", textTransform: "uppercase" as const, letterSpacing: 0.4 }}>
          Needs attention
        </h2>
        <span style={{ fontSize: 12, color: totalAtensyon === 0 ? "#166534" : "#92400e", fontWeight: 600, marginLeft: "auto", fontFamily: "var(--admin-font)" }}>
          {totalAtensyon === 0 ? "All clear — good work!" : `${totalAtensyon} item${totalAtensyon > 1 ? "s" : ""}`}
        </span>
      </div>

      {activeSections.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(activeSections.length, 3)}, 1fr)`, gap: 16 }}>
          {activeSections.map(s => (
            <div key={s.key}>
              <p style={{ fontSize: 11, fontWeight: 700, color: s.color, margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: 0.5, fontFamily: "var(--admin-font)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{s.icon}</span> {s.label} ({s.items.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                {s.items.map(c => (
                  <div key={c.code} style={rowStyle}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 10, fontWeight: 500 }}>{c.customer_name || c.code}</span>
                    {s.action(c)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { checking, username, role } = useAdminGuard(["owner"]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/codes?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
      else setFetchError(true);
    } catch { setFetchError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { if (!checking) fetchCodes(); }, [checking, fetchCodes]);

  useEffect(() => {
    if (!checking) {
      const label = role === "coach" ? getCoachLabel() : null;
      setDisplayName(label || username || "Admin");
    }
  }, [checking, username, role]);

  async function handleLogout() {
    clearAdminAuthCache();
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const now = new Date();
  const used = codes.filter(c => c.is_used);
  const active = used.filter((c): c is AccessCode & { expires_at: string } =>
    Boolean(c.expires_at && new Date(c.expires_at) > now));
  const expired = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused = codes.filter(c => !c.is_used);
  const totalRevenue = used.reduce((s, c) => s + (c.tier || 0), 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;
  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const tierEntries = Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0]));
  const maxTierCount = Math.max(...tierEntries.map(([, v]) => v), 1);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin" username={username} role={role} onLogout={handleLogout} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        {/* ── Welcome bar ── */}
        <div style={{
          background: "linear-gradient(135deg, #0a1f14 0%, #163526 40%, #1e4d2e 70%, #2a6838 100%)",
          borderRadius: 18,
          padding: "28px 32px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 40px rgba(10,31,20,0.35)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -20,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(254,210,85,0.06)",
          }} />
          <div style={{
            position: "absolute", bottom: -60, right: 80,
            width: 140, height: 140, borderRadius: "50%",
            background: "rgba(57,97,59,0.15)",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{
              color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 5px",
              fontFamily: "var(--admin-font)", letterSpacing: "-0.3px",
            }}>
              {greeting}, {displayName} 👋
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0,
              fontFamily: "var(--admin-font)", display: "flex", alignItems: "center", gap: 6,
            }}>
              <CalendarDays size={13} style={{ opacity: 0.7 }} />
              {now.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", gap: 10,
          }}>
            <Link href="/admin/codes" style={{
              background: "rgba(254,210,85,0.15)", border: "1px solid rgba(254,210,85,0.25)",
              borderRadius: 12, padding: "10px 18px",
              color: "#FED255", fontSize: 12.5, fontWeight: 700,
              fontFamily: "var(--admin-font)", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}>
              <Package size={15} strokeWidth={2} />
              Generate Code
            </Link>
          </div>
        </div>

        {/* ── Error ── */}
        {fetchError && (
          <div style={{
            background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12,
            padding: "14px 18px", marginBottom: 24, color: "#9f1239", fontSize: 13,
            display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--admin-font)",
          }}>
            <AlertTriangle size={16} />
            Could not load data. Please refresh the page.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* ── Kailangan ng Atensyon (priority triage) ── */}
            <AtensyonPanel expiringSoon={expiringSoon} unused={unused} />

            {/* ── Stat cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
              <StatCard icon={Users}           label="Active Customers" value={active.length}                        bg="#39613B" />
              <StatCard icon={PesoIcon} label="Total Revenue"    value={`₱${totalRevenue.toLocaleString()}`}  bg="#d97706" />
              <StatCard icon={TrendingUp}      label="New This Month"   value={newThisMonth}                         bg="#2563eb" />
              <StatCard icon={Clock}           label="Expired"          value={expired.length} sub={`${unused.length} unused codes`} bg="#dc2626" />
            </div>

            {/* ── Two column ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
              {/* Expiring soon */}
              <SectionCard
                title="Expiring Soon"
                icon={AlertTriangle}
                action={
                  expiringSoon.length > 0 ? (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#92400e",
                      background: "#fef3c7", padding: "3px 10px", borderRadius: 20,
                      fontFamily: "var(--admin-font)",
                    }}>
                      {expiringSoon.length} within 7 days
                    </span>
                  ) : undefined
                }
              >
                {expiringSoon.length === 0 ? (
                  <div style={{
                    color: "#a3b0a8", fontSize: 13, textAlign: "center",
                    padding: "32px 0", fontFamily: "var(--admin-font)",
                  }}>
                    <Clock size={28} color="#d4ddd8" strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                    No expiring customers
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {expiringSoon.map((c, i) => {
                      const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                      const warn = d <= 3;
                      return (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "11px 14px", borderRadius: 12,
                          background: warn ? "#fef2f2" : "#fffbeb",
                          border: `1px solid ${warn ? "#fecaca" : "#fde68a"}`,
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1B201A", fontFamily: "var(--admin-font)" }}>
                              {c.customer_name || "Customer"}
                            </div>
                            <div style={{ fontSize: 11, color: "#8b9690", marginTop: 3, fontFamily: "var(--admin-font)" }}>
                              ₱{c.tier?.toLocaleString()} · <span style={{ fontFamily: "monospace" }}>{c.code}</span>
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: warn ? "#dc2626" : "#d97706",
                            background: warn ? "#fee2e2" : "#fef9c3",
                            padding: "4px 10px", borderRadius: 20,
                            fontFamily: "var(--admin-font)",
                          }}>
                            {d}d left
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Sales by package */}
              <SectionCard title="Sales by Package" icon={PesoIcon}>
                {tierEntries.length === 0 ? (
                  <div style={{
                    color: "#a3b0a8", fontSize: 13, textAlign: "center",
                    padding: "32px 0", fontFamily: "var(--admin-font)",
                  }}>
                    <PesoIcon size={28} color="#d4ddd8" strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                    No sales yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 280, overflowY: "auto" }}>
                    {tierEntries.map(([tier, count]) => {
                      const pct = Math.round((count / maxTierCount) * 100);
                      return (
                        <div key={tier}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "#1B201A", fontWeight: 700, fontFamily: "var(--admin-font)" }}>
                              ₱{Number(tier).toLocaleString()}
                            </span>
                            <span style={{ fontSize: 12, color: "#8b9690", fontFamily: "var(--admin-font)" }}>
                              {count}× · <span style={{ color: "#39613B", fontWeight: 700 }}>₱{(Number(tier) * count).toLocaleString()}</span>
                            </span>
                          </div>
                          <div style={{ background: "#f0f4f1", borderRadius: 6, height: 8, overflow: "hidden" }}>
                            <div style={{
                              background: "linear-gradient(90deg, #39613B, #4a8a4e)",
                              height: "100%", width: `${pct}%`, borderRadius: 6,
                              transition: "width 0.6s ease",
                            }} />
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
              icon={Users}
              noPad
              action={
                <Link href="/admin/codes" style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 600, color: "#39613B",
                  textDecoration: "none", fontFamily: "var(--admin-font)",
                  padding: "5px 12px", borderRadius: 8,
                  background: "#f0f7f1", border: "1px solid #dde9df",
                  transition: "background 0.15s",
                }}>
                  View all <ArrowUpRight size={13} />
                </Link>
              }
            >
              {active.length === 0 ? (
                <div style={{
                  color: "#a3b0a8", fontSize: 13, textAlign: "center",
                  padding: "40px 0", fontFamily: "var(--admin-font)",
                }}>
                  <Users size={28} color="#d4ddd8" strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                  No active customers yet.
                </div>
              ) : (
                <>
                  <div className="a-table-wrap" style={{ border: "none", borderRadius: 0, margin: 0 }}>
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
                          const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                          const warn = d <= 7;
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 700, color: "#1B201A" }}>{c.customer_name || "—"}</td>
                              <td>₱{c.tier?.toLocaleString()}</td>
                              <td>{c.packs}</td>
                              <td style={{ fontFamily: "monospace", fontSize: 12, color: "#39613B", fontWeight: 600 }}>{c.code}</td>
                              <td>
                                <span style={{
                                  fontSize: 11, fontWeight: 700,
                                  color: warn ? "#d97706" : "#16a34a",
                                  background: warn ? "#fef9c3" : "#dcfce7",
                                  padding: "3px 10px", borderRadius: 20,
                                  fontFamily: "var(--admin-font)",
                                }}>
                                  {d}d
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: 11, fontWeight: 700, color: "#16a34a",
                                  background: "#dcfce7", padding: "3px 10px", borderRadius: 20,
                                  fontFamily: "var(--admin-font)",
                                }}>
                                  Active
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {active.length > 8 && (
                    <Link href="/admin/codes" style={{
                      display: "block", textAlign: "center", color: "#39613B",
                      fontSize: 12.5, textDecoration: "none", padding: "14px 0",
                      fontWeight: 700, fontFamily: "var(--admin-font)",
                      borderTop: "1px solid #f0f2f1",
                    }}>
                      + {active.length - 8} more customers →
                    </Link>
                  )}
                </>
              )}
            </SectionCard>

            <p style={{
              textAlign: "center", color: "#c8d0cc", fontSize: 11,
              marginTop: 32, fontFamily: "var(--admin-font)",
            }}>
              R&amp;M EaseBrew Wellness Hub · Operations Console
            </p>
          </>
        )}
      </main>
    </div>
  );
}
