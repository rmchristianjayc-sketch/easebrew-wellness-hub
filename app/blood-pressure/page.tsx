"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { Heart, ChevronLeft, Plus, Trash2, CircleCheck, Lightbulb, ClipboardList, TrendingUp, TrendingDown, Minus, Printer, AlertTriangle, Phone } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

type BpEntry = {
  id: string;
  date: string;      // ISO date "YYYY-MM-DD"
  time: string;      // "HH:MM"
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
};

type BpCategory = {
  label: string;
  color: string;
  bg: string;
  advice: string;
};

function categorize(sys: number, dia: number): BpCategory {
  if (sys >= 180 || dia >= 120) {
    return {
      label: "Hypertensive Crisis",
      color: "#7f1d1d",
      bg: "#fee2e2",
      advice: "EMERGENCY: Napakataas ng BP mo. Tumawag agad ng 911 o pumunta sa pinakamalapit na ospital. Huwag maghintay — pwedeng may stroke o heart attack.",
    };
  }
  if (sys >= 140 || dia >= 90) {
    return {
      label: "Stage 2 Hypertension",
      color: "#991b1b",
      bg: "#fef2f2",
      advice: "Mataas ang BP mo. Magpakonsulta sa doctor sa loob ng ilang araw. I-monitor araw-araw at i-record.",
    };
  }
  if (sys >= 130 || dia >= 80) {
    return {
      label: "Stage 1 Hypertension",
      color: "#9a3412",
      bg: "#fff7ed",
      advice: "Medyo tumataas na. Konsultahin ang doctor mo. Bawasan ang asin (< 1500mg/araw), mag-exercise 30 min/araw, at iwasan ang stress.",
    };
  }
  if (sys >= 120) {
    return {
      label: "Elevated",
      color: "#854d0e",
      bg: "#fef9c3",
      advice: "Konting taas — early warning. Ituloy ang healthy lifestyle at obserbahan ang BP mo weekly.",
    };
  }
  return {
    label: "Normal",
    color: "#166534",
    bg: "#dcfce7",
    advice: "Normal ang BP mo. Ituloy ang malusog na pamumuhay!",
  };
}

function nowDateTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function BloodPressurePage() {
  const { checking, session } = useSessionGuard();
  const [entries, setEntries] = useState<BpEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => {
    const { date, time } = nowDateTime();
    return { date, time, systolic: "", diastolic: "", pulse: "", notes: "" };
  });
  const [saved, setSaved] = useState(false);

  const storageKey = session ? progressStorageKey("easebrew-bp-v1", session.code) : "";

  useEffect(() => {
    if (!session || !storageKey) return;
    setEntries(readProgressCache<BpEntry[]>(storageKey, []));
  }, [session, storageKey]);

  // Debounced sync with latest-write-wins so rapid deletes/adds don't
  // arrive at the server out of order and overwrite each other.
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingEntriesRef = useRef<BpEntry[] | null>(null);

  function persist(next: BpEntry[]) {
    setEntries(next);
    if (!storageKey) return;
    writeProgressCache(storageKey, next);
    pendingEntriesRef.current = next;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      const snapshot = pendingEntriesRef.current;
      pendingEntriesRef.current = null;
      if (!snapshot) return;
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blood_pressure", data: { entries: snapshot } }),
      }).catch(() => {});
    }, 500);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  // Flush on unmount so the last edit isn't lost by quick navigation.
  useEffect(() => () => {
    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
      const snapshot = pendingEntriesRef.current;
      pendingEntriesRef.current = null;
      if (snapshot) {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "blood_pressure", data: { entries: snapshot } }),
        }).catch(() => {});
      }
    }
  }, []);

  const [crisisAlert, setCrisisAlert] = useState<{ systolic: number; diastolic: number } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sys = parseInt(form.systolic, 10);
    const dia = parseInt(form.diastolic, 10);
    if (!Number.isFinite(sys) || sys < 60 || sys > 260) return;
    if (!Number.isFinite(dia) || dia < 40 || dia > 200) return;
    const pulse = form.pulse ? parseInt(form.pulse, 10) : undefined;
    const entry: BpEntry = {
      id: crypto.randomUUID(),
      date: form.date,
      time: form.time,
      systolic: sys,
      diastolic: dia,
      pulse: pulse && Number.isFinite(pulse) ? pulse : undefined,
      notes: form.notes.trim() || undefined,
    };
    const next = [entry, ...entries].sort((a, b) =>
      (b.date + b.time).localeCompare(a.date + a.time)
    );
    persist(next);
    setShowForm(false);
    const { date, time } = nowDateTime();
    setForm({ date, time, systolic: "", diastolic: "", pulse: "", notes: "" });

    // Hypertensive Crisis alert
    if (sys >= 180 || dia >= 120) {
      setEmergencyPhone(readEmergencyPhone());
      setCrisisAlert({ systolic: sys, diastolic: dia });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          // Keep the notification body generic — the phone may be locked
          // and anyone glancing at the preview shouldn't see the exact BP
          // reading. The actual numbers are shown in the in-app modal.
          new Notification("⚠️ EaseBrew Emergency", {
            body: "Mataas ang BP mo. Buksan ang app agad.",
            icon: "/icons/icon-192.png",
            requireInteraction: true,
          });
        } catch {}
      }
    }
  }

  // Read emergency contact on-demand from medical card so recent edits
  // (adding/updating a contact after opening this page) are seen.
  function readEmergencyPhone(): string {
    if (!session?.code) return "";
    try {
      const mcKey = progressStorageKey("easebrew-medical-card-v1", session.code);
      const raw = localStorage.getItem(mcKey);
      if (!raw) return "";
      const mc = JSON.parse(raw);
      const primary = Array.isArray(mc?.emergencyContacts)
        ? mc.emergencyContacts.find((c: { phone?: string }) => c?.phone)
        : null;
      if (!primary?.phone) return "";
      // Preserve leading +, digits only; strip extensions ("x123", "ext")
      const cleaned = String(primary.phone)
        .split(/x|ext/i)[0]
        .replace(/[^0-9+]/g, "");
      return cleaned;
    } catch { return ""; }
  }
  const [emergencyPhone, setEmergencyPhone] = useState<string>("");

  const [undoState, setUndoState] = useState<{ entry: BpEntry; timerId: number } | null>(null);
  function handleDelete(id: string) {
    const target = entries.find(e => e.id === id);
    if (!target) return;
    const next = entries.filter(e => e.id !== id);
    persist(next);
    // Fire-and-forget the previous undo — user chose to delete another
    // item, so we commit the previous delete instead of silently losing
    // the ability to undo it later.
    if (undoState) clearTimeout(undoState.timerId);
    const timerId = window.setTimeout(() => setUndoState(null), 5000);
    setUndoState({ entry: target, timerId });
  }
  function handleUndoDelete() {
    if (!undoState) return;
    clearTimeout(undoState.timerId);
    const next = [...entries, undoState.entry].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    persist(next);
    setUndoState(null);
  }

  // Weekly average — compute cutoff on mount so Date.now() is not called during render
  // Lazy initializer so the very first render already has correct cutoffs
  // (previously they were 0 on mount, which briefly included ALL historical
  // entries in the weekly stats before the useEffect ran).
  const [cutoff7d]  = useState<number>(() => Date.now() - 7  * 86400000);
  const [cutoff14d] = useState<number>(() => Date.now() - 14 * 86400000);
  const last7Days = entries.filter(e => {
    const d = new Date(e.date + "T00:00:00").getTime();
    return d >= cutoff7d;
  });
  const prev7Days = entries.filter(e => {
    const d = new Date(e.date + "T00:00:00").getTime();
    return d >= cutoff14d && d < cutoff7d;
  });
  const weekAvgSys = last7Days.length
    ? Math.round(last7Days.reduce((s, e) => s + e.systolic, 0) / last7Days.length)
    : null;
  const weekAvgDia = last7Days.length
    ? Math.round(last7Days.reduce((s, e) => s + e.diastolic, 0) / last7Days.length)
    : null;
  const prevAvgSys = prev7Days.length
    ? Math.round(prev7Days.reduce((s, e) => s + e.systolic, 0) / prev7Days.length)
    : null;
  const weekCategory = weekAvgSys != null && weekAvgDia != null
    ? categorize(weekAvgSys, weekAvgDia)
    : null;
  const trend: "up" | "down" | "flat" | null =
    weekAvgSys != null && prevAvgSys != null
      ? weekAvgSys - prevAvgSys >= 3 ? "up"
      : prevAvgSys - weekAvgSys >= 3 ? "down"
      : "flat"
      : null;

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: G, fontWeight: 600, fontFamily: "Georgia, serif", fontSize: 18 }}>Sandali lang...</p>
      </div>
    );
  }

  // Read patient name from medical card so the print output has a header
  // that identifies the customer (a doctor gets pages of readings with
  // no patient identifier otherwise).
  const patientName = (() => {
    if (!session?.code) return "";
    try {
      const mcKey = progressStorageKey("easebrew-medical-card-v1", session.code);
      const raw = localStorage.getItem(mcKey);
      if (!raw) return "";
      const mc = JSON.parse(raw);
      return typeof mc?.fullName === "string" ? mc.fullName : "";
    } catch { return ""; }
  })();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 60 }}>
      {/* Print-only header (identifies patient on printed page) */}
      <div className="c-print-only" style={{ padding: "12px 20px", borderBottom: "2px solid #000" }}>
        <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Blood Pressure Log</p>
        {patientName && <p style={{ fontSize: 14, margin: "4px 0 0" }}>Pasyente: <strong>{patientName}</strong></p>}
        <p style={{ fontSize: 12, margin: "4px 0 0", color: "#555" }}>Na-print: {new Date().toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Hypertensive Crisis modal */}
      {crisisAlert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", maxWidth: 420, width: "100%", border: "5px solid #dc2626", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fee2e2", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <AlertTriangle size={40} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#7f1d1d", margin: "0 0 6px", fontFamily: "Georgia, serif" }}>EMERGENCY!</h2>
              <p style={{ fontSize: 40, fontWeight: 900, color: "#dc2626", margin: "0 0 10px" }}>{crisisAlert.systolic}/{crisisAlert.diastolic}</p>
              <p style={{ fontSize: 16, color: DARK, margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
                Napakataas ng BP mo. Pwedeng may stroke o heart attack. Tumawag agad ng tulong!
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="tel:911" style={{ background: "#dc2626", color: "#fff", padding: "18px", borderRadius: 14, fontSize: 20, fontWeight: 900, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 60 }}>
                <Phone size={20} /> Tumawag ng 911
              </a>
              {emergencyPhone && (
                <a href={`tel:${emergencyPhone}`} style={{ background: G, color: "#fff", padding: "16px", borderRadius: 14, fontSize: 18, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 54 }}>
                  Tawagin ang Emergency Contact
                </a>
              )}
              <button onClick={() => setCrisisAlert(null)} style={{ background: "#fff", color: DARK, padding: "16px", border: "2px solid #d1d5db", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", minHeight: 56 }}>
                Isara (mali ang na-type ko)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)`, padding: "20px 24px 28px", color: "#fff" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 600, marginBottom: 18, fontFamily: "Georgia, serif" }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center" }}>
            <Heart size={28} color="#fff" strokeWidth={2} fill="#fca5a5" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Libreng Tool</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Blood Pressure Log</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "Georgia, serif" }}>I-track ang BP mo para sa mas malusog na katawan</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Weekly summary */}
        {weekCategory && weekAvgSys != null && weekAvgDia != null && (
          <div style={{ background: weekCategory.bg, borderRadius: 20, padding: "20px 22px", marginBottom: 20, border: `2.5px solid ${weekCategory.color}33` }}>
            <p style={{ fontSize: 12, color: weekCategory.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>7-Day Average</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: weekCategory.color, lineHeight: 1 }}>{weekAvgSys}/{weekAvgDia}</span>
              <span style={{ fontSize: 15, color: MID, fontWeight: 600 }}>mmHg</span>
              {trend && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginLeft: 6,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: trend === "up" ? "#fee2e2" : trend === "down" ? "#dcfce7" : "#f3f4f6",
                    color: trend === "up" ? "#991b1b" : trend === "down" ? "#166534" : "#4b5563",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                  aria-label={trend === "up" ? "Tumataas" : trend === "down" ? "Bumababa" : "Pareho"}
                >
                  {trend === "up" && <><TrendingUp size={14} /> Tumataas</>}
                  {trend === "down" && <><TrendingDown size={14} /> Bumababa</>}
                  {trend === "flat" && <><Minus size={14} /> Pareho</>}
                </span>
              )}
            </div>
            <p style={{ fontSize: 15, color: weekCategory.color, fontWeight: 700, margin: "0 0 6px" }}>{weekCategory.label}</p>
            <p style={{ fontSize: 14, color: DARK, margin: 0, lineHeight: 1.55 }}>{weekCategory.advice}</p>
            {trend && prev7Days.length > 0 && (
              <p style={{ fontSize: 13, color: DARK, margin: "8px 0 0", lineHeight: 1.5, fontWeight: 600 }}>
                {trend === "up" && "Tumataas ang BP mo vs nakaraang linggo. Bantayan mabuti at magpakonsulta sa doctor kung tuloy-tuloy ang pagtaas."}
                {trend === "down" && "Magaling! Bumababa ang BP mo vs nakaraang linggo. Ituloy lang ang malusog na pamumuhay."}
                {trend === "flat" && "Pareho ang BP mo vs nakaraang linggo. Ituloy ang daily tracking."}
              </p>
            )}
            <p style={{ fontSize: 12, color: MID, margin: "10px 0 0" }}>Base sa {last7Days.length} readings sa nakaraang 7 araw</p>
          </div>
        )}

        {/* Add reading button */}
        {!showForm && (
          <>
          {entries.length > 0 && (
            <button
              onClick={() => window.print()}
              className="c-no-print"
              style={{ width: "100%", background: GOLD, color: G, border: `2px solid ${G}`, borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}
            >
              <Printer size={18} /> I-print para sa Doctor
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="c-no-print"
            style={{
              width: "100%",
              background: G,
              color: "#fff",
              border: "none",
              borderRadius: 16,
              padding: "18px",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Plus size={20} /> Magdagdag ng Reading
          </button>
          </>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 16px" }}>Bagong Reading</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Petsa</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Oras</label>
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 15, color: DARK, fontWeight: 700, display: "block", marginBottom: 4 }}>BP sa Taas (malaking number) *</label>
                <p style={{ fontSize: 12, color: MID, margin: "0 0 6px", lineHeight: 1.35 }}>Ang <strong>malaking number</strong> sa BP monitor mo</p>
                <input type="number" inputMode="numeric" min={60} max={260} value={form.systolic} onChange={e => setForm({ ...form, systolic: e.target.value })} placeholder="hal. 120" required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 15, color: DARK, fontWeight: 700, display: "block", marginBottom: 4 }}>BP sa Baba (maliit na number) *</label>
                <p style={{ fontSize: 12, color: MID, margin: "0 0 6px", lineHeight: 1.35 }}>Ang <strong>maliit na number</strong> sa BP monitor mo</p>
                <input type="number" inputMode="numeric" min={40} max={200} value={form.diastolic} onChange={e => setForm({ ...form, diastolic: e.target.value })} placeholder="hal. 80" required style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Pulse rate (opsyonal)</label>
              <input type="number" inputMode="numeric" min={30} max={220} value={form.pulse} onChange={e => setForm({ ...form, pulse: e.target.value })} placeholder="tibok bawat minuto" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Notes (opsyonal)</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="hal. Bago mag-almusal" maxLength={200} style={inputStyle} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: "#f3f4f6", color: DARK, border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                Kansel
              </button>
              <button type="submit" style={{ flex: 2, background: G, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                I-save
              </button>
            </div>
          </form>
        )}

        {saved && (
          <div className="c-toast c-no-print">
            <CircleCheck size={22} /> Naka-save na!
          </div>
        )}

        {undoState && (
          <div className="c-toast c-no-print" style={{ background: "#1B201A" }}>
            <span>Na-delete. Gusto mo bang ibalik?</span>
            <button onClick={handleUndoDelete} style={{ background: GOLD, color: G, border: "none", padding: "8px 16px", borderRadius: 999, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              I-undo
            </button>
          </div>
        )}

        {/* Recent readings */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", border: "1.5px solid #D8CDBA" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><ClipboardList size={18} /> Mga Reading</h2>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 20px", color: MID }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#fce7f3", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Heart size={44} color="#be185d" />
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 6px" }}>Simulan mo dito</p>
              <p style={{ fontSize: 15, margin: 0, lineHeight: 1.55 }}>Sukatin ang BP mo, i-tap ang <strong>Magdagdag ng Reading</strong> button sa itaas para i-log.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {entries.slice(0, 30).map(entry => {
                const cat = categorize(entry.systolic, entry.diastolic);
                return (
                  <div key={entry.id} style={{ background: cat.bg, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${cat.color}22`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: cat.color }}>{entry.systolic}/{entry.diastolic}</span>
                        {entry.pulse && (
                          <span style={{ fontSize: 13, color: MID, fontWeight: 600 }}>· {entry.pulse} bpm</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: cat.color, margin: "0 0 2px", fontWeight: 700 }}>{cat.label}</p>
                      <p style={{ fontSize: 12, color: MID, margin: 0 }}>
                        {formatDateLabel(entry.date)} · {entry.time}
                        {entry.notes ? ` · ${entry.notes}` : ""}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(entry.id)} style={{ background: "#fef2f2", border: "1.5px solid #fecaca", cursor: "pointer", color: "#991b1b", padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700, minHeight: 48, minWidth: 48, display: "flex", alignItems: "center", gap: 6 }} aria-label="Tanggalin ang reading na ito">
                      <Trash2 size={16} /> Tanggalin
                    </button>
                  </div>
                );
              })}
              {entries.length > 30 && (
                <p style={{ fontSize: 12, color: MID, textAlign: "center", margin: "8px 0 0" }}>
                  Pinapakita ang 30 pinakabago. Lahat: {entries.length} readings.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Educational note */}
        <div style={{ background: `${GOLD}22`, borderRadius: 12, padding: "14px 16px", marginTop: 16, border: `1.5px solid ${GOLD}` }}>
          <p style={{ fontSize: 13, color: DARK, margin: 0, lineHeight: 1.5 }}>
            <Lightbulb size={14} style={{ display: "inline", verticalAlign: "middle" }} /> <strong>Tip:</strong> Sukatin ang BP habang nakaupo at relaxed, hindi pagkatapos uminom ng kape. Pinakamabuting oras: umaga bago mag-almusal.
          </p>
        </div>

        {/* Medical disclaimer */}
        <div style={{ marginTop: 14, padding: "12px 14px", background: "#f3f4f6", borderRadius: 10, border: "1px solid #d1d5db" }}>
          <p style={{ fontSize: 12, color: MID, margin: 0, lineHeight: 1.5 }}>
            <strong>Paalala:</strong> Ang tool na ito ay para sa self-monitoring lang, hindi kapalit ng medical advice. Palaging magpakonsulta sa doctor para sa diagnosis at treatment.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: 16,
  border: "1.5px solid #D8CDBA",
  borderRadius: 10,
  background: "#fff",
  color: DARK,
  fontFamily: "inherit",
};
