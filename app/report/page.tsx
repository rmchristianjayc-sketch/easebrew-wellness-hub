"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache } from "@/lib/progressStorage";
import { localDateStr } from "@/lib/localDate";
import { ChevronLeft, FileText, Activity, Scale, Apple, Heart } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";
type CheckIn = { date: string; weight?: number; energy?: number; pain?: number; notes?: string };

function getWeekDates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return localDateStr(d);
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
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
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const weekDates = getWeekDates();

  useEffect(() => {
    if (!session) return;
    const tKey = progressStorageKey("easebrew-tracker-v2", session.code);
    setCheckIns(readProgressCache<CheckIn[]>(tKey, []));
  }, [session]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G, fontWeight: 600, fontFamily: "Georgia, serif", fontSize: 18 }}>Sandali lang...</p>
    </div>
  );

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
  const trackerScore = Math.round((checkedDays / 7) * 40);
  const energyScore  = avgEnergy != null ? Math.round((avgEnergy / 10) * 30) : 0;
  const painScore    = avgPain != null ? Math.round(((10 - avgPain) / 10) * 30) : 0;
  const totalScore   = trackerScore + energyScore + painScore;

  const scoreLabel = totalScore >= 80 ? { text: "Napakagaling!", color: G, bg: "#dcfce7" }
    : totalScore >= 60 ? { text: "Magaling!", color: "#1d4ed8", bg: "#eff6ff" }
    : totalScore >= 40 ? { text: "Ituloy lang!", color: "#92400e", bg: "#fef9e7" }
    : { text: "Kailangan pa ng improvement", color: "#991b1b", bg: "#fef2f2" };

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
            <div style={{ fontSize: 11, color: "rgba(254,210,85,0.8)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Lingguhang Buod</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Report ng Wellness</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "4px 0 0", fontFamily: "Georgia, serif" }}>{weekStart} – {weekEnd}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 20px" }}>

        {/* Overall Score */}
        <div style={{ background: scoreLabel.bg, border: `2.5px solid ${scoreLabel.color}33`, borderRadius: 24, padding: "24px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: scoreLabel.color, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>Kabuuang Wellness Score</p>
          <div style={{ fontSize: 80, fontWeight: 900, color: scoreLabel.color, lineHeight: 1, margin: "0 0 6px" }}>{totalScore}</div>
          <div style={{ fontSize: 11, color: MID, marginBottom: 14 }}>sa 100 puntos</div>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 12, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", width: `${totalScore}%`, background: `linear-gradient(90deg, ${scoreLabel.color}99, ${scoreLabel.color})`, borderRadius: 999, transition: "width 0.8s ease" }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: scoreLabel.color, margin: 0 }}>{scoreLabel.text}</p>
        </div>

        {/* Score breakdown */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
          <h2 className="c-heading" style={{ color: DARK, marginBottom: 18 }}>Detalye ng Score</h2>
          {[
            { label: "Araw-araw na Check-in (40pts)", score: trackerScore, max: 40, color: G, detail: `${checkedDays}/7 araw na-log` },
            { label: "Lakas ng Katawan (30pts)", score: energyScore, max: 30, color: "#f59e0b", detail: avgEnergy != null ? `Karaniwang: ${avgEnergy}/10` : "Walang data" },
            { label: "Antas ng Sakit (30pts)", score: painScore, max: 30, color: "#ef4444", detail: avgPain != null ? `Karaniwang sakit: ${avgPain}/10 (mas mababa = mas maganda)` : "Walang data" },
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

        {/* Check-in summary */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "22px", marginBottom: 20, border: "1.5px solid #D8CDBA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Activity size={22} color={G} strokeWidth={2} />
            <h2 className="c-heading" style={{ color: DARK, margin: 0 }}>Araw-araw na Check-in</h2>
          </div>
          {checkedDays === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: MID }}>
              <p style={{ fontSize: 16, margin: "0 0 8px" }}>Walang check-in ngayong linggo</p>
              <Link href="/tracker" style={{ color: G, fontWeight: 700, fontSize: 15 }}>Pumunta sa Daily Tracker →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weekDates.map((d, i) => {
                const ci = weekCheckIns[i];
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: ci ? "#f0fdf4" : "#f9fafb", border: `1.5px solid ${ci ? "#86efac" : "#e5e7eb"}` }}>
                    <span style={{ fontSize: 16, minWidth: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{ci ? <Activity size={16} color={G} /> : "○"}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: ci ? DARK : MID, margin: 0 }}>{formatDate(d)}</p>
                      {ci && (
                        <p style={{ fontSize: 12, color: MID, margin: "2px 0 0" }}>
                          {ci.energy != null && `Lakas: ${ci.energy}/10`}
                          {ci.pain != null && ` · Sakit: ${ci.pain}/10`}
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
          <p style={{ color: GOLD, fontWeight: 700, fontSize: 17, margin: "0 0 12px" }}>Mga Tip para sa Iyo</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {avgPain != null && avgPain >= 6 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Heart size={18} color="#fca5a5" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Mataas ang average pain level ngayong linggo. Magpakonsulta sa doctor mo para masuri ang dahilan. Ituloy ang daily tracking para makita ang pattern.
                </p>
              </div>
            )}
            {checkedDays < 4 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Activity size={18} color="#86efac" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Subukang mag-log sa Daily Tracker araw-araw. 1 minuto lang — malaking tulong para ma-track ang progress mo.
                </p>
              </div>
            )}
            {avgEnergy != null && avgEnergy < 5 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Scale size={18} color="#fcd34d" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Mababa ang average energy ngayong linggo. Siguraduhing sapat ang tulog (7-8 oras), masustansyang almusal, at regular na exercise. Kung tuloy-tuloy, magpakonsulta sa doctor.
                </p>
              </div>
            )}
            {totalScore >= 70 && (
              <div style={{ background: "rgba(254,210,85,0.15)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                <Apple size={18} color={GOLD} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                  Napakagaling ngayong linggo! Ituloy lang. Ang consistency ang susi sa pangmatagalang wellness.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/tracker" className="c-btn c-btn-green" style={{ textAlign: "center" as const, textDecoration: "none", display: "block" }}>
            Pumunta sa Daily Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
