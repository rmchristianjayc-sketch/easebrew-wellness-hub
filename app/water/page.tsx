"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { Droplets, Plus, Minus, ChevronLeft, RotateCcw } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";
const BLUE  = "#0ea5e9";

const DAILY_GOAL = 8;

type DayLog = { date: string; glasses: number };

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fil-PH", { month: "short", day: "numeric" });
}

function getDayName(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const names = ["Lin", "Lun", "Mar", "Miy", "Huw", "Biy", "Sab"];
  return names[d.getDay()];
}

export default function WaterTrackerPage() {
  const { checking, session } = useSessionGuard();
  const [logs, setLogs]       = useState<DayLog[]>([]);
  const [saved, setSaved]     = useState(false);

  const storageKey = session ? progressStorageKey("easebrew-water-v1", session.code) : "";

  useEffect(() => {
    if (!session || !storageKey) return;
    const cached = readProgressCache<DayLog[]>(storageKey, []);
    // ensure today exists
    const today = getTodayStr();
    if (!cached.find(l => l.date === today)) {
      const updated = [...cached, { date: today, glasses: 0 }];
      setLogs(updated);
    } else {
      setLogs(cached);
    }
  }, [session, storageKey]);

  function save(updated: DayLog[]) {
    if (!storageKey) return;
    writeProgressCache(storageKey, updated);
    setLogs(updated);
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "water", data: { logs: updated } }),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const today    = getTodayStr();
  const todayLog = logs.find(l => l.date === today) ?? { date: today, glasses: 0 };
  const glasses  = todayLog.glasses;
  const pct      = Math.min((glasses / DAILY_GOAL) * 100, 100);
  const done     = glasses >= DAILY_GOAL;

  function add(n: number) {
    const newVal  = Math.max(0, Math.min(glasses + n, 20));
    const updated = logs.some(l => l.date === today)
      ? logs.map(l => l.date === today ? { ...l, glasses: newVal } : l)
      : [...logs, { date: today, glasses: newVal }];
    save(updated);
  }

  function reset() {
    const updated = logs.map(l => l.date === today ? { ...l, glasses: 0 } : l);
    save(updated);
  }

  const last7 = getLast7Days();

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p className="c-body" style={{ color: G, fontWeight: 600 }}>☕ Loading...</p>
    </div>
  );

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0c3a6e 0%, #1565a0 100%)`, padding: "20px 24px 28px", color: "#fff" }}>
        <Link href="/" className="c-back-bar" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 600, marginBottom: 18 }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(14,165,233,0.25)", border: "1.5px solid rgba(14,165,233,0.4)", display: "grid", placeItems: "center" }}>
            <Droplets size={28} color="#7dd3fc" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(125,211,252,0.8)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Daily Wellness</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Water Intake Tracker</h1>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 20px" }}>

        {/* Today's goal card */}
        <div style={{
          background: WHITE, borderRadius: 24, padding: "28px 24px", marginBottom: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: done ? `2.5px solid ${BLUE}` : "2px solid #D8CDBA",
        }}>
          {done && (
            <div style={{ background: "#e0f2fe", borderRadius: 12, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>🎉</span>
              <p style={{ color: "#0369a1", fontWeight: 700, fontSize: 16, margin: 0 }}>Naabot mo na ang goal ngayon! Ang galing!</p>
            </div>
          )}

          <p style={{ fontSize: 16, color: MID, margin: "0 0 6px", fontWeight: 600, textAlign: "center" }}>Ngayon</p>
          <p style={{ fontSize: 72, fontWeight: 900, color: BLUE, margin: "0 0 4px", textAlign: "center", lineHeight: 1 }}>{glasses}</p>
          <p style={{ fontSize: 18, color: MID, margin: "0 0 24px", textAlign: "center" }}>
            sa <strong style={{ color: DARK }}>{DAILY_GOAL}</strong> baso ng tubig
          </p>

          {/* Water fill visual */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {Array.from({ length: DAILY_GOAL }, (_, i) => (
                <div key={i} onClick={() => save(
                  logs.map(l => l.date === today ? { ...l, glasses: i + 1 } : l)
                )} style={{
                  width: 44, height: 56, borderRadius: 12,
                  background: i < glasses ? `linear-gradient(180deg, #7dd3fc 0%, ${BLUE} 100%)` : "#e0f2fe",
                  border: i < glasses ? `2px solid ${BLUE}` : "2px solid #bae6fd",
                  cursor: "pointer", transition: "all 0.2s",
                  position: "relative", overflow: "hidden",
                }}>
                  {i < glasses && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Droplets size={18} color="white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ height: 10, background: "#e0f2fe", borderRadius: 999, marginTop: 16, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, #7dd3fc, ${BLUE})`, borderRadius: 999, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ textAlign: "center", fontSize: 14, color: MID, marginTop: 8 }}>{Math.round(pct)}% ng daily goal</p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => add(-1)} style={{
              width: 62, height: 62, borderRadius: "50%", border: "2.5px solid #bae6fd",
              background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Minus size={24} color={BLUE} strokeWidth={2.5} />
            </button>

            <button onClick={() => add(1)} style={{
              flex: 1, height: 62, borderRadius: 18,
              background: done ? `linear-gradient(135deg, #0ea5e9, #0284c7)` : `linear-gradient(135deg, #38bdf8, ${BLUE})`,
              border: "none", cursor: "pointer", color: "#fff",
              fontSize: 18, fontWeight: 900, fontFamily: "Georgia, serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(14,165,233,0.3)",
            }}>
              <Plus size={22} strokeWidth={2.5} />
              +1 Baso ng Tubig
            </button>

            <button onClick={reset} title="I-reset" style={{
              width: 62, height: 62, borderRadius: "50%", border: "2.5px solid #D8CDBA",
              background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <RotateCcw size={20} color={MID} strokeWidth={2} />
            </button>
          </div>

          {saved && (
            <p style={{ textAlign: "center", color: G, fontWeight: 700, fontSize: 15, marginTop: 14 }}>✅ Na-save!</p>
          )}
        </div>

        {/* Tips */}
        <div style={{ background: "#e0f2fe", borderRadius: 18, padding: "18px 20px", marginBottom: 24, border: "1.5px solid #bae6fd" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0369a1", margin: "0 0 8px" }}>💧 Bakit Mahalaga ang Tubig?</p>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#0c4a6e", fontSize: 15, lineHeight: 1.8 }}>
            <li>Nagpapalabas ng toxins sa katawan</li>
            <li>Nagpapababa ng joint inflammation</li>
            <li>Nagpapalakás ng epekto ng EaseBrew</li>
            <li>Nakakatulong sa digestion at energy</li>
          </ul>
        </div>

        {/* 7-day history */}
        <h2 className="c-heading" style={{ color: G, marginBottom: 14 }}>Nakaraang 7 Araw 📅</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {last7.map(dateStr => {
            const log      = logs.find(l => l.date === dateStr);
            const g        = log?.glasses ?? 0;
            const isToday  = dateStr === today;
            const achieved = g >= DAILY_GOAL;
            const barPct   = Math.min((g / DAILY_GOAL) * 100, 100);
            return (
              <div key={dateStr} style={{
                background: WHITE, borderRadius: 14, padding: "14px 18px",
                border: isToday ? `2px solid ${BLUE}` : "1.5px solid #D8CDBA",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 40, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: MID, fontWeight: 700, textTransform: "uppercase" }}>{getDayName(dateStr)}</div>
                  <div style={{ fontSize: 13, color: isToday ? BLUE : DARK, fontWeight: 700 }}>{formatDateLabel(dateStr)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 10, background: "#e0f2fe", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${barPct}%`, background: achieved ? `linear-gradient(90deg, #7dd3fc, ${BLUE})` : "#93c5fd", borderRadius: 999, transition: "width 0.3s" }} />
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: achieved ? BLUE : MID }}>{g}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>/{DAILY_GOAL}</span>
                  {achieved && <span style={{ fontSize: 18 }}>✅</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* EaseBrew tip */}
        <div style={{ background: G, borderRadius: 18, padding: "20px", marginTop: 24, textAlign: "center" }}>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>☕ Pro Tip!</p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, margin: "0 0 16px", lineHeight: 1.7 }}>
            Inumin ang EaseBrew kasabay ng tubig para mas mabilis ang resulta. Ang tubig ay nagpapalabas ng toxins habang gumagana ang EaseBrew!
          </p>
          <Link href="/" style={{ background: GOLD, color: G, borderRadius: 12, padding: "14px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Bumalik sa Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
