"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G     = "#39613B";
const GOLD  = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

// ── Pain levels — 5 simple choices ──────────────────────────
const PAIN_LEVELS = [
  { score: 1, emoji: "😊", label: "Wala",       color: "#22c55e" },
  { score: 3, emoji: "🙂", label: "Konti",      color: "#84cc16" },
  { score: 5, emoji: "😐", label: "May Sakit",  color: "#eab308" },
  { score: 7, emoji: "😣", label: "Matindi",    color: "#f97316" },
  { score: 9, emoji: "😭", label: "Sobrang Sakit", color: "#ef4444" },
];

const PAIN_LOCATIONS = [
  "Tuhod", "Likod", "Balikat", "Kamay",
  "Paa",   "Leeg",  "Balakang", "Ulo",
];

type DayEntry = {
  date: string;
  painScore: number;
  painLocation: string;
  easebrewUmaga: boolean;
  easebrewGabi: boolean;
  avocadoOil: boolean;
  mood: number;
  notes: string;
};

const emptyEntry = (): DayEntry => ({
  date: new Date().toISOString().split("T")[0],
  painScore: 0,
  painLocation: "",
  easebrewUmaga: false,
  easebrewGabi: false,
  avocadoOil: false,
  mood: 0,
  notes: "",
});

const MOOD_OPTIONS = [
  { val: 1, emoji: "😢", label: "Malungkot" },
  { val: 2, emoji: "😕", label: "Hindi OK" },
  { val: 3, emoji: "😐", label: "OK Lang"  },
  { val: 4, emoji: "🙂", label: "Masaya"   },
  { val: 5, emoji: "😄", label: "Masayang-Masaya" },
];

function getPainColor(score: number) {
  if (score <= 2) return "#22c55e";
  if (score <= 4) return "#84cc16";
  if (score <= 6) return "#eab308";
  if (score <= 8) return "#f97316";
  return "#ef4444";
}

function getPainEmoji(score: number) {
  if (score <= 2) return "😊";
  if (score <= 4) return "🙂";
  if (score <= 6) return "😐";
  if (score <= 8) return "😣";
  return "😭";
}

export default function TrackerPage() {
  const router = useRouter();
  const [entries, setEntries]       = useState<DayEntry[]>([]);
  const [today, setToday]           = useState<DayEntry>(emptyEntry());
  const [view, setView]             = useState<"ngayon" | "history">("ngayon");
  const [saved, setSaved]           = useState(false);
  const [checking, setChecking]     = useState(true);

  // ── Session check ────────────────────────────────────────
  useEffect(() => {
    const match = document.cookie.split(";").find(c => c.trim().startsWith("eb_session="));
    if (!match) { router.replace("/verify"); return; }
    try {
      const s = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
      if (!s.expires_at || new Date(s.expires_at) < new Date()) { router.replace("/verify"); return; }
    } catch { router.replace("/verify"); return; }
    setChecking(false);
  }, [router]);

  // ── Load saved data ──────────────────────────────────────
  useEffect(() => {
    if (checking) return;
    const raw = localStorage.getItem("easebrew-tracker-v2");
    if (!raw) return;
    const data = JSON.parse(raw) as DayEntry[];
    setEntries(data);
    const todayStr = new Date().toISOString().split("T")[0];
    const existing = data.find(e => e.date === todayStr);
    if (existing) setToday(existing);
  }, [checking]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G, fontSize: 20, fontWeight: 700 }}>☕ Sandali lang...</p>
    </div>
  );

  // ── Save ─────────────────────────────────────────────────
  const saveEntry = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const entry = { ...today, date: todayStr };
    const idx = entries.findIndex(e => e.date === todayStr);
    const updated = idx >= 0
      ? entries.map((e, i) => i === idx ? entry : e)
      : [...entries, entry];
    setEntries(updated);
    localStorage.setItem("easebrew-tracker-v2", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalDays   = entries.length;
  const avgPain     = totalDays > 0
    ? (entries.reduce((a, b) => a + b.painScore, 0) / totalDays).toFixed(1)
    : "—";
  const consistRate = totalDays > 0
    ? Math.round((entries.filter(e => e.easebrewUmaga && e.easebrewGabi).length / totalDays) * 100)
    : 0;

  const todayStr = new Date().toLocaleDateString("fil-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100, fontFamily: "Georgia, serif" }}>

      {/* ── HEADER ────────────────────────────────────────── */}
      <div style={{ background: G, padding: "24px 24px 0", color: WHITE }}>
        <Link href="/" style={{ color: GOLD, fontSize: 15, textDecoration: "none", display: "block", marginBottom: 14, fontWeight: 600 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📊 Pain Tracker</h1>
            <p style={{ fontSize: 15, opacity: 0.8, margin: "4px 0 0 0" }}>I-track ang iyong progress araw-araw</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 18px" }}>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: GOLD }}>Day {totalDays}</p>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>logged na</p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", textAlign: "center" as const }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>{avgPain}</p>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Avg Pain</p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", textAlign: "center" as const }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>{consistRate}%</p>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>2x/day rate</p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", textAlign: "center" as const }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>{totalDays}</p>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Araw</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 16 }}>
          {(["ngayon", "history"] as const).map(t => (
            <button key={t} onClick={() => setView(t)} style={{
              flex: 1, padding: "16px 8px", border: "none", background: "transparent",
              fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
              color: view === t ? GOLD : "rgba(255,255,255,0.6)",
              borderBottom: view === t ? `4px solid ${GOLD}` : "4px solid transparent",
            }}>
              {t === "ngayon" ? "📝 Ngayon" : "📅 History"}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ NGAYON TAB ═══════════════════════════════════════ */}
      {view === "ngayon" && (
        <div style={{ padding: "24px 20px" }}>

          {/* Date */}
          <p style={{ fontSize: 16, color: MID, margin: "0 0 24px 0", textAlign: "center", fontWeight: 600 }}>
            📅 {todayStr}
          </p>

          {/* ── EASEBREW 2x CHECK ───────────────────────────── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>☕ EaseBrew ngayon</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0" }}>Na-inom mo na ba ang EaseBrew mo?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Umaga */}
              <button
                onClick={() => setToday(e => ({ ...e, easebrewUmaga: !e.easebrewUmaga }))}
                style={{
                  width: "100%", padding: "20px 24px", borderRadius: 16, border: "none",
                  background: today.easebrewUmaga ? G : "#F0F0E8",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 34 }}>🌅</span>
                  <div style={{ textAlign: "left" as const }}>
                    <p style={{ fontSize: 19, fontWeight: 700, color: today.easebrewUmaga ? WHITE : DARK, margin: 0 }}>Umaga</p>
                    <p style={{ fontSize: 14, color: today.easebrewUmaga ? "rgba(255,255,255,0.8)" : MID, margin: 0 }}>1st sachet ng araw</p>
                  </div>
                </div>
                <span style={{ fontSize: 36 }}>{today.easebrewUmaga ? "✅" : "⬜"}</span>
              </button>

              {/* Gabi */}
              <button
                onClick={() => setToday(e => ({ ...e, easebrewGabi: !e.easebrewGabi }))}
                style={{
                  width: "100%", padding: "20px 24px", borderRadius: 16, border: "none",
                  background: today.easebrewGabi ? G : "#F0F0E8",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 34 }}>🌙</span>
                  <div style={{ textAlign: "left" as const }}>
                    <p style={{ fontSize: 19, fontWeight: 700, color: today.easebrewGabi ? WHITE : DARK, margin: 0 }}>Gabi</p>
                    <p style={{ fontSize: 14, color: today.easebrewGabi ? "rgba(255,255,255,0.8)" : MID, margin: 0 }}>2nd sachet ng araw</p>
                  </div>
                </div>
                <span style={{ fontSize: 36 }}>{today.easebrewGabi ? "✅" : "⬜"}</span>
              </button>

              {/* Avocado Oil */}
              <button
                onClick={() => setToday(e => ({ ...e, avocadoOil: !e.avocadoOil }))}
                style={{
                  width: "100%", padding: "20px 24px", borderRadius: 16, border: "none",
                  background: today.avocadoOil ? "#2D5A1B" : "#F0F0E8",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 34 }}>🌿</span>
                  <div style={{ textAlign: "left" as const }}>
                    <p style={{ fontSize: 19, fontWeight: 700, color: today.avocadoOil ? WHITE : DARK, margin: 0 }}>Avocado Oil</p>
                    <p style={{ fontSize: 14, color: today.avocadoOil ? "rgba(255,255,255,0.8)" : MID, margin: 0 }}>Na-massage na bago matulog</p>
                  </div>
                </div>
                <span style={{ fontSize: 36 }}>{today.avocadoOil ? "✅" : "⬜"}</span>
              </button>
            </div>

            {/* Encouragement */}
            {today.easebrewUmaga && today.easebrewGabi && (
              <div style={{ marginTop: 14, background: "#E8F5E0", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const }}>
                <p style={{ fontSize: 17, color: G, fontWeight: 700, margin: 0 }}>
                  🎉 Magaling! 2x na ngayon! Tuloy lang!
                </p>
              </div>
            )}
            {(today.easebrewUmaga || today.easebrewGabi) && !(today.easebrewUmaga && today.easebrewGabi) && (
              <div style={{ marginTop: 14, background: "#FEF9E7", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const }}>
                <p style={{ fontSize: 16, color: AMBER, fontWeight: 600, margin: 0 }}>
                  💪 Isang beses pa! Huwag kalimutang uminom {today.easebrewUmaga ? "ngayong gabi" : "ngayong umaga"}!
                </p>
              </div>
            )}
          </div>

          {/* ── PAIN LEVEL ──────────────────────────────────── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>😣 Gaano kasakit ngayon?</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0" }}>Piliin ang pinaka-tama para sa inyong pakiramdam</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PAIN_LEVELS.map(p => (
                <button
                  key={p.score}
                  onClick={() => setToday(e => ({ ...e, painScore: p.score }))}
                  style={{
                    width: "100%", padding: "18px 20px", borderRadius: 16,
                    border: today.painScore === p.score ? `3px solid ${p.color}` : "2.5px solid #E0D8CC",
                    background: today.painScore === p.score ? p.color : WHITE,
                    display: "flex", alignItems: "center", gap: 16,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 36, flexShrink: 0 }}>{p.emoji}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: today.painScore === p.score ? WHITE : DARK }}>
                    {p.label}
                  </span>
                  {today.painScore === p.score && (
                    <span style={{ marginLeft: "auto", fontSize: 26 }}>✅</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── PAIN LOCATION ───────────────────────────────── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>📍 Saan sumasakit?</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 16px 0" }}>I-tap ang pinakamasakit na parte</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {PAIN_LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setToday(e => ({ ...e, painLocation: today.painLocation === loc ? "" : loc }))}
                  style={{
                    padding: "14px 20px", borderRadius: 14, border: "none",
                    background: today.painLocation === loc ? G : "#F0EDE6",
                    color: today.painLocation === loc ? WHITE : DARK,
                    fontSize: 17, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {today.painLocation === loc ? "✅ " : ""}{loc}
                </button>
              ))}
            </div>
          </div>

          {/* ── MOOD ────────────────────────────────────────── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>😊 Paano ang mood mo?</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 16px 0" }}>I-tap ang naglalarawan sa inyong mood</p>
            <div style={{ display: "flex", gap: 8 }}>
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.val}
                  onClick={() => setToday(e => ({ ...e, mood: m.val }))}
                  style={{
                    flex: 1, padding: "14px 4px", borderRadius: 14,
                    border: today.mood === m.val ? `3px solid ${G}` : "2px solid #E0D8CC",
                    background: today.mood === m.val ? "#E8F5E0" : WHITE,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 4, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{m.emoji}</span>
                  <span style={{ fontSize: 11, color: today.mood === m.val ? G : MID, fontWeight: 600, textAlign: "center" as const, lineHeight: 1.2 }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── NOTES ───────────────────────────────────────── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>✍️ Ano ang nararamdaman mo?</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 14px 0" }}>Optional — isulat lang kung gusto mo</p>
            <textarea
              placeholder="Halimbawa: Mas gaan na ang tuhod ko ngayon, nakakaabot na ako ng mesa nang hindi sumasakit..."
              value={today.notes}
              onChange={e => setToday(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              style={{
                width: "100%", padding: "16px", borderRadius: 14,
                border: "2px solid #E0D8CC", fontSize: 17,
                background: WHITE, resize: "none",
                boxSizing: "border-box" as const, color: DARK,
                fontFamily: "Georgia, serif", lineHeight: 1.6,
              }}
            />
          </div>

          {/* ── SAVE BUTTON ─────────────────────────────────── */}
          <button
            onClick={saveEntry}
            style={{
              width: "100%", padding: "22px",
              background: saved ? "#22c55e" : G,
              color: WHITE, border: "none", borderRadius: 18,
              fontSize: 22, fontWeight: 700, cursor: "pointer",
              transition: "background 0.3s", fontFamily: "Georgia, serif",
              boxShadow: "0 4px 16px rgba(57,97,59,0.3)",
            }}
          >
            {saved ? "✅ Nai-save na! Magaling!" : "💾 I-save ang Record Ko"}
          </button>

          <p style={{ textAlign: "center", fontSize: 15, color: MID, marginTop: 14, lineHeight: 1.6 }}>
            Gawin ito araw-araw para makita ang inyong progress! 💪
          </p>
        </div>
      )}

      {/* ═══ HISTORY TAB ══════════════════════════════════════ */}
      {view === "history" && (
        <div style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>📅 Inyong Record</h2>
          <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0" }}>Tingnan ang inyong progress araw-araw</p>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: WHITE, borderRadius: 20 }}>
              <p style={{ fontSize: 56, marginBottom: 12 }}>📋</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Wala pang record</p>
              <p style={{ fontSize: 17, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>I-tap ang "Ngayon" para simulan ang inyong unang entry!</p>
              <button
                onClick={() => setView("ngayon")}
                style={{ background: G, color: WHITE, border: "none", borderRadius: 14, padding: "18px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
              >
                📝 Magsimula Na →
              </button>
            </div>
          ) : (
            <>
              {/* Summary card */}
              <div style={{ background: G, borderRadius: 20, padding: "22px 20px", marginBottom: 20, display: "flex", gap: 12 }}>
                {[
                  { label: "Araw", value: `${totalDays}` },
                  { label: "Avg Pain", value: avgPain },
                  { label: "2x/day", value: `${consistRate}%` },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" as const }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: GOLD, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {[...entries].reverse().map((entry, i) => (
                <div key={i} style={{
                  background: WHITE, borderRadius: 18, padding: "20px",
                  marginBottom: 12, borderLeft: `5px solid ${getPainColor(entry.painScore)}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>
                      {new Date(entry.date + "T00:00:00").toLocaleDateString("fil-PH", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{getPainEmoji(entry.painScore)}</span>
                      <span style={{
                        background: getPainColor(entry.painScore), color: WHITE,
                        borderRadius: 10, padding: "4px 12px", fontSize: 15, fontWeight: 700,
                      }}>
                        {entry.painScore}/10
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: entry.notes ? 10 : 0 }}>
                    <span style={{ fontSize: 15, background: entry.easebrewUmaga ? "#E8F5E0" : "#F5F0E8", color: entry.easebrewUmaga ? G : "#aaa", borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>
                      {entry.easebrewUmaga ? "☕✅" : "☕❌"} Umaga
                    </span>
                    <span style={{ fontSize: 15, background: entry.easebrewGabi ? "#E8F5E0" : "#F5F0E8", color: entry.easebrewGabi ? G : "#aaa", borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>
                      {entry.easebrewGabi ? "☕✅" : "☕❌"} Gabi
                    </span>
                    {entry.avocadoOil && (
                      <span style={{ fontSize: 15, background: "#E8F5E0", color: G, borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>
                        🌿✅ Avocado Oil
                      </span>
                    )}
                    {entry.painLocation && (
                      <span style={{ fontSize: 15, background: "#F0EDE6", color: MID, borderRadius: 8, padding: "5px 12px" }}>
                        📍 {entry.painLocation}
                      </span>
                    )}
                  </div>

                  {entry.notes ? (
                    <p style={{ fontSize: 15, color: MID, margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>
                      "{entry.notes}"
                    </p>
                  ) : null}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── BOTTOM NAV ──────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: WHITE,
        borderTop: `2px solid ${CREAM}`, padding: "14px 24px",
        display: "flex", justifyContent: "center",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
      }}>
        <Link href="/" style={{
          background: G, color: WHITE, borderRadius: 14,
          padding: "16px 40px", fontSize: 18, fontWeight: 700,
          textDecoration: "none", fontFamily: "Georgia, serif",
        }}>
          🏠 Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}