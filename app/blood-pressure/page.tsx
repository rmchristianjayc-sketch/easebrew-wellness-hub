"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { Heart, ChevronLeft, Plus, Trash2, CircleCheck, Lightbulb, ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";

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

  function persist(next: BpEntry[]) {
    setEntries(next);
    if (!storageKey) return;
    writeProgressCache(storageKey, next);
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "blood_pressure", data: { entries: next } }),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

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
  }

  function handleDelete(id: string) {
    if (!confirm("Sigurado ka bang gusto mong burahin ito?")) return;
    persist(entries.filter(e => e.id !== id));
  }

  // Weekly average — compute cutoff on mount so Date.now() is not called during render
  const [cutoff7d, setCutoff7d] = useState<number>(0);
  const [cutoff14d, setCutoff14d] = useState<number>(0);
  useEffect(() => {
    setCutoff7d(Date.now() - 7 * 86400000);
    setCutoff14d(Date.now() - 14 * 86400000);
  }, []);
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
        <p style={{ color: G, fontWeight: 600, fontFamily: "Georgia, serif", fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 60 }}>
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
            <p style={{ fontSize: 12, color: MID, margin: "10px 0 0" }}>Base sa {last7Days.length} readings sa nakaraang 7 araw</p>
          </div>
        )}

        {/* Add reading button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
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
                <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Systolic (taas) *</label>
                <input type="number" inputMode="numeric" min={60} max={260} value={form.systolic} onChange={e => setForm({ ...form, systolic: e.target.value })} placeholder="e.g. 120" required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Diastolic (baba) *</label>
                <input type="number" inputMode="numeric" min={40} max={200} value={form.diastolic} onChange={e => setForm({ ...form, diastolic: e.target.value })} placeholder="e.g. 80" required style={inputStyle} />
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
                Save
              </button>
            </div>
          </form>
        )}

        {saved && (
          <div style={{ background: "#dcfce7", color: "#166534", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <CircleCheck size={16} /> Na-save na!
          </div>
        )}

        {/* Recent readings */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", border: "1.5px solid #D8CDBA" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><ClipboardList size={18} /> Mga Reading</h2>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: MID }}>
              <p style={{ fontSize: 16, margin: 0 }}>Wala pa. Mag-add ng unang reading mo!</p>
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
                    <button onClick={() => handleDelete(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", padding: 4 }} aria-label="Delete">
                      <Trash2 size={16} />
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
