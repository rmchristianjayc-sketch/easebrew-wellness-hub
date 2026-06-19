"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/_components/Sidebar";

const G    = "#39613B";
const DARK = "#1B201A";
const MID  = "#4E504F";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: "bold", color: DARK }}>{value}</div>
      <div style={{ fontSize: 11, color: MID, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchData();
    }
    init();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/generate-code?filter=all&limit=200");
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { }
    setLoading(false);
  }

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const used    = codes.filter(c => c.is_used);
  const active  = used.filter(c => c.expires_at && new Date(c.expires_at) > now);
  const expired = used.filter(c => c.expires_at && new Date(c.expires_at) <= now);
  const unused  = codes.filter(c => !c.is_used);

  const todayNew = used.filter(c => c.used_at && new Date(c.used_at) >= todayStart).length;
  const weekNew  = used.filter(c => c.used_at && new Date(c.used_at) >= weekStart).length;
  const monthNew = used.filter(c => c.used_at && new Date(c.used_at) >= monthStart).length;

  const revenueByTier: Record<number, number> = {};
  used.forEach(c => { revenueByTier[c.tier] = (revenueByTier[c.tier] || 0) + 1; });
  const maxTierCount = Math.max(...Object.values(revenueByTier), 1);

  const byCoach: Record<string, number> = {};
  codes.forEach(c => { byCoach[c.created_by] = (byCoach[c.created_by] || 0) + 1; });
  const topCoaches = Object.entries(byCoach).sort((a, b) => b[1] - a[1]);

  const expiringSoon = active.filter(c => {
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d <= 7;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/analytics" username={username} />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 36px", minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: 0 }}>Analytics</h1>
          <p style={{ color: MID, fontSize: 13, margin: "4px 0 0" }}>Customer activity & sales overview</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: MID }}>Loading analytics...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard icon="🎫" label="Total Codes"  value={codes.length}    color="#6366f1" />
              <StatCard icon="✅" label="Active Users" value={active.length}   color={G}       />
              <StatCard icon="⏰" label="Expired"      value={expired.length}  color="#ef4444" />
              <StatCard icon="📦" label="Unused Codes" value={unused.length}   color="#f59e0b" />
            </div>

            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 20 }}>
              <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 16px" }}>🆕 New Activations</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Today",      value: todayNew, color: "#e0f2fe", text: "#0369a1" },
                  { label: "This Week",  value: weekNew,  color: "#dcfce7", text: G         },
                  { label: "This Month", value: monthNew, color: "#fef9c3", text: "#b45309" },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.color, borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: s.text }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: MID, marginTop: 4, fontWeight: "bold" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 16px" }}>💰 Sales by Package</h2>
                {Object.entries(revenueByTier).length === 0 ? (
                  <p style={{ color: MID, fontSize: 13, textAlign: "center", padding: "24px 0", margin: 0 }}>No sales yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(revenueByTier).sort((a, b) => Number(b[0]) - Number(a[0])).map(([tier, count]) => {
                      const pct = Math.round((count / maxTierCount) * 100);
                      return (
                        <div key={tier}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: DARK, fontWeight: "bold" }}>₱{Number(tier).toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: MID }}>{count} order{count > 1 ? "s" : ""} · <strong>₱{(Number(tier) * count).toLocaleString()}</strong></span>
                          </div>
                          <div style={{ background: "#f0f0f0", borderRadius: 6, height: 8, overflow: "hidden" }}>
                            <div style={{ background: G, height: "100%", width: `${pct}%`, borderRadius: 6, transition: "width 0.6s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 16px" }}>🤝 Top Code Generators</h2>
                {topCoaches.length === 0 ? (
                  <p style={{ color: MID, fontSize: 13, textAlign: "center", padding: "24px 0", margin: 0 }}>No data yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {topCoaches.map(([coach, count], i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: i === 0 ? "#fffbeb" : "transparent", borderBottom: i < topCoaches.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18, width: 24 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤"}</span>
                          <span style={{ color: DARK, fontWeight: i === 0 ? "bold" : "normal", fontSize: 13 }}>{coach}</span>
                        </div>
                        <span style={{ background: i === 0 ? "#fef3c7" : "#f0f7f0", color: i === 0 ? "#b45309" : G, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>
                          {count} code{count > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {expiringSoon.length > 0 && (
              <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>⚠️ Expiring Soon</h2>
                  <span style={{ background: "#fef3c7", color: "#b45309", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: "bold" }}>
                    {expiringSoon.length} within 7 days
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      {["Code", "Customer", "Package", "Days Left"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: MID, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expiringSoon.map((c, i) => {
                      const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f8f8f8" }}>
                          <td style={{ padding: "10px 12px", fontFamily: "monospace", color: G, fontWeight: "bold", fontSize: 13 }}>{c.code}</td>
                          <td style={{ padding: "10px 12px", color: DARK, fontSize: 13, fontWeight: "bold" }}>{c.customer_name || "—"}</td>
                          <td style={{ padding: "10px 12px", color: MID, fontSize: 13 }}>₱{c.tier?.toLocaleString()}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: d <= 3 ? "#fee2e2" : "#fef3c7", color: d <= 3 ? "#dc2626" : "#b45309", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>
                              {d}d left
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ textAlign: "center", color: "#ccc", fontSize: 11, marginTop: 20 }}>
              R&M EaseBrew Wellness Hub © 2025
            </p>
          </>
        )}
      </main>
    </div>
  );
}