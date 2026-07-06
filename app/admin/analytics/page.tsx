"use client";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type { AccessCode } from "@/lib/supabase";
import {
  BarChart3, CheckCircle2, Clock, Package, Trophy, Users,
  TrendingUp, AlertTriangle, CalendarDays,
} from "lucide-react";

function PesoIcon({ size = 21, color = "#fff", style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="700" fill={color} stroke="none" fontFamily="Arial, sans-serif">₱</text>
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sub, bg }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; bg: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "22px 24px",
      border: "1px solid #e8ece9", boxShadow: "0 1px 3px rgba(20,35,25,0.04)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(20,35,25,0.04)"; }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: bg, opacity: 0.08 }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "grid", placeItems: "center", marginBottom: 18 }}>
        <Icon size={21} color="#fff" strokeWidth={2} />
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#1B201A", lineHeight: 1, marginBottom: 6, fontFamily: "var(--admin-font)", letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#6b7a70", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.8px", fontFamily: "var(--admin-font)" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#a3b0a8", marginTop: 6, fontFamily: "var(--admin-font)" }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, noPad }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; noPad?: boolean;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8ece9", boxShadow: "0 1px 3px rgba(20,35,25,0.04)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 22px", borderBottom: "1px solid #f0f2f1" }}>
        {Icon && <Icon size={15} color="#39613B" strokeWidth={2.2} />}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1B201A", margin: 0, fontFamily: "var(--admin-font)", letterSpacing: "0.2px" }}>{title}</h2>
      </div>
      <div style={noPad ? {} : { padding: "18px 22px" }}>{children}</div>
    </div>
  );
}

function RevenueChart({ months }: { months: { label: string; revenue: number }[] }) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const W = 560, H = 200, PAD_L = 52, PAD_R = 20, PAD_T = 20, PAD_B = 36;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxRev = Math.max(...months.map(m => m.revenue), 1);
  const barW = (chartW / months.length) * 0.55;
  const gap = chartW / months.length;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    val: Math.round(maxRev * t),
    y: PAD_T + chartH - chartH * t,
  }));

  const pts = months.map((m, i) => ({
    x: PAD_L + gap * i + gap / 2,
    y: PAD_T + chartH - (m.revenue / maxRev) * chartH,
    revenue: m.revenue,
    label: m.label,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD_T + chartH} L${pts[0].x},${PAD_T + chartH} Z`;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39613B" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#39613B" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y} stroke="#eaeeec" strokeWidth="1" strokeDasharray={i > 0 ? "4,3" : "0"} />
              <text x={PAD_L - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#9ca8a3" fontFamily="Inter,sans-serif">
                {t.val >= 1000 ? `₱${(t.val / 1000).toFixed(0)}k` : `₱${t.val}`}
              </text>
            </g>
          ))}
          {pts.map((p, i) => {
            const bH = (months[i].revenue / maxRev) * chartH;
            const bX = p.x - barW / 2;
            const bY = PAD_T + chartH - bH;
            const isH = hovered === i;
            return (
              <rect key={i} x={bX} y={bY} width={barW} height={Math.max(bH, 0)}
                rx="4" fill={isH ? "#2a5c34" : "#39613B"} opacity={isH ? 1 : 0.7}
                style={{ transition: "opacity 0.15s, fill 0.15s", cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#39613B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hovered === i ? 6 : 4}
              fill={hovered === i ? "#2a5c34" : "#fff"} stroke="#39613B" strokeWidth="2.5"
              style={{ cursor: "pointer", transition: "r 0.15s" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            />
          ))}
          {hovered !== null && (() => {
            const p = pts[hovered];
            const tw = 80, th = 34;
            const tx = Math.min(Math.max(p.x - tw / 2, PAD_L), W - PAD_R - tw);
            const ty = p.y - th - 10;
            return (
              <g>
                <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="#1B201A" />
                <text x={tx + tw / 2} y={ty + 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="Inter,sans-serif">{p.label}</text>
                <text x={tx + tw / 2} y={ty + 25} textAnchor="middle" fontSize="11" fill="#FED255" fontWeight="700" fontFamily="Inter,sans-serif">₱{p.revenue.toLocaleString()}</text>
              </g>
            );
          })()}
          {pts.map((p, i) => (
            <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill={hovered === i ? "#39613B" : "#9ca8a3"} fontWeight={hovered === i ? "700" : "400"} fontFamily="Inter,sans-serif">
              {p.label}
            </text>
          ))}
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        {[
          { label: "Total (6 mo)", value: `₱${months.reduce((s, m) => s + m.revenue, 0).toLocaleString()}`, color: "#39613B", bg: "#f0f7f1" },
          { label: "Best Month", value: (() => { const best = months.reduce((a, b) => b.revenue > a.revenue ? b : a, months[0]); return `${best.label} — ₱${best.revenue.toLocaleString()}`; })(), color: "#d97706", bg: "#fffbeb" },
          { label: "This Month", value: `₱${months[months.length - 1].revenue.toLocaleString()}`, color: "#2563eb", bg: "#eff6ff" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: "#8b9690", fontWeight: 700, fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color, fontFamily: "var(--admin-font)" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { checking, username, role } = useAdminGuard(["owner"]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/codes?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (!checking) fetchData(); }, [checking, fetchData]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const used = codes.filter(c => c.is_used);
  const active = used.filter((c): c is AccessCode & { expires_at: string } => Boolean(c.expires_at && new Date(c.expires_at) > now));
  const expired = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused = codes.filter(c => !c.is_used);

  const todayNew = used.filter(c => c.used_at && new Date(c.used_at) >= todayStart).length;
  const weekNew = used.filter(c => c.used_at && new Date(c.used_at) >= weekStart).length;
  const monthNew = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const maxTierCount = Math.max(...Object.values(revenueByTier), 1);

  const byCoach: Record<string, number> = {};
  codes.forEach(c => {
    const match = c.notes?.match(/^\[([^\]]+)\]/);
    const name = match ? match[1] : (c.created_by || "Unknown");
    byCoach[name] = (byCoach[name] || 0) + 1;
  });
  const topCoaches = Object.entries(byCoach).sort((a, b) => b[1] - a[1]);

  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });

  const months: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
    const revenue = used
      .filter(c => { if (!c.used_at) return false; const u = new Date(c.used_at); return u.getFullYear() === d.getFullYear() && u.getMonth() === d.getMonth(); })
      .reduce((s, c) => s + (c.tier || 0), 0);
    months.push({ label, revenue });
  }

  const totalRevenue = used.reduce((s, c) => s + (c.tier || 0), 0);

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/analytics" username={username} role={role} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #0a1f14 0%, #163526 40%, #1e4d2e 70%, #2a6838 100%)",
          borderRadius: 18, padding: "28px 32px", marginBottom: 28,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 40px rgba(10,31,20,0.35)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(254,210,85,0.06)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 5px", fontFamily: "var(--admin-font)", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 10 }}>
              <BarChart3 size={22} strokeWidth={2.2} />
              Analytics
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0, fontFamily: "var(--admin-font)", display: "flex", alignItems: "center", gap: 6 }}>
              <CalendarDays size={13} style={{ opacity: 0.7 }} />
              {now.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "rgba(254,210,85,0.12)", border: "1px solid rgba(254,210,85,0.2)", borderRadius: 12, padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(254,210,85,0.7)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "var(--admin-font)", marginBottom: 2 }}>Revenue</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#FED255", fontFamily: "var(--admin-font)" }}>₱{totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>Loading analytics...</div>
        ) : (
          <>
            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
              <StatCard icon={Package}      label="Total Codes"  value={codes.length}  bg="#6366f1" />
              <StatCard icon={CheckCircle2} label="Active Users" value={active.length} bg="#39613B" />
              <StatCard icon={Clock}        label="Expired"      value={expired.length} bg="#dc2626" />
              <StatCard icon={Users}        label="Unused Codes" value={unused.length} bg="#d97706" />
            </div>

            {/* ── New activations ── */}
            <SectionCard title="New Activations" icon={TrendingUp}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                  { label: "Today", value: todayNew, bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
                  { label: "This Week", value: weekNew, bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
                  { label: "This Month", value: monthNew, bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg, borderRadius: 14, padding: "22px 20px",
                    textAlign: "center", border: `1px solid ${s.border}`,
                  }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: s.text, lineHeight: 1, fontFamily: "var(--admin-font)" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#6b7a70", marginTop: 8, fontWeight: 600, fontFamily: "var(--admin-font)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div style={{ height: 22 }} />

            {/* ── Two column ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
              <SectionCard title="Sales by Package" icon={PesoIcon}>
                {Object.entries(revenueByTier).length === 0 ? (
                  <div style={{ color: "#a3b0a8", fontSize: 13, textAlign: "center", padding: "32px 0", fontFamily: "var(--admin-font)" }}>
                    <PesoIcon size={28} color="#d4ddd8" style={{ display: "block", margin: "0 auto 10px" }} />
                    No sales yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0])).map(([tier, count]) => {
                      const pct = Math.round((count / maxTierCount) * 100);
                      return (
                        <div key={tier}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "#1B201A", fontWeight: 700, fontFamily: "var(--admin-font)" }}>₱{Number(tier).toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: "#8b9690", fontFamily: "var(--admin-font)" }}>
                              {count}× · <span style={{ color: "#39613B", fontWeight: 700 }}>₱{(Number(tier) * count).toLocaleString()}</span>
                            </span>
                          </div>
                          <div style={{ background: "#f0f4f1", borderRadius: 6, height: 8, overflow: "hidden" }}>
                            <div style={{ background: "linear-gradient(90deg, #39613B, #4a8a4e)", height: "100%", width: `${pct}%`, borderRadius: 6, transition: "width 0.6s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Top Code Generators" icon={Trophy}>
                {topCoaches.length === 0 ? (
                  <div style={{ color: "#a3b0a8", fontSize: 13, textAlign: "center", padding: "32px 0", fontFamily: "var(--admin-font)" }}>
                    <Trophy size={28} color="#d4ddd8" strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                    No data yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {topCoaches.map(([coach, count], i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", borderRadius: 12,
                        background: i === 0 ? "#fffbeb" : "transparent",
                        border: i === 0 ? "1px solid #fde68a" : "1px solid transparent",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: i === 0 ? "#fde68a" : i === 1 ? "#e5e7eb" : i === 2 ? "#fed7aa" : "#f0f4f1",
                            display: "grid", placeItems: "center",
                          }}>
                            {i === 0 ? (
                              <Trophy size={14} color="#a16207" strokeWidth={2.5} />
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 800, color: "#8b9690", fontFamily: "var(--admin-font)" }}>{i + 1}</span>
                            )}
                          </div>
                          <span style={{ color: "#1B201A", fontWeight: i === 0 ? 700 : 500, fontSize: 13.5, fontFamily: "var(--admin-font)" }}>{coach}</span>
                        </div>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                          background: i === 0 ? "#fef9c3" : "#dcfce7",
                          color: i === 0 ? "#854d0e" : "#166534",
                          fontFamily: "var(--admin-font)",
                        }}>
                          {count} code{count > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* ── Revenue chart ── */}
            <SectionCard title="Monthly Revenue — Last 6 Months" icon={BarChart3}>
              <RevenueChart months={months} />
            </SectionCard>

            <div style={{ height: 22 }} />

            {/* ── Expiring soon ── */}
            {expiringSoon.length > 0 && (
              <SectionCard
                title={`Expiring Soon — ${expiringSoon.length} within 7 days`}
                icon={AlertTriangle}
                noPad
              >
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--admin-font)" }}>
                    <thead>
                      <tr>
                        {["Code", "Customer", "Package", "Days Left"].map(h => (
                          <th key={h} style={{
                            padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700,
                            color: "#6b7a70", textTransform: "uppercase", letterSpacing: "0.5px",
                            borderBottom: "1px solid #f0f2f1", background: "#fafbfa",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expiringSoon.map((c, i) => {
                        const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                        return (
                          <tr key={i}>
                            <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 12, color: "#39613B", fontWeight: 700, borderBottom: "1px solid #f5f6f5" }}>{c.code}</td>
                            <td style={{ padding: "12px 18px", fontWeight: 700, fontSize: 13, borderBottom: "1px solid #f5f6f5", color: "#1B201A" }}>{c.customer_name || "—"}</td>
                            <td style={{ padding: "12px 18px", fontSize: 13, borderBottom: "1px solid #f5f6f5" }}>₱{c.tier?.toLocaleString()}</td>
                            <td style={{ padding: "12px 18px", borderBottom: "1px solid #f5f6f5" }}>
                              <span style={{
                                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                background: d <= 3 ? "#fee2e2" : "#fef9c3",
                                color: d <= 3 ? "#dc2626" : "#b45309",
                                fontFamily: "var(--admin-font)",
                              }}>{d}d left</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            <p style={{ textAlign: "center", color: "#c8d0cc", fontSize: 11, marginTop: 32, fontFamily: "var(--admin-font)" }}>
              R&amp;M EaseBrew Wellness Hub · Operations Console
            </p>
          </>
        )}
      </main>
    </div>
  );
}
