"use client";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { PRICE_CONFIG } from "@/lib/price-config";
import { DEFAULT_COACHES, buildCoaches } from "@/lib/coaches";
import type { AccessCode } from "@/lib/supabase";
import {
  Check, ClipboardCopy, Download, MessageSquare, RefreshCw, Search, Ticket, Trash2, X, AlertTriangle, QrCode,
  User, Droplets, Activity, BarChart2,
} from "lucide-react";

// ─── Customer Profile Panel ───────────────────────────────────────────────────
type ProfileData = {
  code: AccessCode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: Record<string, { data: any; updated_at: string }>;
};

function CustomerProfilePanel({ codeStr, onClose }: { codeStr: string; onClose: () => void }) {
  const [data,    setData]    = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err,     setErr]     = React.useState("");

  React.useEffect(() => {
    setLoading(true); setErr(""); setData(null);
    fetch(`/api/admin/customer-progress?code=${encodeURIComponent(codeStr)}`)
      .then(r => r.json())
      .then(j => { if (j.success) setData(j); else setErr(j.error || "Failed to load"); })
      .catch(() => setErr("Network error"))
      .finally(() => setLoading(false));
  }, [codeStr]);

  const now = new Date();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }} onClick={onClose}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} />
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, background: "#fff", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f2518 0%, #2a5c34 100%)", padding: "22px 24px", color: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: "rgba(254,210,85,0.8)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--admin-font)" }}>Customer Profile</span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(254,210,85,0.2)", border: "1.5px solid rgba(254,210,85,0.3)", display: "grid", placeItems: "center" }}>
              <User size={22} color="#FED255" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--admin-font)" }}>{data?.code.customer_name || codeStr}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>{codeStr}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px", flex: 1 }}>
          {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca8a3", fontFamily: "var(--admin-font)", fontSize: 13 }}>Loading profile...</div>}
          {err    && <div style={{ color: "#dc2626", fontSize: 13, padding: "20px 0", fontFamily: "var(--admin-font)" }}>⚠️ {err}</div>}
          {data && (() => {
            const c  = data.code;
            const pr = data.progress;
            const daysLeft = c.expires_at ? Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000) : null;

            // Water stats
            type WaterLog = { date: string; glasses: number };
            const waterData  = (pr["water"]?.data as { logs?: WaterLog[] } | null)?.logs ?? [];
            const last7water = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - i);
              const ds = d.toISOString().split("T")[0];
              return waterData.find((l: WaterLog) => l.date === ds)?.glasses ?? 0;
            }).reverse();
            const avgWater   = last7water.length ? Math.round(last7water.reduce((a: number, b: number) => a + b, 0) / last7water.length * 10) / 10 : null;

            // Tracker stats
            type CheckIn = { date: string; energy?: number; pain?: number; weight?: number };
            const trackerData = (pr["tracker"]?.data as CheckIn[] | null) ?? [];
            const recentLogs  = [...trackerData].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Code details */}
                <div style={{ background: "#f8faf9", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca8a3", fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Code Details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Package",  value: `₱${c.tier?.toLocaleString()}` },
                      { label: "Packs",    value: `${c.packs} packs` },
                      { label: "Used at",  value: c.used_at ? new Date(c.used_at).toLocaleDateString("en-PH") : "—" },
                      { label: "Expires",  value: daysLeft != null ? (daysLeft > 0 ? `${daysLeft}d left` : "Expired") : "—" },
                    ].map((row, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 10, color: "#9ca8a3", fontFamily: "var(--admin-font)" }}>{row.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1B201A", fontFamily: "var(--admin-font)", marginTop: 2 }}>{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Water tracker */}
                <div style={{ background: "#f0f9ff", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #bae6fd" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Droplets size={16} color="#0ea5e9" strokeWidth={2} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: 0.5 }}>Water (7 days)</span>
                    {avgWater != null && <span style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 700, marginLeft: "auto" }}>avg {avgWater} glasses/day</span>}
                  </div>
                  {avgWater == null ? (
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Walang water data pa</p>
                  ) : (
                    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
                      {last7water.map((g: number, i: number) => {
                        const h = Math.max((g / 8) * 48, g > 0 ? 4 : 0);
                        return (
                          <div key={i} style={{ flex: 1, height: h, background: g >= 8 ? "#0ea5e9" : "#93c5fd", borderRadius: 4, alignSelf: "flex-end", transition: "height 0.4s" }} title={`${g} glasses`} />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tracker check-ins */}
                <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #86efac" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Activity size={16} color="#16a34a" strokeWidth={2} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Check-ins</span>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, marginLeft: "auto" }}>{trackerData.length} total</span>
                  </div>
                  {recentLogs.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Walang tracker data pa</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {recentLogs.map((log: CheckIn, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fff", borderRadius: 9 }}>
                          <span style={{ fontSize: 11, color: "#166534", fontWeight: 700, fontFamily: "monospace", minWidth: 70 }}>{log.date}</span>
                          {log.energy != null && <span style={{ fontSize: 11, color: "#9ca8a3" }}>⚡{log.energy}</span>}
                          {log.pain   != null && <span style={{ fontSize: 11, color: "#9ca8a3" }}>🩹{log.pain}</span>}
                          {log.weight != null && <span style={{ fontSize: 11, color: "#9ca8a3" }}>⚖️{log.weight}kg</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BMI */}
                {pr["tracker"]?.data && (
                  <div style={{ background: "#faf5ff", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #d8b4fe" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <BarChart2 size={16} color="#7c3aed" strokeWidth={2} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#6b21a8", fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: 0.5 }}>Weight Trend</span>
                    </div>
                    {(() => {
                      const withWeight = (trackerData as CheckIn[]).filter(c => c.weight != null).sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
                      if (!withWeight.length) return <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Walang weight logs pa</p>;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {withWeight.map((l, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--admin-font)" }}>
                              <span style={{ color: "#9ca8a3" }}>{l.date}</span>
                              <span style={{ fontWeight: 700, color: "#6b21a8" }}>{l.weight}kg</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Last updated */}
                {Object.keys(pr).length > 0 && (
                  <p style={{ fontSize: 11, color: "#9ca8a3", textAlign: "center", margin: 0, fontFamily: "var(--admin-font)" }}>
                    Last synced: {Object.values(pr).map(p => p.updated_at).sort().reverse()[0]?.split("T")[0] ?? "—"}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, danger = true }: {
  message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div className="a-card" style={{ maxWidth: 380, width: "90%", padding: "26px 26px 22px" }}>
        <p style={{ fontSize: 14, color: "var(--ink)", margin: "0 0 20px", lineHeight: 1.6, fontFamily: "var(--admin-font)" }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="a-btn a-btn-ghost">Huwag na</button>
          <button onClick={onConfirm} className={`a-btn ${danger ? "a-btn-danger" : "a-btn-primary"}`}>Oo, ituloy</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CodesPage() {
  const { checking, username, role } = useAdminGuard(["owner", "coach"]);
  const [tier, setTier]             = useState<number>(999);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes]           = useState("");
  const [coachName, setCoachName]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [error, setError]           = useState("");
  const [codes, setCodes]           = useState<AccessCode[]>([]);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [copied, setCopied]         = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [copiedId, setCopiedId]     = useState<string | null>(null);
  const [reorderCopiedId, setReorderCopiedId] = useState<string | null>(null);
  const [codesLoading, setCodesLoading] = useState(true);
  const [nameError, setNameError]   = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [coachError, setCoachError] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirm, setConfirm]       = useState<{ message: string; onConfirm: () => void; danger?: boolean } | null>(null);
  const [editingNotesId, setEditingNotesId]   = useState<string | null>(null);
  const [editingNotesVal, setEditingNotesVal] = useState("");
  const [savingNotesId, setSavingNotesId]     = useState<string | null>(null);
  const [dynamicCoaches, setDynamicCoaches]   = useState<string[]>(DEFAULT_COACHES.map(c => c.name));
  const [bulkCopied, setBulkCopied]           = useState(false);
  const [profileCode, setProfileCode]         = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    setCodesLoading(true);
    try {
      const res  = await fetch(`/api/admin/codes?filter=${filter}&limit=200`);
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
      else setError("Hindi ma-load ang mga codes. I-refresh ang page.");
    } catch { setError("Hindi ma-load ang mga codes. I-refresh ang page."); }
    setCodesLoading(false);
  }, [filter]);

  useEffect(() => { if (!checking) fetchCodes(); }, [checking, fetchCodes]);

  useEffect(() => {
    fetch("/api/content").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.content) {
        const built = buildCoaches(data.content, DEFAULT_COACHES);
        setDynamicCoaches(built.map(c => c.name).filter(Boolean));
      }
    }).catch(() => {});
  }, []);

  async function handleGenerate() {
    setError(""); setGeneratedCode(""); setGeneratedMessage("");
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
      const newCode      = (data.code?.code || "").trim();
      const packageLabel = PRICE_CONFIG[tier]?.label ?? `₱${tier.toLocaleString()} package`;
      setGeneratedCode(newCode);
      setGeneratedMessage(
        `Hello po ${customerName.trim()},\n\nIto po ang inyong R&M EaseBrew Wellness Hub access code:\n\n${newCode}\n\nBuksan dito: ${window.location.origin}/verify\n\nPackage: ${packageLabel}\nKung may tanong po kayo, message lang po kayo sa inyong coach.`
      );
      setCustomerName(""); setNotes(""); setCoachName("");
      fetchCodes();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  function copyCode()    { navigator.clipboard.writeText(generatedCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }
  function copyMessage() { navigator.clipboard.writeText(generatedMessage || generatedCode).then(() => { setMessageCopied(true); setTimeout(() => setMessageCopied(false), 2000); }); }
  function copyListCode(code: string) { navigator.clipboard.writeText(code).then(() => { setCopiedId(code); setTimeout(() => setCopiedId(null), 2000); }); }

  const now = new Date();

  function copyReorderMessage(c: AccessCode) {
    if (!c.expires_at) return;
    const daysLeft     = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    const expiresDate  = new Date(c.expires_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
    const packageLabel = PRICE_CONFIG[c.tier]?.label ?? `₱${c.tier?.toLocaleString()} package`;
    const msg = `Hello po ${c.customer_name || ""}!\n\nAng inyong EaseBrew ${packageLabel} ay mag-e-expire na po sa ${expiresDate} (${daysLeft} araw na lang).\n\nPara hindi mapuputol ang inyong wellness journey, mag-order na po kayo ng bagong package!\n\nKung may tanong po kayo, message lang po kayo sa inyong coach.\n\n— R&M EaseBrew Wellness Team`;
    navigator.clipboard.writeText(msg).then(() => { setReorderCopiedId(c.id); setTimeout(() => setReorderCopiedId(null), 2500); }).catch(() => {});
  }

  async function saveNotes(id: string) {
    setSavingNotesId(id);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "update_notes", notes: editingNotesVal }),
      });
      if (res.ok) { setCodes(prev => prev.map(c => c.id === id ? { ...c, notes: editingNotesVal } : c)); setEditingNotesId(null); }
    } catch { /* silent */ }
    setSavingNotesId(null);
  }

  function handleDelete(id: string, code: string) {
    setConfirm({
      message: `I-delete ang code ${code}? Hindi na ito mababalik.`, danger: true,
      onConfirm: async () => {
        setConfirm(null); setActionLoadingId(id);
        try {
          const res = await fetch("/api/admin/codes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
          if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to delete."); return; }
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
          const res = await fetch("/api/admin/codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "deactivate" }) });
          if (!res.ok) { const d = await res.json(); setError(d.error || "Failed."); return; }
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
          const res = await fetch("/api/admin/codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reactivate" }) });
          if (!res.ok) { const d = await res.json(); setError(d.error || "Failed."); return; }
          fetchCodes();
        } catch { setError("Something went wrong."); }
        finally { setActionLoadingId(null); }
      },
    });
  }

  function statusInfo(c: AccessCode) {
    if (!c.is_used) return { label: "Unused", cls: "a-badge a-badge-yellow" };
    if (c.expires_at && new Date(c.expires_at) < now) return { label: "Expired", cls: "a-badge a-badge-red" };
    return { label: "Active", cls: "a-badge a-badge-green" };
  }

  const filtered = codes
    .filter(c =>
      search.trim() === "" ||
      (c.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.notes || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const riskScore = (c: AccessCode & { last_active_at?: string | null }) => {
        if (!c.is_used) return 0;
        const la = c.last_active_at;
        if (!la) return 2;
        const days = Math.floor((Date.now() - new Date(la).getTime()) / 86400000);
        return days >= 7 ? 3 : 0;
      };
      return riskScore(b as AccessCode & { last_active_at?: string | null }) - riskScore(a as AccessCode & { last_active_at?: string | null });
    });

  const totalCodes  = codes.length;
  const activeCodes = codes.filter(c => c.is_used && c.expires_at && new Date(c.expires_at) > now).length;
  const unusedCodes = codes.filter(c => !c.is_used).length;
  const isOwner     = role === "owner";

  function exportCSV() {
    const headers = ["Code", "Customer Name", "Package (₱)", "Packs", "Validity (days)", "Status", "Used At", "Expires At", "Last Active", "Notes", "Created By"];
    const rows = codes.map(c => {
      let status = "Unused";
      if (c.is_used) status = c.expires_at && new Date(c.expires_at) > new Date() ? "Active" : "Expired";
      const la = (c as AccessCode & { last_active_at?: string | null }).last_active_at;
      return [c.code, c.customer_name || "", c.tier || "", c.packs || "", c.validity_days || "", status,
        c.used_at ? new Date(c.used_at).toLocaleDateString("en-PH") : "",
        c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-PH") : "",
        la ? new Date(la).toLocaleDateString("en-PH") : "",
        (c.notes || "").replace(/,/g, ";"), c.created_by || ""];
    });
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `easebrew-customers-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function copyAllExpiringMessages() {
    const expiring = codes.filter(c => {
      if (!c.is_used || !c.expires_at) return false;
      const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
      return d > 0 && d <= 7;
    });
    if (!expiring.length) return;
    const msgs = expiring.map(c => {
      const daysLeft     = Math.ceil((new Date(c.expires_at!).getTime() - now.getTime()) / 86400000);
      const expiresDate  = new Date(c.expires_at!).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
      const packageLabel = PRICE_CONFIG[c.tier]?.label ?? `₱${c.tier?.toLocaleString()} package`;
      return `Hello po ${c.customer_name || ""}!\n\nAng inyong EaseBrew ${packageLabel} ay mag-e-expire na po sa ${expiresDate} (${daysLeft} araw na lang).\n\nPara hindi mapuputol ang inyong wellness journey, mag-order na po kayo ng bagong package!\n\nKung may tanong po kayo, message lang po kayo sa inyong coach.\n\n— R&M EaseBrew Wellness Team`;
    });
    navigator.clipboard.writeText(msgs.join("\n\n---\n\n"))
      .then(() => { setBulkCopied(true); setTimeout(() => setBulkCopied(false), 3000); })
      .catch(() => {});
  }

  if (checking) return null;

  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      {confirm && <ConfirmDialog message={confirm.message} danger={confirm.danger} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <Sidebar active="/admin/codes" role={role} username={username} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── Generate Form (coach only) ── */}
        {!isOwner && (
          <div style={{ width: 320, flexShrink: 0 }}>
            <h1 className="a-page-title">Generate Code</h1>
            <p className="a-page-subtitle" style={{ marginBottom: 18 }}>Create access codes for customers</p>

            {/* Mini stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Total",  value: totalCodes,  accent: "#6366f1" },
                { label: "Active", value: activeCodes, accent: "var(--green)" },
                { label: "Unused", value: unusedCodes, accent: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ background: "white", borderRadius: 8, padding: "10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `2px solid ${s.accent}` }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--admin-font)" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-mid)", fontWeight: 700, marginTop: 2, fontFamily: "var(--admin-font)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="a-card" style={{ padding: "20px" }}>
              <h2 className="a-section-title" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 7 }}>
                <Ticket size={14} />
                New Code
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Package / Tier</label>
                  <select className="a-select" value={tier} onChange={e => setTier(Number(e.target.value))}>
                    {Object.entries(PRICE_CONFIG).map(([p, cfg]) => (
                      <option key={p} value={p}>{cfg.label} — {cfg.validityDays}d</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Coach <span style={{ color: "#ef4444" }}>*</span></label>
                  <select className={`a-select${coachError ? " a-input-err" : ""}`} value={coachName} onChange={e => { setCoachName(e.target.value); if (e.target.value) setCoachError(false); }}>
                    <option value="">— Select Coach —</option>
                    {dynamicCoaches.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {coachError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0", fontFamily: "var(--admin-font)" }}>Required</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Customer Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className={`a-input${nameError ? " a-input-err" : ""}`} type="text" value={customerName} placeholder="e.g. Nena Santos"
                    onChange={e => { setCustomerName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                  />
                  {nameError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0", fontFamily: "var(--admin-font)" }}>Required</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 5, fontFamily: "var(--admin-font)" }}>Notes / Payment <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className={`a-input${notesError ? " a-input-err" : ""}`} type="text" value={notes} placeholder="e.g. GCash, COD..."
                    onChange={e => { setNotes(e.target.value); if (e.target.value.trim()) setNotesError(false); }}
                  />
                  {notesError && <p style={{ color: "#ef4444", fontSize: 11, margin: "3px 0 0", fontFamily: "var(--admin-font)" }}>Required</p>}
                </div>

                {error && (
                  <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 7, padding: "9px 12px", color: "#9f1239", fontSize: 12, fontFamily: "var(--admin-font)" }}>
                    {error}
                  </div>
                )}

                <button onClick={handleGenerate} disabled={loading} className="a-btn a-btn-primary" style={{ width: "100%", fontWeight: 700 }}>
                  {loading ? "Generating..." : "Generate Code"}
                </button>
              </div>
            </div>

            {/* Generated code card */}
            {generatedCode && (
              <div style={{ background: "#183b28", borderRadius: 12, padding: "18px 20px", marginTop: 14, textAlign: "center", boxShadow: "0 4px 16px rgba(24,59,40,0.25)" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: "0 0 10px", fontFamily: "var(--admin-font)" }}>
                  Code Generated — send to customer:
                </p>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px", marginBottom: 12 }}>
                  <span style={{ color: "#FED255", fontSize: 22, fontWeight: 800, letterSpacing: "3px", fontFamily: "monospace" }}>{generatedCode}</span>
                </div>
                {generatedMessage && (
                  <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", marginBottom: 12, textAlign: "left" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: "0 0 5px", fontWeight: 700, fontFamily: "var(--admin-font)" }}>Ready-to-send message</p>
                    <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 12, lineHeight: 1.55, margin: 0, whiteSpace: "pre-line", fontFamily: "var(--admin-font)" }}>{generatedMessage}</p>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <button onClick={copyMessage} style={{ background: "#FED255", color: "#183b28", border: "none", borderRadius: 7, padding: "10px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--admin-font)" }}>
                    {messageCopied ? <><Check size={14} /> Copied!</> : <><ClipboardCopy size={14} /> Copy Full Message</>}
                  </button>
                  <button onClick={copyCode} style={{ background: copied ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--admin-font)" }}>
                    {copied ? "Code Copied!" : "Copy Code Only"}
                  </button>
                  {/* QR Code */}
                  <div style={{ marginTop: 4, textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: "0 0 8px", fontFamily: "var(--admin-font)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <QrCode size={12} /> QR Code — i-screenshot at i-share sa customer
                    </p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatedCode)}&bgcolor=183b28&color=FED255&qzone=2`}
                      alt={`QR Code for ${generatedCode}`}
                      width={160}
                      height={160}
                      style={{ borderRadius: 10, border: "2px solid rgba(254,210,85,0.3)" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Codes table ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Table header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h2 className="a-page-title">All Codes</h2>
              <p className="a-page-subtitle">Showing {filtered.length} of {codes.length}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "unused", "used"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`a-btn a-btn-sm ${filter === f ? "a-btn-primary" : "a-btn-ghost"}`}
                    style={{ textTransform: "capitalize" }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={exportCSV} className="a-btn a-btn-ghost a-btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Expiring banner */}
          {(() => {
            const n = codes.filter(c => {
              if (!c.is_used || !c.expires_at) return false;
              const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
              return d > 0 && d <= 7;
            }).length;
            return n > 0 ? (
              <div style={{ background: "#fffbeb", border: "1.5px solid #f59e0b", borderRadius: 9, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--admin-font)" }}>
                  <AlertTriangle size={15} color="#b45309" />
                  {n} customer{n > 1 ? "s" : ""} mag-e-expire sa loob ng 7 araw
                </span>
                <button onClick={copyAllExpiringMessages} className={`a-btn a-btn-sm ${bulkCopied ? "a-btn-ghost" : "a-btn-gold"}`} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {bulkCopied ? <><Check size={13} /> Nakopya!</> : <><MessageSquare size={13} /> Copy All Messages</>}
                </button>
              </div>
            ) : null;
          })()}

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-mid)", pointerEvents: "none" }} />
            <input className="a-input" type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or code..." style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Table */}
          <div className="a-table-wrap">
            {codesLoading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>Loading codes...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>
                {search ? `No results for "${search}"` : "No codes found."}
              </div>
            ) : (
              <table className="a-table">
                <thead>
                  <tr>
                    {["Code", "Customer", "Package", "Coach / Notes", "Used At", "Expires", "Status", "Last Active", ""].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const st       = statusInfo(c);
                    const isCopied = copiedId === c.code;
                    const isActing = actionLoadingId === c.id;
                    const daysLeft = c.expires_at ? Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000) : null;
                    return (
                      <tr key={i}>
                        <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{c.code}</td>
                        <td style={{ fontWeight: 600 }}>{c.customer_name || "—"}</td>
                        <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>₱{c.tier?.toLocaleString()} · {c.packs}pk · {c.validity_days}d</td>
                        <td style={{ maxWidth: 180 }}>
                          {editingNotesId === c.id ? (
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              <input autoFocus value={editingNotesVal} onChange={e => setEditingNotesVal(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveNotes(c.id); if (e.key === "Escape") setEditingNotesId(null); }}
                                style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--green)", fontSize: 11, outline: "none", minWidth: 0, fontFamily: "var(--admin-font)" }}
                              />
                              <button onClick={() => saveNotes(c.id)} disabled={savingNotesId === c.id}
                                style={{ background: "var(--green)", color: "white", border: "none", borderRadius: 5, padding: "4px 8px", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
                                {savingNotesId === c.id ? "..." : <Check size={11} />}
                              </button>
                              <button onClick={() => setEditingNotesId(null)}
                                style={{ background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "4px 6px", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div onClick={() => { setEditingNotesId(c.id); setEditingNotesVal(c.notes || ""); }} title="Click to edit"
                              style={{ fontSize: 12, color: "var(--ink-mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "text", padding: "4px 6px", borderRadius: 6, border: "1px solid transparent" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = "1px dashed #ccc"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = "1px solid transparent"}
                            >
                              {c.notes || <span style={{ color: "#d0d5d2", fontStyle: "italic" }}>+ add note</span>}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{c.used_at ? new Date(c.used_at).toLocaleDateString("en-PH") : "—"}</td>
                        <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                          {daysLeft !== null ? (
                            <span style={{ color: daysLeft <= 7 && daysLeft > 0 ? "#b45309" : daysLeft <= 0 ? "#dc2626" : "var(--ink-mid)", fontWeight: daysLeft <= 7 ? 600 : 400 }}>
                              {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                            </span>
                          ) : "—"}
                        </td>
                        <td><span className={st.cls}>{st.label}</span></td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {(() => {
                            const la = (c as AccessCode & { last_active_at?: string | null }).last_active_at;
                            if (!la) return <span style={{ color: "#d0d5d2", fontSize: 12 }}>—</span>;
                            const days  = Math.floor((Date.now() - new Date(la).getTime()) / 86400000);
                            const color = days <= 3 ? "#15803d" : days <= 7 ? "#b45309" : "#dc2626";
                            const label = days === 0 ? "Ngayon" : days === 1 ? "Kahapon" : `${days}d ago`;
                            return <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>;
                          })()}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            <button onClick={() => setProfileCode(c.code)}
                              className="a-btn a-btn-sm a-btn-ghost"
                              style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <User size={11} /> Profile
                            </button>
                            <button onClick={() => copyListCode(c.code)}
                              className={`a-btn a-btn-sm ${isCopied ? "a-btn-primary" : "a-btn-ghost"}`}
                              style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {isCopied ? <><Check size={11} /> Copied</> : <><ClipboardCopy size={11} /> Copy</>}
                            </button>
                            {c.is_used && c.expires_at && (() => {
                              const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
                              return d > 0 && d <= 14;
                            })() && (
                              <button onClick={() => copyReorderMessage(c)}
                                className={`a-btn a-btn-sm ${reorderCopiedId === c.id ? "a-btn-primary" : "a-btn-gold"}`}
                                style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                {reorderCopiedId === c.id ? <><Check size={11} /> Copied</> : <><RefreshCw size={11} /> Re-order</>}
                              </button>
                            )}
                            {st.label === "Active" && (
                              <button onClick={() => handleDeactivate(c.id, c.code)} disabled={isActing}
                                className="a-btn a-btn-sm a-btn-ghost"
                                style={{ color: "#b45309", borderColor: "#e6c070" }}>
                                {isActing ? "..." : "Deactivate"}
                              </button>
                            )}
                            {isOwner && st.label === "Expired" && (
                              <button onClick={() => handleReactivate(c.id, c.code)} disabled={isActing}
                                className="a-btn a-btn-sm a-btn-ghost">
                                {isActing ? "..." : "Reactivate"}
                              </button>
                            )}
                            {isOwner && (
                              <button onClick={() => handleDelete(c.id, c.code)} disabled={isActing}
                                className="a-btn a-btn-sm a-btn-danger"
                                style={{ padding: "4px 8px" }}>
                                {isActing ? "..." : <Trash2 size={12} />}
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
      {profileCode && <CustomerProfilePanel codeStr={profileCode} onClose={() => setProfileCode(null)} />}
    </div>
  );
}
