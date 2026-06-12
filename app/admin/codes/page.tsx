"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const DARK = "#1B201A";
const MID = "#4E504F";
const SIDEBAR_W = 220;

// 1 pack = 10 sachets = 5 days (2 sachets per day)
const PRICE_CONFIG: Record<number, { packs: number; validityDays: number; label: string }> = {
  399:   { packs: 1,  validityDays: 5,   label: "1 Pack — ₱399" },
  699:   { packs: 2,  validityDays: 10,  label: "2 Packs — ₱699" },
  999:   { packs: 3,  validityDays: 15,  label: "3 Packs — ₱999" },
  1499:  { packs: 5,  validityDays: 25,  label: "5 Packs — ₱1,499" },
  2998:  { packs: 10, validityDays: 50,  label: "10 Packs — ₱2,998" },
  4497:  { packs: 15, validityDays: 75,  label: "15 Packs — ₱4,497" },
  5996:  { packs: 20, validityDays: 100, label: "20 Packs — ₱5,996" },
  7499:  { packs: 25, validityDays: 125, label: "25 Packs — ₱7,499" },
  8994:  { packs: 30, validityDays: 150, label: "30 Packs — ₱8,994" },
  11992: { packs: 40, validityDays: 200, label: "40 Packs — ₱11,992" },
  14990: { packs: 50, validityDays: 250, label: "50 Packs — ₱14,990" },
};

const COACHES = ["Coach Josephine", "Coach Niña", "Coach Mark", "Coach Rai", "Coach Jo Ann", "Coach Mike"];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, role }: { active: string; role: string }) {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => { setUsername(localStorage.getItem("eb_admin_username") || ""); }, []);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    localStorage.removeItem("eb_admin_role");
    localStorage.removeItem("eb_admin_username");
    router.push("/admin/login");
  }

  const ownerLinks = [
    { href: "/admin", icon: "⚡", label: "Dashboard" },
    { href: "/admin/codes", icon: "🔑", label: "Codes" },
    { href: "/admin/analytics", icon: "📊", label: "Analytics" },
    { href: "/admin/content", icon: "✏️", label: "Content" },
    { href: "/admin/notifications", icon: "🔔", label: "Notifications" },
  ];
  const coachLinks = [
    { href: "/admin/codes", icon: "🔑", label: "Generate Code" },
  ];
  const links = role === "coach" ? coachLinks : ownerLinks;

  return (
    <aside style={{ width: SIDEBAR_W, minHeight: "100vh", background: G, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 100, boxShadow: "2px 0 12px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: GOLD, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>☕</div>
          <div>
            <div style={{ color: GOLD, fontWeight: "bold", fontSize: 14, lineHeight: 1.2 }}>EaseBrew</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{role === "coach" ? "Coach Portal" : "Admin Panel"}</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(l => {
          const isActive = active === l.href;
          return (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: isActive ? "rgba(254,210,85,0.15)" : "transparent", borderLeft: isActive ? `3px solid ${GOLD}` : "3px solid transparent", cursor: "pointer" }}
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
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{role === "coach" ? "Coach" : "Administrator"}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: "100%", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CodesPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [tier, setTier] = useState<number>(999);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [coachName, setCoachName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [codes, setCodes] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [codesLoading, setCodesLoading] = useState(true);
  const [nameError, setNameError] = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [coachError, setCoachError] = useState(false);

  useEffect(() => {
    const r = localStorage.getItem("eb_admin_role") || "";
    if (!r) { router.push("/admin/login"); return; }
    setRole(r);
    fetchCodes(r);
  }, [filter]);

  async function fetchCodes(r?: string) {
    setCodesLoading(true);
    try {
      const res = await fetch(`/api/admin/generate-code?filter=${filter}&limit=200`);
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { }
    setCodesLoading(false);
  }

  async function handleGenerate() {
    setError(""); setGeneratedCode("");
    let hasError = false;
    if (!customerName.trim()) { setNameError(true); hasError = true; } else setNameError(false);
    if (!notes.trim()) { setNotesError(true); hasError = true; } else setNotesError(false);
    if (!coachName) { setCoachError(true); hasError = true; } else setCoachError(false);
    if (hasError) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, customer_name: customerName, notes: `[${coachName}] ${notes}` }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to generate code."); return; }
      setGeneratedCode((data.code?.code || "").trim());
      setCustomerName(""); setNotes(""); setCoachName("");
      fetchCodes();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  function copyListCode(code: string) {
    navigator.clipboard.writeText(code).then(() => { setCopiedId(code); setTimeout(() => setCopiedId(null), 2000); });
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`I-delete ang code ${code}? Hindi na ito mababalik.`)) return;
    try {
      const res = await fetch("/api/admin/codes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to delete code."); return; }
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch {
      alert("Something went wrong.");
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`I-delete ang code ${code}? Hindi na ito mababalik.`)) return;
    try {
      const res = await fetch("/api/admin/codes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to delete code."); return; }
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch {
      alert("Something went wrong.");
    }
  }

  function statusInfo(c: any) {
    if (!c.is_used) return { label: "Unused", bg: "#fef9c3", color: "#b45309" };
    if (c.expires_at && new Date(c.expires_at) < new Date()) return { label: "Expired", bg: "#fee2e2", color: "#dc2626" };
    return { label: "Active", bg: "#dcfce7", color: G };
  }

  const now = new Date();
  const filtered = codes.filter(c =>
    search.trim() === "" ||
    (c.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCodes = codes.length;
  const activeCodes = codes.filter(c => c.is_used && c.expires_at && new Date(c.expires_at) > now).length;
  const unusedCodes = codes.filter(c => !c.is_used).length;

  const inp = (err: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 13px", borderRadius: 8,
    border: `1.5px solid ${err ? "#ef4444" : "#e0e0e0"}`,
    fontSize: 13, outline: "none", boxSizing: "border-box", color: DARK, background: "white",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/codes" role={role} />

      <main style={{ marginLeft: SIDEBAR_W, flex: 1, padding: "32px 36px", minWidth: 0, display: "flex", gap: 24 }}>

        {/* ── Left: Generate Form ── */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 6px" }}>Generate Code</h1>
          <p style={{ color: MID, fontSize: 13, margin: "0 0 20px" }}>Create access codes for customers</p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { l: "Total", v: totalCodes, c: "#6366f1" },
              { l: "Active", v: activeCodes, c: G },
              { l: "Unused", v: unusedCodes, c: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", borderRadius: 10, padding: "12px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `2px solid ${s.c}` }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: DARK }}>{s.v}</div>
                <div style={{ fontSize: 10, color: MID, fontWeight: "bold", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: "white", borderRadius: 14, padding: "22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 16px" }}>✨ New Code</h2>

            {/* Package */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>Package / Tier</label>
              <select value={tier} onChange={e => setTier(Number(e.target.value))} style={{ ...inp(false), cursor: "pointer" }}>
                {Object.entries(PRICE_CONFIG).map(([p, cfg]) => (
                  <option key={p} value={p}>{cfg.label} — {cfg.validityDays}d</option>
                ))}
              </select>
            </div>

            {/* Coach */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>
                Coach <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select value={coachName} onChange={e => { setCoachName(e.target.value); if (e.target.value) setCoachError(false); }} style={{ ...inp(coachError), cursor: "pointer", color: coachName ? DARK : "#aaa" }}>
                <option value="">— Select Coach —</option>
                {COACHES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {coachError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0" }}>⚠️ Required</p>}
            </div>

            {/* Customer Name */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>
                Customer Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="text" value={customerName} onChange={e => { setCustomerName(e.target.value); if (e.target.value.trim()) setNameError(false); }} placeholder="e.g. Nena Santos" style={inp(nameError)}
                onFocus={e => e.target.style.borderColor = nameError ? "#ef4444" : G}
                onBlur={e => e.target.style.borderColor = nameError ? "#ef4444" : "#e0e0e0"}
              />
              {nameError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0" }}>⚠️ Required</p>}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>
                Notes / Payment <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="text" value={notes} onChange={e => { setNotes(e.target.value); if (e.target.value.trim()) setNotesError(false); }} placeholder="e.g. GCash, COD, Referral..." style={inp(notesError)}
                onFocus={e => e.target.style.borderColor = notesError ? "#ef4444" : G}
                onBlur={e => e.target.style.borderColor = notesError ? "#ef4444" : "#e0e0e0"}
              />
              {notesError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0" }}>⚠️ Required</p>}
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "9px 13px", color: "#cc0000", fontSize: 12, marginBottom: 12 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleGenerate} disabled={loading} style={{
              width: "100%", background: loading ? "#ccc" : G, color: "white",
              border: "none", borderRadius: 10, padding: "12px", fontSize: 14,
              fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Generating..." : "🎫 Generate Code"}
            </button>
          </div>

          {/* Generated Code */}
          {generatedCode && (
            <div style={{ background: G, borderRadius: 14, padding: "20px", marginTop: 16, textAlign: "center", boxShadow: "0 4px 16px rgba(57,97,59,0.3)" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "0 0 8px" }}>✅ Code Generated! Send to customer:</p>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px", marginBottom: 12 }}>
                <span style={{ color: GOLD, fontSize: 24, fontWeight: "bold", letterSpacing: "3px", fontFamily: "monospace" }}>{generatedCode}</span>
              </div>
              <button onClick={copyCode} style={{
                background: copied ? GOLD : "rgba(255,255,255,0.2)", color: copied ? DARK : "white",
                border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: "bold", cursor: "pointer",
              }}>
                {copied ? "✅ Copied!" : "📋 Copy Code"}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Codes Table ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ color: DARK, fontSize: 18, fontWeight: "bold", margin: 0 }}>All Codes</h2>
              <p style={{ color: MID, fontSize: 12, margin: "3px 0 0" }}>Showing {filtered.length} of {codes.length}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "unused", "used"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  background: filter === f ? G : "white", color: filter === f ? "white" : MID,
                  border: `1.5px solid ${filter === f ? G : "#ddd"}`,
                  borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer",
                  fontWeight: filter === f ? "bold" : "normal", textTransform: "capitalize",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name or code..."
              style={{ width: "100%", padding: "10px 13px 10px 38px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, outline: "none", boxSizing: "border-box", color: DARK, background: "white" }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {/* Table */}
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {codesLoading ? (
              <div style={{ padding: "48px", textAlign: "center", color: MID }}>Loading codes...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: MID }}>
                {search ? `No results for "${search}"` : "No codes found."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #f0f0f0" }}>
                    {["Code", "Customer", "Package", "Coach / Notes", "Date Used", "Expires", "Status", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: MID, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const st = statusInfo(c);
                    const isCopied = copiedId === c.code;
                    const daysLeft = c.expires_at
                      ? Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000)
                      : null;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "white"}
                      >
                        <td style={{ padding: "11px 14px", fontFamily: "monospace", color: G, fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}>{c.code}</td>
                        <td style={{ padding: "11px 14px", color: DARK, fontSize: 13, fontWeight: "bold" }}>{c.customer_name || "—"}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: MID, whiteSpace: "nowrap" }}>
                          ₱{c.tier?.toLocaleString()} · {c.packs}pk · {c.validity_days}d
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 11, color: "#888", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.notes || "—"}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 11, color: MID, whiteSpace: "nowrap" }}>
                          {c.used_at ? new Date(c.used_at).toLocaleDateString("en-PH") : "—"}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 11, whiteSpace: "nowrap" }}>
                          {daysLeft !== null ? (
                            <span style={{ color: daysLeft <= 7 && daysLeft > 0 ? "#b45309" : daysLeft <= 0 ? "#dc2626" : MID }}>
                              {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>{st.label}</span>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => copyListCode(c.code)} style={{
                              background: isCopied ? "#dcfce7" : "none", border: `1px solid ${G}`,
                              borderRadius: 6, padding: "3px 10px", fontSize: 11, color: G, cursor: "pointer", fontWeight: "bold",
                            }}>
                              {isCopied ? "✅" : "Copy"}
                            </button>
                            <button onClick={() => handleDelete(c.id, c.code)} style={{
                              background: "none", border: "1px solid #ef4444",
                              borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#ef4444", cursor: "pointer", fontWeight: "bold",
                            }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}