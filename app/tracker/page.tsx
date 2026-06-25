"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";

const G     = "#39613B";
const GOLD  = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

const PAIN_LEVELS = [
  { score: 1, emoji: "😊", label: "Wala",          color: "#22c55e" },
  { score: 3, emoji: "🙂", label: "Konti",         color: "#84cc16" },
  { score: 5, emoji: "😐", label: "May Sakit",     color: "#eab308" },
  { score: 7, emoji: "😣", label: "Matindi",       color: "#f97316" },
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
  { val: 1, emoji: "😢", label: "Malungkot"       },
  { val: 2, emoji: "😕", label: "Hindi OK"        },
  { val: 3, emoji: "😐", label: "OK Lang"         },
  { val: 4, emoji: "🙂", label: "Masaya"          },
  { val: 5, emoji: "😄", label: "Masayang-Masaya" },
];

const MILESTONES: Record<number, { emoji: string; title: string; message: string }> = {
  7:  { emoji: "🌟", title: "Isang Linggo Na!",    message: "Magaling! Nagsimula ka na! Patuloy lang — ang pinaka-mabilis na resulta ay darating sa mga susunod na linggo!" },
  14: { emoji: "💪", title: "Dalawang Linggo!",    message: "Incredible! Dapat nararamdaman mo na ang pagbabago. Ang joints mo ay nagpapasalamat sa iyo araw-araw!" },
  30: { emoji: "🏅", title: "Isang Buwan Complete!", message: "WOW! 30 days of consistency! Ikwento mo sa pamilya mo ang iyong results. Ipinagmamalaki ka namin!" },
  60: { emoji: "🔥", title: "Dalawang Buwan!",     message: "Kahanga-hanga! 60 days na! Ikaw na ang inspirasyon ng mga taong nakapaligid sa iyo. Tuloy lang!" },
  90: { emoji: "🏆", title: "90 Days — BAGONG KATAWAN!", message: "CONGRATS! Naabot mo ang pinakamataas na milestone! Bagong katawan, bagong buhay! Ipinagdiriwang namin ang iyong tagumpay!" },
};

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

async function syncTrackerProgress(entries: DayEntry[]) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'tracker', data: { entries } }),
    });
  } catch {
    // Silent fail — localStorage is the fallback
  }
}

function getStoredTrackerEntries(storageKey: string): DayEntry[] {
  return readProgressCache<DayEntry[]>(storageKey, []);
}

function getStoredTodayEntry(storageKey: string): DayEntry {
  const todayStr = new Date().toISOString().split("T")[0];
  return getStoredTrackerEntries(storageKey).find(e => e.date === todayStr) ?? emptyEntry();
}

function MilestoneModal({ days, onClose }: { days: number; onClose: () => void }) {
  const m = MILESTONES[days];
  if (!m) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: 28, padding: "44px 32px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>{m.emoji}</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1B201A", margin: "0 0 14px", lineHeight: 1.3 }}>Day {days}! {m.title}</h2>
        <p style={{ fontSize: 17, color: "#4E504F", margin: "0 0 28px", lineHeight: 1.7 }}>{m.message}</p>
        <button
          onClick={onClose}
          style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
        >
          Salamat! Tuloy Tuloy! 💪
        </button>
      </div>
    </div>
  );
}

function playChime(type: "check" | "save" | "milestone" = "save") {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes =
      type === "milestone" ? [523, 659, 784, 1047] :
      type === "check"     ? [784, 880]             :
                             [659, 784];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.13 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.32);
      osc.start(ctx.currentTime + i * 0.13);
      osc.stop(ctx.currentTime  + i * 0.13 + 0.35);
    });
  } catch {}
}

function VoiceButton({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }, []);
  if (!supported) return null;

  function startListening() {
    const SpeechRec = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
                   || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = "fil-PH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    rec.start();
  }

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={listening}
      style={{
        background: listening ? "#ef4444" : "#E8F5E0",
        border: `1.5px solid ${listening ? "#ef4444" : "#39613B"}`,
        borderRadius: 8, padding: "5px 12px", fontSize: 13,
        color: listening ? "white" : "#39613B",
        cursor: listening ? "default" : "pointer", fontWeight: 700,
        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
      }}
    >
      {listening ? "🔴 Nakinikinig..." : "🎤 Magsalita"}
    </button>
  );
}

export default function TrackerPage() {
  const { checking, session } = useSessionGuard();
  const storageKey = progressStorageKey("easebrew-tracker-v2", session?.code);
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [today, setToday]     = useState<DayEntry>(emptyEntry);
  const [view, setView]       = useState<"ngayon" | "history">("ngayon");
  const [saved, setSaved]     = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [prefilledFromYesterday, setPrefilledFromYesterday] = useState(false);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (checking || !session) return;

    async function loadProgress() {
      const localEntries = getStoredTrackerEntries(storageKey);
      setEntries(localEntries);
      setToday(getStoredTodayEntry(storageKey));

      // Smart pre-fill: if today is empty, carry yesterday's values
      const todayStr = new Date().toISOString().split("T")[0];
      const todayExists = localEntries.some(e => e.date === todayStr);
      if (!todayExists && localEntries.length > 0) {
        const yesterday = localEntries[localEntries.length - 1];
        if (yesterday) {
          setToday(prev => ({
            ...prev,
            painScore:     yesterday.painScore     || prev.painScore,
            painLocation:  yesterday.painLocation  || prev.painLocation,
            mood:          yesterday.mood          || prev.mood,
          }));
          setPrefilledFromYesterday(true);
        }
      }

      fetch('/api/progress?type=tracker')
        .then(r => r.json())
        .then(res => {
          const remoteEntries: DayEntry[] = Array.isArray(res?.data?.entries) ? res.data.entries : [];
          if (remoteEntries.length === 0) return;

          const map = new Map<string, DayEntry>();
          remoteEntries.forEach(e => map.set(e.date, e));
          localEntries.forEach(e => { if (!map.has(e.date)) map.set(e.date, e); });

          const merged = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
          setEntries(merged);
          writeProgressCache(storageKey, merged);

          const todayStr = new Date().toISOString().split("T")[0];
          const mergedToday = merged.find(e => e.date === todayStr);
          if (mergedToday) setToday(mergedToday);
        })
        .catch(() => {});
    }

    loadProgress();
  }, [checking, session, storageKey]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* 4.1 FIX: 20px → 22px (already OK, bumped slightly for consistency) */}
      <p style={{ color: G, fontSize: 22, fontWeight: 700 }}>☕ Sandali lang...</p>
    </div>
  );

  const triggerSync = (allEntries: DayEntry[]) => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      syncTrackerProgress(allEntries);
    }, 1000);
  };

  const saveEntry = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const entry = { ...today, date: todayStr };
    const idx = entries.findIndex(e => e.date === todayStr);
    const updated = idx >= 0
      ? entries.map((e, i) => i === idx ? entry : e)
      : [...entries, entry];
    setEntries(updated);
    writeProgressCache(storageKey, updated);
    triggerSync(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    playChime("save");
    const newTotal = updated.length;
    if (MILESTONES[newTotal] && localStorage.getItem(`eb_milestone_${newTotal}`) !== "1") {
      localStorage.setItem(`eb_milestone_${newTotal}`, "1");
      setMilestone(newTotal);
      playChime("milestone");
    }
  };

  function generateSummary() {
    if (entries.length === 0) return "";
    const firstPain = entries[0].painScore;
    const latestPain = entries[entries.length - 1].painScore;
    const recentNotes = entries.slice(-3).filter(e => e.notes).map(e => `• ${e.notes}`);
    const trend = latestPain < firstPain ? "✅ Bumababa ang sakit!" : latestPain === firstPain ? "➡️ Pareho pa rin" : "⚠️ Tumaas ng konti";
    const today = new Date().toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" });
    return [
      `📊 EaseBrew Progress Report`,
      `Petsa: ${today}`,
      ``,
      `Kabuuang araw na naka-log: ${totalDays}`,
      `Average pain score: ${avgPain}/10`,
      `Consistency (2x/day): ${consistRate}%`,
      `Pain trend: ${firstPain} → ${latestPain} ${trend}`,
      recentNotes.length > 0 ? `\nMga kamakailang notes:\n${recentNotes.join("\n")}` : "",
      ``,
      `— Mula sa EaseBrew Wellness Hub`,
    ].filter(l => l !== undefined).join("\n");
  }

  function copyProgressSummary() {
    const text = generateSummary();
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => { setSummaryCopied(true); setTimeout(() => setSummaryCopied(false), 3000); })
      .catch(() => {});
  }

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
      {milestone && <MilestoneModal days={milestone} onClose={() => setMilestone(null)} />}

      {/* ── HEADER ── */}
      <div style={{ background: G, padding: "24px 24px 0", color: WHITE }}>
        {/* 4.1 FIX: 15px → 16px | 4.2 FIX: minHeight 44px */}
        <Link href="/" style={{ color: GOLD, fontSize: 16, textDecoration: "none", display: "flex", alignItems: "center", minHeight: 44, marginBottom: 14, fontWeight: 600 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📊 Pain Tracker</h1>
            {/* 4.1 FIX: 15px → 16px */}
            <p style={{ fontSize: 16, opacity: 0.8, margin: "4px 0 0 0" }}>I-track ang iyong progress araw-araw</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 18px" }}>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: GOLD }}>Day {totalDays}</p>
            {/* 4.1 FIX: 13px → 16px */}
            <p style={{ fontSize: 16, margin: 0, opacity: 0.8 }}>logged na</p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
          {[
            { label: "Avg Pain",  value: avgPain     },
            { label: "2x/day",    value: `${consistRate}%` },
            { label: "Araw",      value: `${totalDays}`    },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", textAlign: "center" as const }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>{s.value}</p>
              {/* 4.1 FIX: 12px → 16px */}
              <p style={{ fontSize: 16, opacity: 0.8, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 16 }}>
          {(["ngayon", "history"] as const).map(t => (
            <button key={t} onClick={() => setView(t)} style={{
              flex: 1, padding: "16px 8px", border: "none", background: "transparent",
              fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
              color: view === t ? GOLD : "rgba(255,255,255,0.6)",
              borderBottom: view === t ? `4px solid ${GOLD}` : "4px solid transparent",
              minHeight: 56, // 4.2 FIX
            }}>
              {t === "ngayon" ? "📝 Ngayon" : "📅 History"}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ NGAYON TAB ═══ */}
      {view === "ngayon" && (
        <div style={{ padding: "24px 20px" }}>

              {prefilledFromYesterday && (
                <div style={{ background: "#EEF4FF", border: "1px solid #93C5FD", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#1D4ED8", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>⚡</span> Pre-filled mula sa kahapon — i-update kung nagbago.
                </div>
              )}

          <p style={{ fontSize: 16, color: MID, margin: "0 0 24px 0", textAlign: "center", fontWeight: 600 }}>
            📅 {todayStr}
          </p>

          {/* ── EASEBREW 2x CHECK ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>☕ EaseBrew ngayon</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0" }}>Na-inom mo na ba ang EaseBrew mo?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "easebrewUmaga" as const, icon: "🌅", label: "Umaga",       sub: "1st sachet ng araw",      activeColor: G },
                { key: "easebrewGabi"  as const, icon: "🌙", label: "Gabi",        sub: "2nd sachet ng araw",      activeColor: G },
                { key: "avocadoOil"    as const, icon: "🌿", label: "Avocado Oil", sub: "Na-massage na bago matulog", activeColor: "#2D5A1B" },
              ].map(({ key, icon, label, sub, activeColor }) => (
                <button
                  key={key}
                  onClick={() => setToday(e => ({ ...e, [key]: !e[key] }))}
                  style={{
                    width: "100%", padding: "20px 24px", borderRadius: 16, border: "none",
                    background: today[key] ? activeColor : "#F0F0E8",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", transition: "all 0.2s", minHeight: 72, // 4.2 FIX
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 34 }}>{icon}</span>
                    <div style={{ textAlign: "left" as const }}>
                      <p style={{ fontSize: 19, fontWeight: 700, color: today[key] ? WHITE : DARK, margin: 0 }}>{label}</p>
                      {/* 4.1 FIX: 14px → 16px */}
                      <p style={{ fontSize: 16, color: today[key] ? "rgba(255,255,255,0.8)" : MID, margin: 0 }}>{sub}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 36 }}>{today[key] ? "✅" : "⬜"}</span>
                </button>
              ))}
            </div>

            {today.easebrewUmaga && today.easebrewGabi && (
              <div style={{ marginTop: 14, background: "#E8F5E0", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const }}>
                <p style={{ fontSize: 17, color: G, fontWeight: 700, margin: 0 }}>🎉 Magaling! 2x na ngayon! Tuloy lang!</p>
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

          {/* ── PAIN LEVEL ── */}
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
                    cursor: "pointer", transition: "all 0.15s", minHeight: 64, // 4.2 FIX
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

          {/* ── PAIN LOCATION ── */}
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
                    minHeight: 52, // 4.2 FIX
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

          {/* ── MOOD ── */}
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
                    gap: 6, cursor: "pointer", transition: "all 0.15s",
                    minHeight: 80, // 4.2 FIX: tall enough para madaling i-tap
                  }}
                >
                  <span style={{ fontSize: 28 }}>{m.emoji}</span>
                  {/* 4.1 FIX: 11px → 16px */}
                  <span style={{ fontSize: 16, color: today.mood === m.val ? G : MID, fontWeight: 600, textAlign: "center" as const, lineHeight: 1.2 }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── NOTES ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>✍️ Ano ang nararamdaman mo?</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 14px 0" }}>Optional — isulat lang kung gusto mo</p>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: DARK, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span>📝 Notes (optional)</span>
                <VoiceButton onResult={(text) => setToday(p => ({ ...p, notes: p.notes ? p.notes + " " + text : text }))} />
              </label>
              <textarea
                value={today.notes}
                onChange={e => setToday(p => ({ ...p, notes: e.target.value }))}
                placeholder="Kumusta ang pakiramdam mo ngayon? Anong nangyari?"
                rows={3}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid #D9D0C0`, fontSize: 15, resize: "none", outline: "none", background: WHITE, color: DARK, fontFamily: "inherit", boxSizing: "border-box" as const }}
              />
            </div>
          </div>

          {/* ── SAVE BUTTON ── */}
          <button
            onClick={saveEntry}
            style={{
              width: "100%", padding: "22px",
              background: saved ? "#22c55e" : G,
              color: WHITE, border: "none", borderRadius: 18,
              fontSize: 22, fontWeight: 700, cursor: "pointer",
              transition: "background 0.3s", fontFamily: "Georgia, serif",
              boxShadow: "0 4px 16px rgba(57,97,59,0.3)", minHeight: 68, // 4.2 FIX
            }}
          >
            {saved ? "✅ Nai-save na! Magaling!" : "💾 I-save ang Record Ko"}
          </button>

          {/* 4.1 FIX: 15px → 16px */}
          <p style={{ textAlign: "center", fontSize: 16, color: MID, marginTop: 14, lineHeight: 1.6 }}>
            Gawin ito araw-araw para makita ang inyong progress! 💪
          </p>
        </div>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {view === "history" && (
        <div style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>📅 Inyong Record</h2>
          <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0" }}>Tingnan ang inyong progress araw-araw</p>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: WHITE, borderRadius: 20 }}>
              <p style={{ fontSize: 56, marginBottom: 12 }}>📋</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Wala pang record</p>
              <p style={{ fontSize: 17, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>I-tap ang &quot;Ngayon&quot; para simulan ang inyong unang entry!</p>
              <button
                onClick={() => setView("ngayon")}
                style={{ background: G, color: WHITE, border: "none", borderRadius: 14, padding: "18px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", minHeight: 56 }}
              >
                📝 Magsimula Na →
              </button>
            </div>
          ) : (
            <>
              {/* Summary card */}
              <div style={{ background: G, borderRadius: 20, padding: "22px 20px", marginBottom: 20, display: "flex", gap: 12 }}>
                {[
                  { label: "Araw",     value: `${totalDays}` },
                  { label: "Avg Pain", value: avgPain        },
                  { label: "2x/day",   value: `${consistRate}%` },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" as const }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: GOLD, margin: 0 }}>{s.value}</p>
                    {/* 4.1 FIX: 13px → 16px */}
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={copyProgressSummary}
                disabled={entries.length === 0}
                style={{
                  width: "100%", marginBottom: 20,
                  background: summaryCopied ? "#22c55e" : G,
                  color: WHITE, border: "none", borderRadius: 16,
                  padding: "18px", fontSize: 18, fontWeight: 700,
                  cursor: entries.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "Georgia, serif", transition: "background 0.3s",
                  boxShadow: "0 4px 16px rgba(57,97,59,0.3)", minHeight: 60,
                }}
              >
                {summaryCopied ? "✅ Nakopya! I-paste sa chat ng Coach" : "📋 I-share ang Progress sa Coach"}
              </button>

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
                      {/* 4.1 FIX: 15px → 16px */}
                      <span style={{
                        background: getPainColor(entry.painScore), color: WHITE,
                        borderRadius: 10, padding: "4px 12px", fontSize: 16, fontWeight: 700,
                      }}>
                        {entry.painScore}/10
                      </span>
                    </div>
                  </div>

                  {/* 4.1 FIX: 15px → 16px (all chips) */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: entry.notes ? 10 : 0 }}>
                    <span style={{ fontSize: 16, background: entry.easebrewUmaga ? "#E8F5E0" : "#F5F0E8", color: entry.easebrewUmaga ? G : "#aaa", borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>
                      {entry.easebrewUmaga ? "☕✅" : "☕❌"} Umaga
                    </span>
                    <span style={{ fontSize: 16, background: entry.easebrewGabi ? "#E8F5E0" : "#F5F0E8", color: entry.easebrewGabi ? G : "#aaa", borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>
                      {entry.easebrewGabi ? "☕✅" : "☕❌"} Gabi
                    </span>
                    {entry.avocadoOil && (
                      <span style={{ fontSize: 16, background: "#E8F5E0", color: G, borderRadius: 8, padding: "5px 12px", fontWeight: 600 }}>
                        🌿✅ Avocado Oil
                      </span>
                    )}
                    {entry.painLocation && (
                      <span style={{ fontSize: 16, background: "#F0EDE6", color: MID, borderRadius: 8, padding: "5px 12px" }}>
                        📍 {entry.painLocation}
                      </span>
                    )}
                  </div>

                  {/* 4.1 FIX: 15px → 16px */}
                  {entry.notes ? (
                    <p style={{ fontSize: 16, color: MID, margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>
                      &quot;{entry.notes}&quot;
                    </p>
                  ) : null}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: WHITE,
        borderTop: `2px solid ${CREAM}`, padding: "14px 24px",
        display: "flex", justifyContent: "center",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
      }}>
        {/* 4.2 FIX: minHeight 52px + display flex para centered */}
        <Link href="/" style={{
          background: G, color: WHITE, borderRadius: 14,
          padding: "16px 40px", minHeight: 52,
          display: "flex", alignItems: "center",
          fontSize: 18, fontWeight: 700,
          textDecoration: "none", fontFamily: "Georgia, serif",
        }}>
          🏠 Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}
