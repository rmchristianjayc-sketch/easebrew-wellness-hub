"use client";

import { useEffect, useState, use } from "react";
import { Heart, Activity, CircleCheck } from "lucide-react";
import { localDateStr } from "@/lib/localDate";

const G = "#39613B";
const GOLD = "#FED255";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";
const WHITE = "#FFFFFB";

type CheckIn = { date: string; painScore?: number; easebrewUmaga?: boolean; easebrewGabi?: boolean };
type BpEntry = { date: string; systolic: number; diastolic: number };

export default function FamilySharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [tracker, setTracker] = useState<CheckIn[]>([]);
  const [bp, setBp] = useState<BpEntry[]>([]);

  useEffect(() => {
    fetch(`/api/family/${token}`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) { setError(d.error || "Invalid link."); return; }
        setName(d.name);
        const rawTracker = d.progress?.tracker?.data;
        setTracker(Array.isArray(rawTracker?.entries) ? rawTracker.entries : Array.isArray(rawTracker) ? rawTracker : []);
        const rawBp = d.progress?.blood_pressure?.data;
        setBp(Array.isArray(rawBp?.entries) ? rawBp.entries : Array.isArray(rawBp) ? rawBp : []);
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "grid", placeItems: "center", fontFamily: "Georgia, serif" }}>
      <p style={{ color: G, fontSize: 18 }}>Sandali lang...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "grid", placeItems: "center", padding: 20, fontFamily: "Georgia, serif" }}>
      <div style={{ background: WHITE, borderRadius: 20, padding: 30, textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: DARK, margin: "0 0 8px" }}>Hindi available ang link</p>
        <p style={{ fontSize: 15, color: MID, margin: 0 }}>{error}</p>
      </div>
    </div>
  );

  // Last 7 days (local timezone)
  const today = new Date();
  const weekDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    weekDates.push(localDateStr(d));
  }
  const trackerByDate = new Map(tracker.map(t => [t.date, t]));
  const daysLogged = weekDates.filter(d => trackerByDate.has(d)).length;
  const easebrewCount = weekDates.filter(d => {
    const t = trackerByDate.get(d);
    return t?.easebrewUmaga || t?.easebrewGabi;
  }).length;
  const painValues = weekDates.map(d => trackerByDate.get(d)?.painScore).filter((v): v is number => typeof v === "number");
  const avgPain = painValues.length ? Math.round((painValues.reduce((a, b) => a + b, 0) / painValues.length) * 10) / 10 : null;

  // BP trend
  const last7Bp = bp.filter(b => weekDates.includes(b.date));
  const bpAvg = last7Bp.length
    ? { sys: Math.round(last7Bp.reduce((a, b) => a + b.systolic, 0) / last7Bp.length),
        dia: Math.round(last7Bp.reduce((a, b) => a + b.diastolic, 0) / last7Bp.length) }
    : null;

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 40px" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${G} 0%, #2a5c34 100%)`, borderRadius: 22, padding: "24px 22px", color: "#fff", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: GOLD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>Update ng Wellness sa Pamilya</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>{name}</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: 0, lineHeight: 1.5 }}>Ito ang lingguhang wellness update ni {name.split(" ")[0]}. Nakakagawa ba nang tama ang mahal mong senior?</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: WHITE, borderRadius: 18, padding: "18px 16px", border: "2px solid #d9d0c0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MID, letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 6px" }}>Araw-araw na Check-in</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: G, margin: "0 0 4px" }}>{daysLogged} / 7</p>
            <p style={{ fontSize: 13, color: MID, margin: 0 }}>araw ng linggong ito</p>
          </div>
          <div style={{ background: WHITE, borderRadius: 18, padding: "18px 16px", border: "2px solid #d9d0c0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MID, letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 6px" }}>EaseBrew</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#C0863B", margin: "0 0 4px" }}>{easebrewCount} / 7</p>
            <p style={{ fontSize: 13, color: MID, margin: 0 }}>araw na nakakainom</p>
          </div>
        </div>

        {/* Pain */}
        {avgPain != null && (
          <div style={{ background: WHITE, borderRadius: 18, padding: "18px 20px", border: "2px solid #d9d0c0", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Activity size={20} color={G} />
              <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>Karaniwang pain level ngayong linggo</p>
            </div>
            <p style={{ fontSize: 44, fontWeight: 900, color: avgPain <= 3 ? G : avgPain <= 6 ? "#C0863B" : "#dc2626", margin: 0, lineHeight: 1 }}>
              {avgPain}<span style={{ fontSize: 20, color: MID }}>/10</span>
            </p>
            <p style={{ fontSize: 14, color: MID, margin: "6px 0 0" }}>
              {avgPain <= 3 ? "Mababa — mabuti!" : avgPain <= 6 ? "Katamtaman" : "Mataas — kailangan pang bantayan"}
            </p>
          </div>
        )}

        {/* BP */}
        {bpAvg && (
          <div style={{ background: WHITE, borderRadius: 18, padding: "18px 20px", border: "2px solid #d9d0c0", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Heart size={20} color="#dc2626" />
              <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>Karaniwang BP ngayong linggo</p>
            </div>
            <p style={{ fontSize: 40, fontWeight: 900, color: bpAvg.sys < 130 ? G : bpAvg.sys < 140 ? "#C0863B" : "#dc2626", margin: 0, lineHeight: 1 }}>
              {bpAvg.sys}/{bpAvg.dia}
            </p>
            <p style={{ fontSize: 14, color: MID, margin: "6px 0 0" }}>Base sa {last7Bp.length} sukat</p>
          </div>
        )}

        {/* Weekly grid */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "18px 20px", border: "2px solid #d9d0c0" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: "0 0 12px" }}>Nakaraang 7 Araw</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {weekDates.map(d => {
              const t = trackerByDate.get(d);
              const done = !!t;
              const day = new Date(d + "T00:00:00").toLocaleDateString("fil-PH", { weekday: "short" });
              return (
                <div key={d} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: MID, margin: "0 0 6px", fontWeight: 600 }}>{day}</p>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: done ? G : "#e5e7eb", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {done && <CircleCheck size={18} color="#fff" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ fontSize: 12, color: MID, textAlign: "center", margin: "20px 0 0", lineHeight: 1.55 }}>
          Ang page na ito ay read-only view lang. Walang personal medical data na naipapakita.
        </p>
      </div>
    </div>
  );
}
