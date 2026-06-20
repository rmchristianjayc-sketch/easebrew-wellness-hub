"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/_components/Sidebar";
import { PRICE_CONFIG } from "@/lib/price-config";
import { DEFAULT_COACHES } from "@/lib/coaches";

const G    = "#39613B";
const GOLD = "#FED255";
const DARK = "#1B201A";
const MID  = "#4E504F";

// ✅ Galing na sa lib/coaches.ts — isang source of truth
const COACHES = DEFAULT_COACHES.map(c => c.name);

// ─── Confirm Card ─────────────────────────────────────────────────────────────
function ConfirmCard({ message, onConfirm, onCancel, danger = true }: {
  message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 28px 24px", maxWidth: 380, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <p style={{ fontSize: 15, color: DARK, margin: "0 0 20px", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: MID, cursor: "pointer" }}>Huwag na</button>
          <button onClick={onConfirm} style={{ background: danger ? "#ef4444" : G, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "white", fontWeight: "bold", cursor: "pointer" }}>Oo, ituloy</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CodesPage() {
  const router = useRouter();
  const [role, setRole]           = useState("");
  const [username, setUsername]   = useState("");
  const [tier, setTier]           = useState<number>(999);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes]         = useState("");
  const [coachName, setCoachName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError]         = useState("");
  const [codes, setCodes]         = useState<any[]>([]);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [copied, setCopied]       = useState(false);
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [codesLoading, setCodesLoading] = useState(true);
  const [nameError, setNameError]   = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [coachError, setCoachError] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirm, setConfirm]     = useState<{ message: string; onConfirm: () => void; danger?: boolean } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) { router.push("/admin/login"); return; }
        const { role: r, username: u } = await res.json();
        setRole(r);
        setUsername(u);
      } catch {
        router.push("/admin/login");
        return;
      }
      fetchCodes();
    }
    init();
  }, [filter]);

  async function fetchCodes() {
    setCodesLoading(true);
    try {
      const res  = await fetch(`/api/admin/codes?filter=${filter}&limit=200`);
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch { }
    setCodesLoading(false);
  }

  async function handleGenerate() {
    setError(""); setGeneratedCode("");
    let hasError = false;
    if (!customerName.trim()) { setNameError(true);  hasError = true; } else setNameError(false);
    if (!notes.trim())        { setNotesError(true); hasError = true; } else setNotesError(false);
    if (!coachName)           { setCoachError(true); hasError = true; } else setCoachError(false);
    if (hasError) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/generate-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
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

  function handleDelete(id: string, code: string) {
    setConfirm({
      message: `I-delete ang code ${code}? Hindi na ito mababalik.`, danger: true,
      onConfirm: async () => {
        setConfirm(null); setActionLoadingId(id);
        try {
          const res  = await fetch("/api/admin/codes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
          const data = await res.json();
          if (!res.ok) { setError(data.error || "Failed to delete code."); return; }
          setCodes(prev => prev.filter(c => c.id !== id));
        } catch { setError("Something went wrong."); }
        finally { setActionLoadingId(null); }
      },
    });
  }

  function handleDeactivate(id: string, code: string) {
    setConfirm({
      message: `I-deactivate ang code ${code}? Mawawala agad ang access ng customer.`, danger: true,
      onConfirm: async () => {
        setConfirm(null); setActionLoadingId(id);
        try {
          const res  = await fetch("/api/admin/codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "deactivate" }) });
          const data = await res.json();
          if (!res.ok) { setError(data.error || "Failed to deactivate code."); return; }
          fetchCodes();
        } catch { setError("Something went wrong."); }
        finally { setActionLoadingId(null); }
      },
    });
  }

  function handleReactivate(id: string, code: string) {
    setConfirm({
      message: `I-reactivate ang code ${code}? Kailangan i-verify ulit ng customer.`, danger: false,
      onConfirm: async () => {
        setConfirm(null); setActionLoadingId(id);
        try {
          const res  = await fetch("/api/admin/codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reactivate" }) });
          const data = await res.json();
          if (!res.ok) { setError(data.error || "Failed to reactivate code."); return; }
          fetchCodes();
        } catch { setError("Something went wrong."); }
        finally { setActionLoadingId(null); }
      },
    });
  }

  function statusInfo(c: any) {
    if (!c.is_used) return { label: "Unused", bg: "#fef9c3", color: "#b45309" };
    if (c.expires_at && new Date(c.expires_at) < new Date()) return { label: "Expired", bg: "#fee2e2", color: "#dc2626" };
    return { label: "Active", bg: "#dcfce7", color: G };
  }

  const now      = new Date();
  const filtered = codes.filter(c =>
    search.trim() === "" ||
    (c.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCodes  = codes.length;
  const activeCodes = codes.filter(c => c.is_used && c.expires_at && new Date(c.expires_at) > now).length;
  const unusedCodes = codes.filter(c => !c.is_used).length;
  const isOwner     = role === "owner";

  const inp = (err: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 13px", borderRadius: 8,
    border: `1.5px solid ${err ? "#ef4444" : "#e0e0e0"}`,
    fontSize: 13, outline: "none", boxSizing: "border-box", color: DARK, background: "white",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" }}>
      {confirm && <ConfirmCard message={confirm.message} danger={confirm.danger} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <Sidebar active="/admin/codes" role={role} username={username} />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 36px", minWidth: 0, display: "flex", gap: 24 }}>
        {/* ── Left: Generate Form ── */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 6px" }}>Generate Code</h1>
          <p style={{ color: MID, fontSize: 13, margin: "0 0 20px" }}>Create access codes for customers</p>

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

          <div style={{ background: "white", borderRadius: 14, padding: "22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <h2 style={{ color: DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 16px" }}>✨ New Code</h2>

            <div style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>Package / Tier</label>
              <select value={tier} onChange={e => setTier(Number(e.target.value))} style={{ ...inp(false), cursor: "pointer" }}>
                {Object.entries(PRICE_CONFIG).map(([p, cfg]) => (
                  <option key={p} value={p}>{cfg.label} — {cfg.validityDays}d</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>Coach <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={coachName} onChange={e => { setCoachName(e.target.value); if (e.target.value) setCoachError(false); }} style={{ ...inp(coachError), cursor: "pointer", color: coachName ? DARK : "#aaa" }}>
                <option value="">— Select Coach —</option>
                {COACHES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {coachError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0" }}>⚠️ Required</p>}
            </div>

            <div style={{ marginBottom: 13 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>Customer Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" value={customerName} onChange={e => { setCustomerName(e.target.value); if (e.target.value.trim()) setNameError(false); }} placeholder="e.g. Nena Santos" style={inp(nameError)}
                onFocus={e => e.target.style.borderColor = nameError ? "#ef4444" : G}
                onBlur={e => e.target.style.borderColor  = nameError ? "#ef4444" : "#e0e0e0"}
              />
              {nameError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0" }}>⚠️ Required</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: DARK, fontWeight: "bold", display: "block", marginBottom: 5 }}>Notes / Payment <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" value={notes} onChange={e => { setNotes(e.target.value); if (e.target.value.trim()) setNotesError(false); }} placeholder="e.g. GCash, COD, Referral..." style={inp(notesError)}
                onFocus={e => e.target.style.borderColor = notesError ? "#ef4444" : G}
                onBlur={e => e.target.style.borderColor  = notesError ? "#ef4444" : "#e0e0e0"}
              />
              {notesError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0" }}>⚠️ Required</p>}
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "9px 13px", color: "#cc0000", fontSize: 12, marginBottom: 12 }}>⚠️ {error}</div>
            )}

            <button onClick={handleGenerate} disabled={loading} style={{ width: "100%", background: loading ? "#ccc" : G, color: "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Generating..." : "🎫 Generate Code"}
            </button>
          </div>

          {generatedCode && (
            <div style={{ background: G, borderRadius: 14, padding: "20px", marginTop: 16, textAlign: "center", boxShadow: "0 4px 16px rgba(57,97,59,0.3)" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "0 0 8px" }}>✅ Code Generated! Send to customer:</p>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px", marginBottom: 12 }}>
                <span style={{ color: GOLD, fontSize: 24, fontWeight: "bold", letterSpacing: "3px", fontFamily: "monospace" }}>{generatedCode}</span>
              </div>
              <button onClick={copyCode} style={{ background: copied ? GOLD : "rgba(255,255,255,0.2)", color: copied ? DARK : "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: "bold", cursor: "pointer" }}>
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
                <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? G : "white", color: filter === f ? "white" : MID, border: `1.5px solid ${filter === f ? G : "#ddd"}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontWeight: filter === f ? "bold" : "normal", textTransform: "capitalize" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name or code..."
              style={{ width: "100%", padding: "10px 13px 10px 38px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, outline: "none", boxSizing: "border-box", color: DARK, background: "white" }}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor  = "#e0e0e0"}
            />
          </div>

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
                    const st       = statusInfo(c);
                    const isCopied = copiedId === c.code;
                    const isActing = actionLoadingId === c.id;
                    const daysLeft = c.expires_at ? Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000) : null;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "white"}
                      >
                        <td style={{ padding: "11px 14px", fontFamily: "monospace", color: G, fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}>{c.code}</td>
                        <td style={{ padding: "11px 14px", color: DARK, fontSize: 13, fontWeight: "bold" }}>{c.customer_name || "—"}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: MID, whiteSpace: "nowrap" }}>₱{c.tier?.toLocaleString()} · {c.packs}pk · {c.validity_days}d</td>
                        <td style={{ padding: "11px 14px", fontSize: 11, color: "#888", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.notes || "—"}</td>
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
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button onClick={() => copyListCode(c.code)} style={{ background: isCopied ? "#dcfce7" : "none", border: `1px solid ${G}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: G, cursor: "pointer", fontWeight: "bold" }}>
                              {isCopied ? "✅" : "Copy"}
                            </button>
                            {st.label === "Active" && (
                              <button onClick={() => handleDeactivate(c.id, c.code)} disabled={isActing} style={{ background: "none", border: "1px solid #b45309", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#b45309", cursor: isActing ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                                {isActing ? "..." : "Deactivate"}
                              </button>
                            )}
                            {isOwner && st.label === "Expired" && (
                              <button onClick={() => handleReactivate(c.id, c.code)} disabled={isActing} style={{ background: "none", border: `1px solid ${G}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: G, cursor: isActing ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                                {isActing ? "..." : "Reactivate"}
                              </button>
                            )}
                            {isOwner && (
                              <button onClick={() => handleDelete(c.id, c.code)} disabled={isActing} style={{ background: "none", border: "1px solid #ef4444", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#ef4444", cursor: isActing ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                                {isActing ? "..." : "🗑️"}
                              </button>
                            )}
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