"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache } from "@/lib/progressStorage";
import { ChevronLeft, FileText, Droplets, Activity, Scale, Apple } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";
const BLUE  = "#0ea5e9";

type DayLog = { date: string; glasses: number };
type CheckIn = { date: string; weight?: number; energy?: number; pain?: number; notes?: string };

function getWeekDates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fil-PH", { weekday: "short", month: "short", day: "numeric" });
}

function ScoreBar({ score, max = 10, color }: { score: number; max?: number; color: string }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.5s" }} />
    </div>
  );
}

export default function WeeklyReportPage() {
  const { checking, session } = useSessionGuard();
  const [waterLogs,   setWaterLogs]   = useState<DayLog[]>([]);
  const [checkIns,    setCheckIns]    = useState<CheckIn[]>([]);
  const weekDates = getWeekDates();

  useEffect(() => {
    if (!session) return;
    const wKey = progressStorageKey("easebrew-water-v1", session.code);
    const tKey = progressStorageKey("easebrew-tracker-v1", session.code);
    setWaterLogs(readProgressCache<DayLog[]>(wKey, []));
    setCheckIns(readProgressCache<CheckIn[]>(tKey, []));
  }, [session]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G, fontWeight: 600, fontFamily: "Georgia, serif", fontSize: 18 }}>☕ Loading...</p>
    </div>
  );

  // Water stats
  const weekWaterLogs = weekDates.map(d => ({ date: d, glasses: waterLogs.find(l => l.date === d)?.glasses ?? 0 }));
  const totalGlasses  = weekWaterLogs.reduce((s, l) => s + l.glasses, 0);
  const daysGoalMet   = weekWaterLogs.filter(l => l.glasses >= 8).length;
  const avgGlasses    = Math.round((totalGlasses / 7) * 10) / 10;

  // Check-in stats
  const weekCheckIns = weekDates.map(d => checkIns.find(c => c.date === d));
  const checkedDays  = weekCheckIns.filter(Boolean).length;
  const avgEnergy    = (() => {
    const vals = weekCheckIns.filter(c => c?.energy != null).map(c => c!.energy!);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
  })();
  const avgPain = (() => {
    const vals = weekCheckIns.filter(c => c?.pain != null).map(c => c!.pain!);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
  })();

  // Wellness score (0–100)
  const waterScore   = Math.round((daysGoalMet / 7) * 35);
  const trackerScore = Math.round((checkedDays / 7) * 25);
  const energyScore  = avgEnergy != null ? Math.round((avgEnergy / 10) * 20) : 0;
  const painScore    = avgPain != null ? Math.round(((10 - avgPain) / 10) * 20) : 0;
  const totalScore   = waterScore + trackerScore + energyScore + painScore;

  const scoreLabel = totalScore >= 80 ? { text: "Napakagaling! 🏆", color: G, bg: "#dcfce7" }
    : totalScore >= 60 ? { text: "Magaling! ✅", color: "#1d4ed8", bg: "#eff6ff" }
    : totalScore >= 40 ? { text: "Pwede pa! 💪", color: "#92400e", bg: "#fef9e7" }
    : { text: "Kailangan ng improvement ⚠️", color: "#991b1b", bg: "#fef2f2" };

  const weekStart = formatDate(weekDates[0]);
  const weekEnd   = formatDate(weekDates[6]);

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1B201A 0%, #39613B 100%)`, padding: "20px 24px 28px", color: "#fff" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 600, marginBottom: 18, fontFamily: "Georgia, serif" }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(254,210,85,0.2)", border: "1.5px solid rgba(254,210,85,0.35)", display: "grid", placeItems: "center" }}>
            <FileText size={28} color={GOLD} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(254,210,85,0.8)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Weekly Summary</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Wellness Report</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "4px 0 0", fontFamily: "Georgia, serif" }}>{weekStart} – {weekEnd}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 20px" }}>

        {/* Overall Score */}
        <div style={{ background: scoreLabel.bg, border: `2.5px solid ${scoreLabel.color}33`, borderRadius: 24, padding: "24px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: scoreLabel.color, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>Overall Wellness Score</p>
          <div style={{ fontSize: 80, fontWeight: 900, color: scoreLabel.color, lineHeight: 1, margin: "0 0 6px" }}>{totalScore}</div>
          <div style={{ fontSize: 11, color: MID, marginBottom: 14 }}>sa 100 puntos</div>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 12, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", width: `${totalScore}%`, background: `linear-gradient(90deg, ${scoreLabel.color}99, ${scoreLabel.color})`, borderRadius: 999, transition: "width 0.8s ease" }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: scoreLabel.color, margin: 0 }}>{scoreLabel.text}</p>
        </div>

        {/* Score breakdown */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
          <h2 className="c-heading" style={{ color: DARK, marginBottom: 18 }}>📊 Score Breakdown</h2>
          {[
            { label: "Water Goal (35pts)", score: waterScore, max: 35, color: BLUE, detail: `${daysGoalMet}/7 araw ang na-achieve` },
            { label: "Daily Check-ins (25pts)", score: trackerScore, max: 25, color: G, detail: `${checkedDays}/7 araw na nag-log` },
            { label: "Energy Level (20pts)", score: energyScore, max: 20, color: "#f59e0b", detail: avgEnergy != null ? `Avg: ${avgEnergy}/10` : "Walang data" },
            { label: "Pain Level (20pts)", score: painScore, max: 20, color: "#ef4444", detail: avgPain != null ? `Avg pain: ${avgPain}/10 (mas mababa = mas ok)` : "Walang data" },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.score}/{item.max}</span>
              </div>
              <ScoreBar score={item.score} max={item.max} color={item.color} />
              <p style={{ fontSize: 12, color: MID, marginTop: 4, margin: "4px 0 0" }}>{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Water this week */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Droplets size={22} color={BLUE} strokeWidth={2} />
            <h2 className="c-heading" style={{ color: DARK, margin: 0 }}>Tubig ngayong linggo</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total na Baso", value: totalGlasses, unit: "baso", color: BLUE },
              { label: "Araw na Goal Met", value: daysGoalMet, unit: "/ 7 araw", color: G },
              { label: "Average / Araw", value: avgGlasses, unit: "baso", color: "#7c3aed" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f0f9ff", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: MID, marginTop: 4 }}>{s.unit}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {weekWaterLogs.map((l, i) => {
              const pct = Math.min((l.glasses / 8) * 100, 100);
              const done = l.glasses >= 8;
              const dayName = ["Lin","Lun","Mar","Miy","Huw","Biy","Sab"][new Date(l.date + "T00:00:00").getDay()];
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 60, background: "#e0f2fe", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ height: `${pct}%`, background: done ? `linear-gradient(180deg, #7dd3fc, ${BLUE})` : "#93c5fd", borderRadius: 8, transition: "height 0.5s", minHeight: l.glasses > 0 ? 4 : 0 }} />
                  </div>
                  <span style={{ fontSize: 9, color: done ? BLUE : MID, fontWeight: done ? 700 : 400 }}>{dayName}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: done ? BLUE : "#94a3b8" }}>{l.glasses}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check-in summary */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Activity size={22} color={G} strokeWidth={2} />
            <h2 className="c-heading" style={{ color: DARK, margin: 0 }}>Daily Check-ins</h2>
          </div>
          {checkedDays === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: MID }}>
              <p style={{ fontSize: 16, margin: "0 0 8px" }}>Walang check-in ngayong linggo</p>
              <Link href="/tracker" style={{ color: G, fontWeight: 700, fontSize: 15 }}>Mag-log na sa Daily Tracker →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weekDates.map((d, i) => {
                const ci = weekCheckIns[i];
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: ci ? "#f0fdf4" : "#f9fafb", border: `1.5px solid ${ci ? "#86efac" : "#e5e7eb"}` }}>
                    <span style={{ fontSize: 16, minWidth: 20 }}>{ci ? "✅" : "○"}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: ci ? DARK : MID, margin: 0 }}>{formatDate(d)}</p>
                      {ci && (
                        <p style={{ fontSize: 12, color: MID, margin: "2px 0 0" }}>
                          {ci.energy != null && `Energy: ${ci.energy}/10`}
                          {ci.pain != null && ` · Pain: ${ci.pain}/10`}
                          {ci.weight != null && ` · ${ci.weight}kg`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Personalized advice */}
        <div style={{ background: G, borderRadius: 20, padding: "22px", marginBottom: 20 }}>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: 17, margin: "0 0 12px" }}>☕ Personalized Tips para sa inyo</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {daysGoalMet < 4 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Droplets size={18} color="#7dd3fc" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Mag-focus sa pag-inom ng tubig ngayong linggo. Subukang mag-set ng alarm bawat 2 oras para mag-alala kang uminom.
                </p>
              </div>
            )}
            {checkedDays < 4 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Activity size={18} color="#86efac" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Subukang mag-log sa Daily Tracker araw-araw. Kahit 1 minuto lang — malaking tulong para ma-track ang inyong progreso.
                </p>
              </div>
            )}
            {avgEnergy != null && avgEnergy < 5 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Scale size={18} color="#fcd34d" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Mukhang mababa ang energy ngayong linggo. Siguraduhing uminum ng EaseBrew tuwing umaga at kumain ng nutritious na agahan.
                </p>
              </div>
            )}
            {totalScore >= 70 && (
              <div style={{ background: "rgba(254,210,85,0.15)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Apple size={18} color={GOLD} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Excellent performance ngayong linggo! Ituloy ang momentum. Ang consistency ay susi sa long-term wellness.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/tracker" className="c-btn c-btn-green" style={{ textAlign: "center" as const, textDecoration: "none", display: "block" }}>
            📋 Mag-log sa Daily Tracker
          </Link>
          <Link href="/water" style={{ background: "#e0f2fe", color: "#0284c7", borderRadius: 16, padding: "16px 24px", fontSize: 16, fontWeight: 700, textAlign: "center" as const, textDecoration: "none", display: "block" }}>
            💧 Water Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
