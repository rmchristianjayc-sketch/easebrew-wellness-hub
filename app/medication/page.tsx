"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { Pill, ChevronLeft, Plus, Trash2, Check, Sun, CloudSun, Sunset, Moon, CircleCheck, Lightbulb, BarChart3 } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

type Schedule = "morning" | "noon" | "evening" | "bedtime";

const SCHEDULE_META: Record<Schedule, { label: string; Icon: typeof Sun; color: string }> = {
  morning: { label: "Umaga",     Icon: Sun,      color: "#f59e0b" },
  noon:    { label: "Tanghali",  Icon: CloudSun, color: "#eab308" },
  evening: { label: "Hapon",     Icon: Sunset,   color: "#dc2626" },
  bedtime: { label: "Gabi",      Icon: Moon,     color: "#4f46e5" },
};

type Medication = {
  id: string;
  name: string;
  schedules: Schedule[];
  active: boolean;
};

type DayLog = {
  date: string;   // "YYYY-MM-DD"
  taken: string[]; // ["<medId>|<schedule>", ...]
};

type MedicationData = {
  medications: Medication[];
  logs: DayLog[];
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function MedicationPage() {
  const { checking, session } = useSessionGuard();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ name: string; schedules: Schedule[] }>({ name: "", schedules: ["morning"] });
  const [saved, setSaved] = useState(false);

  const storageKey = session ? progressStorageKey("easebrew-medication-v1", session.code) : "";

  useEffect(() => {
    if (!session || !storageKey) return;
    const data = readProgressCache<MedicationData>(storageKey, { medications: [], logs: [] });
    setMedications(data.medications);
    setLogs(data.logs);
  }, [session, storageKey]);

  function persist(nextMeds: Medication[], nextLogs: DayLog[]) {
    setMedications(nextMeds);
    setLogs(nextLogs);
    if (!storageKey) return;
    const payload: MedicationData = { medications: nextMeds, logs: nextLogs };
    writeProgressCache(storageKey, payload);
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "medication", data: payload }),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function handleAddMed(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name || form.schedules.length === 0) return;
    const med: Medication = {
      id: crypto.randomUUID(),
      name: name.slice(0, 80),
      schedules: form.schedules,
      active: true,
    };
    persist([...medications, med], logs);
    setForm({ name: "", schedules: ["morning"] });
    setShowForm(false);
  }

  function handleDeleteMed(id: string) {
    if (!confirm("Sigurado ka bang gusto mong tanggalin ang gamot na ito?")) return;
    const key = (schedule: Schedule) => `${id}|${schedule}`;
    const scheduleKeys = medications.find(m => m.id === id)?.schedules.map(key) ?? [];
    const cleanedLogs = logs.map(l => ({ ...l, taken: l.taken.filter(t => !scheduleKeys.includes(t)) }));
    persist(medications.filter(m => m.id !== id), cleanedLogs);
  }

  function toggleTaken(medId: string, schedule: Schedule) {
    const today = todayStr();
    const key = `${medId}|${schedule}`;
    const existing = logs.find(l => l.date === today);
    let nextLogs: DayLog[];
    if (!existing) {
      nextLogs = [...logs, { date: today, taken: [key] }];
    } else {
      const taken = existing.taken.includes(key)
        ? existing.taken.filter(t => t !== key)
        : [...existing.taken, key];
      nextLogs = logs.map(l => l.date === today ? { ...l, taken } : l);
    }
    persist(medications, nextLogs);
  }

  function toggleFormSchedule(s: Schedule) {
    setForm(f => ({
      ...f,
      schedules: f.schedules.includes(s) ? f.schedules.filter(x => x !== s) : [...f.schedules, s],
    }));
  }

  // Today's stats
  const today = todayStr();
  const todayLog = logs.find(l => l.date === today);
  const activeMeds = medications.filter(m => m.active);
  const totalSlotsToday = activeMeds.reduce((sum, m) => sum + m.schedules.length, 0);
  const takenToday = todayLog?.taken.length ?? 0;
  const compliancePct = totalSlotsToday > 0 ? Math.round((takenToday / totalSlotsToday) * 100) : 0;

  // 7-day compliance
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });
  const compliance7day = last7.map(date => {
    const log = logs.find(l => l.date === date);
    const taken = log?.taken.length ?? 0;
    const pct = totalSlotsToday > 0 ? Math.round((taken / totalSlotsToday) * 100) : 0;
    return { date, pct };
  });

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
      <div style={{ background: `linear-gradient(135deg, #312e81 0%, #4f46e5 100%)`, padding: "20px 24px 28px", color: "#fff" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 600, marginBottom: 18, fontFamily: "Georgia, serif" }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center" }}>
            <Pill size={28} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Libreng Tool</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Gamot Log</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "Georgia, serif" }}>Para hindi mo makalimutan ang maintenance mo</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Today's progress */}
        {activeMeds.length > 0 && (
          <div style={{ background: WHITE, borderRadius: 20, padding: "20px 22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: MID, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>Today</p>
              <span style={{ fontSize: 13, color: DARK, fontWeight: 700 }}>{takenToday}/{totalSlotsToday}</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: 999, height: 12, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${compliancePct}%`, background: `linear-gradient(90deg, ${G}, ${GOLD})`, borderRadius: 999, transition: "width 0.5s" }} />
            </div>
            <p style={{ fontSize: 14, color: compliancePct === 100 ? G : MID, fontWeight: 600, margin: 0 }}>
              {compliancePct === 100 ? "Kumpleto na! Magaling!" : compliancePct >= 50 ? "Kalahati na — ituloy lang!" : "Simulan sa unang gamot mo"}
            </p>
          </div>
        )}

        {/* Today's checklist */}
        {activeMeds.length > 0 && (
          <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><Pill size={18} /> Checklist Ngayon</h2>
            {(["morning", "noon", "evening", "bedtime"] as Schedule[]).map(schedule => {
              const meds = activeMeds.filter(m => m.schedules.includes(schedule));
              if (meds.length === 0) return null;
              const meta = SCHEDULE_META[schedule];
              return (
                <div key={schedule} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: meta.color, fontWeight: 700, margin: "0 0 8px" }}>
                    <meta.Icon size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {meta.label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {meds.map(med => {
                      const key = `${med.id}|${schedule}`;
                      const taken = todayLog?.taken.includes(key) ?? false;
                      return (
                        <button
                          key={key}
                          onClick={() => toggleTaken(med.id, schedule)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            background: taken ? "#f0fdf4" : "#f9fafb",
                            border: `2px solid ${taken ? "#86efac" : "#e5e7eb"}`,
                            borderRadius: 12,
                            cursor: "pointer",
                            textAlign: "left" as const,
                            width: "100%",
                          }}
                        >
                          <div style={{ width: 26, height: 26, borderRadius: 8, background: taken ? "#22c55e" : "#fff", border: `2px solid ${taken ? "#22c55e" : "#d1d5db"}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                            {taken && <Check size={16} color="#fff" strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 600, color: DARK, flex: 1 }}>{med.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Medication list & add form */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: 0 }}>Mga Gamot Ko</h2>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ background: G, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={16} /> Dagdag
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleAddMed} style={{ background: "#f9fafb", borderRadius: 12, padding: "16px", marginBottom: 16, border: "1.5px solid #e5e7eb" }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Pangalan ng Gamot *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="hal. Losartan 50mg" required maxLength={80} style={inputStyle} autoFocus />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>Kailan iinumin? (pumili ng lahat) *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["morning", "noon", "evening", "bedtime"] as Schedule[]).map(s => {
                    const meta = SCHEDULE_META[s];
                    const selected = form.schedules.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleFormSchedule(s)} style={{
                        padding: "10px 12px",
                        background: selected ? meta.color : "#fff",
                        color: selected ? "#fff" : DARK,
                        border: `2px solid ${selected ? meta.color : "#e5e7eb"}`,
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}>
                        <meta.Icon size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: "#f3f4f6", color: DARK, border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Kansel</button>
                <button type="submit" style={{ flex: 2, background: G, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>I-save</button>
              </div>
            </form>
          )}

          {activeMeds.length === 0 && !showForm && (
            <div style={{ textAlign: "center", padding: "20px 0", color: MID }}>
              <p style={{ fontSize: 16, margin: 0 }}>Wala pang gamot. I-dagdag ang maintenance meds mo!</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeMeds.map(med => (
              <div key={med.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f9fafb", borderRadius: 10, border: "1.5px solid #e5e7eb" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 4px" }}>{med.name}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {med.schedules.map(s => {
                      const meta = SCHEDULE_META[s];
                      return (
                        <span key={s} style={{ fontSize: 11, color: meta.color, background: `${meta.color}15`, borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>
                          <meta.Icon size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {meta.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => handleDeleteMed(med.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", padding: 4 }} aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day compliance */}
        {activeMeds.length > 0 && (
          <div style={{ background: WHITE, borderRadius: 20, padding: "22px", border: "1.5px solid #D8CDBA" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={18} /> Weekly na Record</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {compliance7day.reverse().map((day, i) => {
                const dayName = ["Lin","Lun","Mar","Miy","Huw","Biy","Sab"][new Date(day.date + "T00:00:00").getDay()];
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: 60, background: "#f3f4f6", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{ height: `${day.pct}%`, background: day.pct >= 80 ? G : day.pct >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 8, transition: "height 0.5s", minHeight: day.pct > 0 ? 4 : 0 }} />
                    </div>
                    <span style={{ fontSize: 10, color: MID, fontWeight: 600 }}>{dayName}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: day.pct >= 80 ? G : MID }}>{day.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {saved && (
          <div style={{ background: "#dcfce7", color: "#166534", borderRadius: 12, padding: "12px 16px", marginTop: 16, fontSize: 14, fontWeight: 600, textAlign: "center" }}>
            <CircleCheck size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Na-save na!
          </div>
        )}

        {/* Tip */}
        <div style={{ background: `${GOLD}22`, borderRadius: 12, padding: "14px 16px", marginTop: 16, border: `1.5px solid ${GOLD}` }}>
          <p style={{ fontSize: 13, color: DARK, margin: 0, lineHeight: 1.5 }}>
            <Lightbulb size={14} style={{ display: "inline", verticalAlign: "middle" }} /> <strong>Tip:</strong> Mag-set ng alarm sa phone para sa oras ng gamot. Ang EaseBrew ay kasama rin sa checklist mo para consistent ka araw-araw.
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
