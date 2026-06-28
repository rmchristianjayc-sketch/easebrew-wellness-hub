"use client";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type { AccessCode } from "@/lib/supabase";
import {
  BarChart3, CheckCircle2, Clock, Package, Trophy, Users,
} from "lucide-react";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent: string }) {
  return (
    <div className="a-stat" style={{ borderTop: `3px solid ${accent}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${accent}1a`, display: "grid", placeItems: "center", marginBottom: 14 }}>
        <Icon size={17} color={accent} strokeWidth={2} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", lineHeight: 1, marginBottom: 4, fontFamily: "var(--admin-font)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-mid)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: "var(--admin-font)" }}>{label}</div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="a-card" style={{ padding: "20px 22px" }}>
      <h2 className="a-section-title" style={{ marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart({ months }: { months: { label: string; revenue: number }[] }) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const W = 560, H = 200, PAD_L = 52, PAD_R = 20, PAD_T = 20, PAD_B = 36;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxRev = Math.max(...months.map(m => m.revenue), 1);
  const barW   = (chartW / months.length) * 0.55;
  const gap    = chartW / months.length;

  // y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    val: Math.round(maxRev * t),
    y:   PAD_T + chartH - chartH * t,
  }));

  // line path points
  const pts = months.map((m, i) => ({
    x: PAD_L + gap * i + gap / 2,
    y: PAD_T + chartH - (m.revenue / maxRev) * chartH,
    revenue: m.revenue,
    label: m.label,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD_T + chartH} L${pts[0].x},${PAD_T + chartH} Z`;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39613B" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#39613B" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y} stroke="#eaeeec" strokeWidth="1" strokeDasharray={i > 0 ? "4,3" : "0"} />
            <text x={PAD_L - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#9ca8a3" fontFamily="Inter,sans-serif">
              {t.val >= 1000 ? `₱${(t.val / 1000).toFixed(0)}k` : `₱${t.val}`}
            </text>
          </g>
        ))}

        {/* Bars */}
        {pts.map((p, i) => {
          const bH  = (months[i].revenue / maxRev) * chartH;
          const bX  = p.x - barW / 2;
          const bY  = PAD_T + chartH - bH;
          const isH = hovered === i;
          return (
            <rect key={i} x={bX} y={bY} width={barW} height={Math.max(bH, 0)}
              rx="4" fill={isH ? "#2a5c34" : "#39613B"} opacity={isH ? 1 : 0.7}
              style={{ transition: "opacity 0.15s, fill 0.15s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Area under line */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#39613B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hovered === i ? 6 : 4}
            fill={hovered === i ? "#2a5c34" : "#fff"} stroke="#39613B" strokeWidth="2.5"
            style={{ cursor: "pointer", transition: "r 0.15s" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const p = pts[hovered];
          const tw = 80, th = 34;
          const tx = Math.min(Math.max(p.x - tw / 2, PAD_L), W - PAD_R - tw);
          const ty = p.y - th - 10;
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="#1B201A" />
              <text x={tx + tw / 2} y={ty + 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="Inter,sans-serif">{p.label}</text>
              <text x={tx + tw / 2} y={ty + 25} textAnchor="middle" fontSize="11" fill="#FED255" fontWeight="700" fontFamily="Inter,sans-serif">
                ₱{p.revenue.toLocaleString()}
              </text>
            </g>
          );
        })()}

        {/* X-axis labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill={hovered === i ? "#39613B" : "#9ca8a3"} fontWeight={hovered === i ? "700" : "400"} fontFamily="Inter,sans-serif">
            {p.label}
          </text>
        ))}
      </svg>

      {/* Summary row */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {[
          { label: "Total (6 mo)", value: `₱${months.reduce((s, m) => s + m.revenue, 0).toLocaleString()}`, color: "#39613B" },
          { label: "Best Month",  value: (() => { const best = months.reduce((a, b) => b.revenue > a.revenue ? b : a, months[0]); return `${best.label} — ₱${best.revenue.toLocaleString()}`; })(), color: "#f59e0b" },
          { label: "This Month",  value: `₱${months[months.length - 1].revenue.toLocaleString()}`, color: "#3b82f6" },
        ].map((s, i) => (
          <div key={i} style={{ flex: "1 1 120px", background: "#f8faf9", borderRadius: 10, padding: "10px 14px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 10, color: "#9ca8a3", fontWeight: 700, fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: s.color, fontFamily: "var(--admin-font)" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { checking, username, role } = useAdminGuard(["owner"]);
  const [codes, setCodes]   = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/codes?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (!checking) fetchData(); }, [checking, fetchData]);

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const used    = codes.filter(c => c.is_used);
  const active  = used.filter((c): c is AccessCode & { expires_at: string } => Boolean(c.expires_at && new Date(c.expires_at) > now));
  const expired = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused  = codes.filter(c => !c.is_used);

  const todayNew = used.filter(c => c.used_at && new Date(c.used_at) >= todayStart).length;
  const weekNew  = used.filter(c => c.used_at && new Date(c.used_at) >= weekStart).length;
  const monthNew = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const maxTierCount = Math.max(...Object.values(revenueByTier), 1);

  const byCoach: Record<string, number> = {};
  codes.forEach(c => {
    const match = c.notes?.match(/^\[([^\]]+)\]/);
    const name  = match ? match[1] : (c.created_by || "Unknown");
    byCoach[name] = (byCoach[name] || 0) + 1;
  });
  const topCoaches = Object.entries(byCoach).sort((a, b) => b[1] - a[1]);

  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });

  // Monthly revenue (last 6 months)
  const months: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
    const revenue = used
      .filter(c => { if (!c.used_at) return false; const u = new Date(c.used_at); return u.getFullYear() === d.getFullYear() && u.getMonth() === d.getMonth(); })
      .reduce((s, c) => s + (c.tier || 0), 0);
    months.push({ label, revenue });
  }
  const maxRevenue = Math.max(...months.map(m => m.revenue), 1);

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/analytics" username={username} role={role} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="a-page-title">Analytics</h1>
          <p className="a-page-subtitle">Customer activity &amp; sales overview</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-mid)", fontSize: 13, fontFamily: "var(--admin-font)" }}>
            Loading analytics...
          </div>
        ) : (
          <>
            {/* ── Stats ── */}
            <div className="a-stats-grid">
              <StatCard icon={Package}      label="Total Codes"  value={codes.length}   accent="#6366f1" />
              <StatCard icon={CheckCircle2} label="Active Users" value={active.length}  accent="#39613B" />
              <StatCard icon={Clock}        label="Expired"      value={expired.length} accent="#ef4444" />
              <StatCard icon={Users}        label="Unused Codes" value={unused.length}  accent="#f59e0b" />
            </div>

            {/* ── New activations ── */}
            <Card title="New Activations">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Today",      value: todayNew, bg: "#eff6ff", text: "#2563eb" },
                  { label: "This Week",  value: weekNew,  bg: "#f0fdf4", text: "#15803d" },
                  { label: "This Month", value: monthNew, bg: "#fefce8", text: "#a16207" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "18px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: s.text, lineHeight: 1, fontFamily: "var(--admin-font)" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-mid)", marginTop: 5, fontWeight: 600, fontFamily: "var(--admin-font)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Two column ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Sales by package */}
              <Card title="Sales by Package">
                {Object.entries(revenueByTier).length === 0 ? (
                  <p style={{ color: "var(--ink-mid)", fontSize: 13, textAlign: "center", padding: "24px 0", margin: 0, fontFamily: "var(--admin-font)" }}>No sales yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0])).map(([tier, count]) => {
                      const pct = Math.round((count / maxTierCount) * 100);
                      return (
                        <div key={tier}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, fontFamily: "var(--admin-font)" }}>₱{Number(tier).toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: "var(--ink-mid)", fontFamily: "var(--admin-font)" }}>
                              {count}× · <strong>₱{(Number(tier) * count).toLocaleString()}</strong>
                            </span>
                          </div>
                          <div style={{ background: "#f0f2f0", borderRadius: 4, height: 7, overflow: "hidden" }}>
                            <div style={{ background: "var(--green)", height: "100%", width: `${pct}%`, borderRadius: 4, transition: "width 0.6s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Top generators */}
              <Card title="Top Code Generators">
                {topCoaches.length === 0 ? (
                  <p style={{ color: "var(--ink-mid)", fontSize: 13, textAlign: "center", padding: "24px 0", margin: 0, fontFamily: "var(--admin-font)" }}>No data yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {topCoaches.map(([coach, count], i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "9px 12px", borderRadius: 9,
                        background: i === 0 ? "#fefce8" : "transparent",
                        borderBottom: i < topCoaches.length - 1 ? "1px solid #f2f5f3" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 7,
                            background: i === 0 ? "#fde68a" : i === 1 ? "#e5e7eb" : i === 2 ? "#fed7aa" : "#f0f2f0",
                            display: "grid", placeItems: "center",
                          }}>
                            <Trophy size={13} color={i === 0 ? "#a16207" : i === 1 ? "#6b7280" : i === 2 ? "#c2410c" : "#9ca3af"} />
                          </div>
                          <span style={{ color: "var(--ink)", fontWeight: i === 0 ? 700 : 400, fontSize: 13, fontFamily: "var(--admin-font)" }}>{coach}</span>
                        </div>
                        <span className={i === 0 ? "a-badge a-badge-yellow" : "a-badge a-badge-green"}>
                          {count} code{count > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* ── Monthly revenue chart ── */}
            <Card title="Monthly Revenue — Last 6 Months">
              <RevenueChart months={months} />
            </Card>

            {/* ── Expiring soon ── */}
            {expiringSoon.length > 0 && (
              <Card title={`Expiring Soon — ${expiringSoon.length} within 7 days`}>
                <div className="a-table-wrap" style={{ border: "none", borderRadius: 0, margin: "0 -22px -20px" }}>
                  <table className="a-table">
                    <thead>
                      <tr>{["Code", "Customer", "Package", "Days Left"].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {expiringSoon.map((c, i) => {
                        const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                        return (
                          <tr key={i}>
                            <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{c.code}</td>
                            <td style={{ fontWeight: 600 }}>{c.customer_name || "—"}</td>
                            <td>₱{c.tier?.toLocaleString()}</td>
                            <td><span className={`a-badge ${d <= 3 ? "a-badge-red" : "a-badge-yellow"}`}>{d}d left</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <p style={{ textAlign: "center", color: "#c0c8c4", fontSize: 11, marginTop: 28, fontFamily: "var(--admin-font)" }}>
              R&amp;M EaseBrew Wellness Hub
            </p>
          </>
        )}
      </main>
    </div>
  );
}
