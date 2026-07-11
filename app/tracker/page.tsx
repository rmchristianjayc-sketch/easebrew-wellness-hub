"use client";

type SpeechRecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionResultList = { 0: SpeechRecognitionResult; length: number };
type SpeechRecognitionEvent = Event & { results: SpeechRecognitionResultList };
interface SpeechRecognitionInstance {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { localDateStr } from "@/lib/localDate";
import { ChevronLeft, Home, BarChart3, CalendarDays, PenLine, Save, CircleCheck, Smile, Meh, Frown, Angry, Laugh, SmilePlus, Coffee, Sun, Moon, MapPin, Mic, CircleDot, Flame, TrendingDown, TrendingUp, Minus, Trophy, Medal, Star, Zap, ClipboardList, Send } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

const PAIN_LEVELS = [
  { score: 1, Icon: Smile,  label: "Wala",          color: "#22c55e" },
  { score: 3, Icon: SmilePlus, label: "Konti lang", color: "#84cc16" },
  { score: 5, Icon: Meh,    label: "Katamtaman",    color: "#eab308" },
  { score: 7, Icon: Frown,  label: "Masakit",       color: "#f97316" },
  { score: 9, Icon: Angry,  label: "Sobrang sakit",  color: "#ef4444" },
];

const PAIN_LOCATIONS = [
  "Tuhod", "Likod", "Balikat", "Kamay",
  "Paa",   "Leeg",  "Balakang", "Ulo",
];

type DayEntry = {
  date: string;
  painScore: number;
  painLocations: string[];
  easebrewUmaga: boolean;
  easebrewGabi: boolean;
  mood: number;
  notes: string;
};

const emptyEntry = (): DayEntry => ({
  date: localDateStr(),
  painScore: 0,
  painLocations: [],
  easebrewUmaga: false,
  easebrewGabi: false,
  mood: 0,
  notes: "",
});

const MOOD_OPTIONS = [
  { val: 1, Icon: Frown,    label: "Malungkot",     color: "#ef4444" },
  { val: 2, Icon: Meh,      label: "Hindi OK",      color: "#f97316" },
  { val: 3, Icon: Smile,    label: "OK lang",       color: "#eab308" },
  { val: 4, Icon: Laugh,    label: "Masaya",        color: "#22c55e" },
  { val: 5, Icon: SmilePlus, label: "Sobrang saya", color: "#16a34a" },
];

const MILESTONES: Record<number, { Icon: typeof Star; title: string; message: string }> = {
  3:  { Icon: Star,   title: "3 Araw Na!",              message: "Magandang simula! Ituloy lang ang daily tracking — mahalaga ang consistency." },
  7:  { Icon: Star,   title: "1 Linggo Na!",           message: "Magandang simula! Ituloy lang — ang pinakamabilis na resulta ay sa mga susunod na linggo!" },
  14: { Icon: Zap,    title: "2 Linggo Na!",            message: "Napakagaling! Dapat nararamdaman mo na ang pagbabago. Nagpapasalamat ang mga kasukasuan mo!" },
  30: { Icon: Medal,  title: "1 Buwan Kumpleto!",       message: "WOW! 30 araw ng consistency! I-share ang resulta sa pamilya mo. Proud kami sa iyo!" },
  60: { Icon: Flame,  title: "2 Buwan Na!",             message: "Amazing! 60 araw na! Ikaw ang inspirasyon ng mga tao sa paligid mo. Ituloy lang!" },
  90: { Icon: Trophy, title: "90 Araw — BAGONG IKAW!",  message: "CONGRATS! Naabot mo na ang pinakamataas na milestone! Bagong katawan, bagong buhay! Selebrasyon!" },
};

function getPainColor(score: number) {
  if (score <= 2) return "#22c55e";
  if (score <= 4) return "#84cc16";
  if (score <= 6) return "#eab308";
  if (score <= 8) return "#f97316";
  return "#ef4444";
}

function PainIcon({ score }: { score: number }) {
  const Icon = score <= 2 ? Smile : score <= 4 ? SmilePlus : score <= 6 ? Meh : score <= 8 ? Frown : Angry;
  return <Icon size={24} color={getPainColor(score)} />;
}

function calcStreak(entries: DayEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const today = localDateStr();
  const yesterday = localDateStr(new Date(Date.now() - 86400000));
  let check: string | null = (sorted[0].date === today || sorted[0].date === yesterday) ? sorted[0].date : null;
  if (!check) return 0;
  let streak = 0;
  for (const e of sorted) {
    if (e.date === check) {
      streak++;
      const d: Date = new Date(check + "T00:00:00");
      d.setDate(d.getDate() - 1);
      check = localDateStr(d);
    } else break;
  }
  return streak;
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
  const todayStr = localDateStr();
  const found = getStoredTrackerEntries(storageKey).find(e => e.date === todayStr) ?? emptyEntry();
  // migrate old single-string painLocation to array
  const legacy = found as DayEntry & { painLocation?: string };
  if (legacy.painLocation && !found.painLocations?.length) {
    found.painLocations = [legacy.painLocation];
  }
  return found;
}

function MilestoneModal({ days, onClose }: { days: number; onClose: () => void }) {
  const m = MILESTONES[days];
  if (!m) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: 28, padding: "44px 32px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><m.Icon size={40} color={G} strokeWidth={2.5} /></div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1B201A", margin: "0 0 14px", lineHeight: 1.3 }}>Araw {days}! {m.title}</h2>
        <p style={{ fontSize: 17, color: "#4E504F", margin: "0 0 28px", lineHeight: 1.7 }}>{m.message}</p>
        <button
          onClick={onClose}
          style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
        >
          Salamat! Ituloy lang!
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
    const SpeechRec = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition
                   || (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
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
        border: `2px solid ${listening ? "#ef4444" : "#39613B"}`,
        borderRadius: 12, padding: "12px 20px", fontSize: 17,
        color: listening ? "white" : "#39613B",
        cursor: listening ? "default" : "pointer", fontWeight: 700,
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0, minHeight: 48,
      }}
    >
      {listening ? <><CircleDot size={18} /> Nakinikinig...</> : <><Mic size={18} /> Magsalita</>}
    </button>
  );
}

function PainChart({ entries }: { entries: DayEntry[] }) {
  const recent = entries.slice(-30);
  if (recent.length < 2) return null;
  const W = 560, H = 150;
  const PAD = { top: 12, right: 16, bottom: 30, left: 32 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const n = recent.length;
  const px = (i: number) => PAD.left + (i / (n - 1)) * cW;
  const py = (s: number) => PAD.top + cH - (s / 10) * cH;
  const pts = recent.map((e, i) => ({ x: px(i), y: py(e.painScore), s: e.painScore }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[n-1].x.toFixed(1)} ${py(0).toFixed(1)} L ${pts[0].x.toFixed(1)} ${py(0).toFixed(1)} Z`;
  const first = recent[0].painScore;
  const last  = recent[n - 1].painScore;
  const trend = last - first;
  const lineColor = trend <= 0 ? "#22c55e" : "#ef4444";
  const labelIdxs = n <= 5 ? recent.map((_, i) => i) : [0, Math.floor(n / 2), n - 1];
  return (
    <div style={{ background: "#FFFFFB", borderRadius: 16, padding: "20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#39613B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={20} /> Takbo ng Sakit</h3>
        <span style={{ fontSize: 14, fontWeight: 700, color: lineColor, display: "flex", alignItems: "center", gap: 4 }}>
          {trend < 0 ? <><TrendingDown size={16} /> {Math.abs(trend)} — Bumababa!</> : trend === 0 ? <><Minus size={16} /> Pareho lang</> : <><TrendingUp size={16} /> {trend} — Tumataas</>}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {[0, 2, 4, 6, 8, 10].map(s => (
          <g key={s}>
            <line x1={PAD.left} y1={py(s)} x2={W - PAD.right} y2={py(s)} stroke="#f0ece4" strokeWidth={1} />
            <text x={PAD.left - 5} y={py(s) + 4} textAnchor="end" fontSize={9} fill="#bbb">{s}</text>
          </g>
        ))}
        <path d={area} fill={lineColor} fillOpacity={0.08} />
        <path d={line} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={lineColor} stroke="white" strokeWidth={1.5} />
        ))}
        {labelIdxs.map(i => {
          if (!pts[i]) return null;
          const label = new Date(recent[i].date + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });
          return <text key={i} x={pts[i].x} y={H - 5} textAnchor="middle" fontSize={9} fill="#aaa">{label}</text>;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 16, color: "#4E504F" }}>Simula: <strong style={{ color: "#1B201A" }}>{first}/10</strong></span>
        <span style={{ fontSize: 16, color: "#4E504F" }}>Ngayon: <strong style={{ color: lineColor }}>{last}/10</strong></span>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const { checking, session } = useSessionGuard();
  const storageKey = progressStorageKey("easebrew-tracker-v2", session?.code);
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [today, setToday]     = useState<DayEntry>(emptyEntry);
  const [view, setView]       = useState<"today" | "history">("today");
  const [saved, setSaved]     = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [prefilledFromYesterday, setPrefilledFromYesterday] = useState(false);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingEntriesRef = useRef<DayEntry[] | null>(null);
  const todayDirtyRef = useRef(false);

  useEffect(() => {
    if (checking || !session) return;

    async function loadProgress() {
      const localEntries = getStoredTrackerEntries(storageKey);
      setEntries(localEntries);
      setToday(getStoredTodayEntry(storageKey));

      // Smart pre-fill: if today is empty, carry yesterday's values
      const todayStr = localDateStr();
      const todayExists = localEntries.some(e => e.date === todayStr);
      if (!todayExists && localEntries.length > 0) {
        const yesterday = localEntries[localEntries.length - 1];
        if (yesterday) {
          setToday(prev => ({
            ...prev,
            painScore:      yesterday.painScore      || prev.painScore,
            painLocations:  yesterday.painLocations?.length ? yesterday.painLocations : prev.painLocations,
            mood:           yesterday.mood           || prev.mood,
          }));
          setPrefilledFromYesterday(true);
        }
      }

      fetch('/api/progress?type=tracker')
        .then(r => r.json())
        .then(res => {
          const remoteEntries: DayEntry[] = Array.isArray(res?.data?.entries) ? res.data.entries : [];
          if (remoteEntries.length === 0) return;

          // Merge: prefer local entries where they exist (they're either
          // unsynced edits or already-flushed edits — either way, they
          // are at least as fresh as the remote snapshot). Fall back to
          // remote only for dates local doesn't have.
          const map = new Map<string, DayEntry>();
          remoteEntries.forEach(e => map.set(e.date, e));
          localEntries.forEach(e => map.set(e.date, e));

          const merged = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
          setEntries(merged);
          writeProgressCache(storageKey, merged);

          // Only overwrite `today` if the user hasn't started editing —
          // otherwise the network response wipes their in-progress input.
          if (!todayDirtyRef.current) {
            const mergedToday = merged.find(e => e.date === todayStr);
            if (mergedToday) setToday(mergedToday);
          }
        })
        .catch(() => {});
    }

    loadProgress();
    return () => {
      // If a debounced sync is queued, fire it NOW so the customer's
      // last edit isn't lost when they navigate away within the 1-second
      // debounce window.
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
        syncTimeout.current = null;
        if (pendingEntriesRef.current) {
          syncTrackerProgress(pendingEntriesRef.current);
          pendingEntriesRef.current = null;
        }
      }
    };
  }, [checking, session, storageKey]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Coffee size={22} /> Sandali lang...</p>
    </div>
  );

  const triggerSync = (allEntries: DayEntry[]) => {
    // Store the most recent snapshot so unmount cleanup can flush it if
    // the debounce timer hasn't fired yet.
    pendingEntriesRef.current = allEntries;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      const snapshot = pendingEntriesRef.current;
      pendingEntriesRef.current = null;
      if (snapshot) syncTrackerProgress(snapshot);
    }, 1000);
  };

  // Wrap setToday so any user edit flips the dirty flag, preventing the
  // slow /api/progress fetch response from clobbering their input.
  const setTodayDirty: typeof setToday = (v) => {
    todayDirtyRef.current = true;
    setToday(v);
  };

  const saveEntry = () => {
    if (!session) return;
    const todayStr = localDateStr();
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
    // Scope the milestone-shown flag per session code so a returning
    // customer with a new pack (or two customers sharing a device) each
    // see their own celebration modals.
    const milestoneKey = `eb_milestone_${session?.code ?? "shared"}_${newTotal}`;
    if (MILESTONES[newTotal] && localStorage.getItem(milestoneKey) !== "1") {
      localStorage.setItem(milestoneKey, "1");
      setMilestone(newTotal);
      playChime("milestone");
    }
  };

  function generateSummary() {
    if (entries.length === 0) return "";
    const firstPain = entries[0].painScore;
    const latestPain = entries[entries.length - 1].painScore;
    const recentNotes = entries.slice(-3).filter(e => e.notes).map(e => `• ${e.notes}`);
    const trend = latestPain < firstPain ? "Bumababa ang sakit!" : latestPain === firstPain ? "Pareho lang" : "Tumaas ng konti";
    const todayDate = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    return [
      `EaseBrew Progress Report`,
      `Petsa: ${todayDate}`,
      ``,
      `Kabuuang araw na-log: ${totalDays}`,
      `Streak: ${calcStreak(entries)} sunod-sunod na araw`,
      `Average na sakit: ${avgPain}/10`,
      `Consistency (2x/araw): ${consistRate}%`,
      `Takbo ng sakit: ${firstPain} → ${latestPain} ${trend}`,
      recentNotes.length > 0 ? `\nMga notes kamakailan:\n${recentNotes.join("\n")}` : ``,
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

  const todayStr = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>
      {milestone && <MilestoneModal days={milestone} onClose={() => setMilestone(null)} />}

      {/* ── HEADER ── */}
      <div style={{ background: G, padding: "24px 24px 0", color: WHITE }}>
        <Link href="/" style={{ color: GOLD, fontSize: 16, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, minHeight: 44, marginBottom: 14, fontWeight: 600 }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={24} /> Pain Tracker</h1>
            <p style={{ fontSize: 16, opacity: 0.8, margin: "4px 0 0 0" }}>I-track ang progress mo araw-araw</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 16px" }}>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: GOLD }}>Araw {totalDays}</p>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>logged na</p>
            </div>
            {calcStreak(entries) > 0 && (
              <div style={{ textAlign: "center", background: "rgba(255,200,0,0.2)", borderRadius: 14, padding: "10px 16px" }}>
                <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: GOLD, display: "flex", alignItems: "center", gap: 4 }}><Flame size={22} />{calcStreak(entries)}</p>
                <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>sunod-sunod!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
          {[
            { label: "Avg Sakit", value: avgPain     },
            { label: "2x/araw",   value: `${consistRate}%` },
            { label: "Araw",      value: `${totalDays}`    },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", textAlign: "center" as const }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 16, opacity: 0.8, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 16 }}>
          {(["today", "history"] as const).map(t => (
            <button key={t} onClick={() => setView(t)} style={{
              flex: 1, padding: "16px 8px", border: "none", background: "transparent",
              fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
              color: view === t ? GOLD : "rgba(255,255,255,0.6)",
              borderBottom: view === t ? `4px solid ${GOLD}` : "4px solid transparent",
              minHeight: 56,
            }}>
              {t === "today" ? <><PenLine size={18} /> Ngayon</> : <><CalendarDays size={18} /> History</>}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ NGAYON TAB ═══ */}
      {view === "today" && (
        <div style={{ padding: "24px 20px" }}>

              {prefilledFromYesterday && (
                <div style={{ background: "#EEF4FF", border: "1px solid #93C5FD", borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontSize: 17, color: "#1D4ED8", display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                  <Zap size={20} /> Na-pre-fill mula sa kahapon — i-bago kung kailangan.
                </div>
              )}

          <p style={{ fontSize: 16, color: MID, margin: "0 0 24px 0", textAlign: "center", fontWeight: 600 }}>
            <CalendarDays size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {todayStr}
          </p>

          {/* ── EASEBREW 2x CHECK ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>1</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Coffee size={20} /> EaseBrew Ngayon</h2>
            </div>
            <p style={{ fontSize: 18, color: MID, margin: "0 0 18px 0" }}>Na-inom mo na ba ang EaseBrew mo?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "easebrewUmaga" as const, Icon: Sun,  label: "Umaga",      sub: "1st sachet ng araw",   activeColor: G },
                { key: "easebrewGabi"  as const, Icon: Moon, label: "Gabi",        sub: "2nd sachet ng araw",   activeColor: G },
              ].map(({ key, Icon, label, sub, activeColor }) => (
                <button
                  key={key}
                  onClick={() => setTodayDirty(e => ({ ...e, [key]: !e[key] }))}
                  style={{
                    width: "100%", padding: "20px 24px", borderRadius: 16, border: "none",
                    background: today[key] ? activeColor : "#F0F0E8",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", transition: "all 0.2s", minHeight: 72,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: today[key] ? "rgba(255,255,255,0.2)" : "#E8F5E0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={24} color={today[key] ? WHITE : G} />
                    </div>
                    <div style={{ textAlign: "left" as const }}>
                      <p style={{ fontSize: 19, fontWeight: 700, color: today[key] ? WHITE : DARK, margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 16, color: today[key] ? "rgba(255,255,255,0.8)" : MID, margin: 0 }}>{sub}</p>
                    </div>
                  </div>
                  {today[key] ? <CircleCheck size={28} color={WHITE} /> : <div style={{ width: 28, height: 28, borderRadius: 8, border: "2px solid #D9D0C0" }} />}
                </button>
              ))}
            </div>

            {today.easebrewUmaga && today.easebrewGabi && (
              <div style={{ marginTop: 14, background: "#E8F5E0", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const }}>
                <p style={{ fontSize: 17, color: G, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CircleCheck size={20} /> Magaling! 2x na ngayong araw! Ituloy lang!</p>
              </div>
            )}
            {(today.easebrewUmaga || today.easebrewGabi) && !(today.easebrewUmaga && today.easebrewGabi) && (
              <div style={{ marginTop: 14, background: "#FEF9E7", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const }}>
                <p style={{ fontSize: 16, color: AMBER, fontWeight: 600, margin: 0 }}>
                  <Zap size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Isa pa! Huwag kalimutang uminom {today.easebrewUmaga ? "mamayang gabi" : "mamayang umaga"}!
                </p>
              </div>
            )}
          </div>

          {/* ── PAIN LEVEL ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>2</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: 0 }}>Gaano kasakit ngayon?</h2>
            </div>
            <p style={{ fontSize: 18, color: MID, margin: "0 0 18px 0" }}>Piliin ang pinakamalapit sa nararamdaman mo</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PAIN_LEVELS.map(p => (
                <button
                  key={p.score}
                  onClick={() => setTodayDirty(e => ({ ...e, painScore: p.score }))}
                  style={{
                    width: "100%", padding: "18px 20px", borderRadius: 16,
                    border: today.painScore === p.score ? `3px solid ${p.color}` : "2.5px solid #E0D8CC",
                    background: today.painScore === p.score ? p.color : WHITE,
                    display: "flex", alignItems: "center", gap: 16,
                    cursor: "pointer", transition: "all 0.15s", minHeight: 64,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: today.painScore === p.score ? "rgba(255,255,255,0.2)" : p.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><p.Icon size={26} color={today.painScore === p.score ? WHITE : p.color} /></div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: today.painScore === p.score ? WHITE : DARK }}>
                    {p.label}
                  </span>
                  {today.painScore === p.score && (
                    <span style={{ marginLeft: "auto" }}><CircleCheck size={24} color={WHITE} /></span>
                  )}
                </button>
              ))}
            </div>
            {today.painScore >= 7 && (
              <div style={{ marginTop: 14, background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 15, color: "#991b1b", margin: 0, fontWeight: 600, lineHeight: 1.55 }}>
                  <strong>⚠ Paalala:</strong> Kung matagal na o lumalala ang sakit, magpakonsulta sa doctor. Kung may hirap huminga, pananakit ng dibdib, o pamamanhid, tumawag agad ng emergency.
                </p>
              </div>
            )}
          </div>

          {/* ── PAIN LOCATION ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>3</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><MapPin size={20} /> Saan masakit?</h2>
            </div>
            <p style={{ fontSize: 18, color: MID, margin: "0 0 16px 0" }}>Pwede marami — i-tap lahat ng masakit</p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
              {PAIN_LOCATIONS.map(loc => {
                const selected = today.painLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    onClick={() => {
                      setTodayDirty(e => ({
                        ...e,
                        painLocations: selected
                          ? e.painLocations.filter(l => l !== loc)
                          : [...e.painLocations, loc],
                      }));
                      playChime("check");
                    }}
                    style={{
                      padding: "16px 22px", borderRadius: 14,
                      border: selected ? `3px solid ${G}` : "2px solid #D9D0C0",
                      minHeight: 58,
                      background: selected ? G : "#F0EDE6",
                      color: selected ? WHITE : DARK,
                      fontSize: 18, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {selected && <CircleCheck size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />}{loc}
                  </button>
                );
              })}
            </div>
            {today.painLocations.length === 0 && (
              <p style={{ fontSize: 16, color: "#aaa", margin: "12px 0 0", textAlign: "center" as const, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                Walang sakit ngayon? Magaling! <CircleCheck size={16} color="#22c55e" />
              </p>
            )}
          </div>

          {/* ── MOOD ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>4</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Smile size={20} /> Paano ang mood mo?</h2>
            </div>
            <p style={{ fontSize: 18, color: MID, margin: "0 0 16px 0" }}>I-tap ang pinakamalapit sa pakiramdam mo ngayon</p>
            <div style={{ display: "flex", gap: 8 }}>
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.val}
                  onClick={() => setTodayDirty(e => ({ ...e, mood: m.val }))}
                  style={{
                    flex: 1, padding: "14px 4px", borderRadius: 14,
                    border: today.mood === m.val ? `3px solid ${G}` : "2px solid #E0D8CC",
                    background: today.mood === m.val ? "#E8F5E0" : WHITE,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 6, cursor: "pointer", transition: "all 0.15s",
                    minHeight: 80,
                  }}
                >
                  <m.Icon size={28} color={today.mood === m.val ? G : m.color} />
                  <span style={{ fontSize: 16, color: today.mood === m.val ? G : MID, fontWeight: 600, textAlign: "center" as const, lineHeight: 1.2 }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── NOTES ── */}
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>5</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><PenLine size={20} /> Ano ang nararamdaman mo?</h2>
            </div>
            <p style={{ fontSize: 18, color: MID, margin: "0 0 14px 0" }}>Opsyonal — pero makakatulong kung isusulat mo</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <VoiceButton onResult={(text) => setTodayDirty(p => ({ ...p, notes: p.notes ? p.notes + " " + text : text }))} />
            </div>
            <textarea
              value={today.notes}
              onChange={e => setTodayDirty(p => ({ ...p, notes: e.target.value }))}
              placeholder="Halimbawa: Mas magaan ang tuhod ko ngayon. Nakatulog nang maayos."
              rows={5}
              style={{ width: "100%", padding: "16px", borderRadius: 14, border: `2px solid #D9D0C0`, fontSize: 18, resize: "none", outline: "none", background: "#FAFAF8", color: DARK, fontFamily: "inherit", boxSizing: "border-box" as const, lineHeight: 1.7 }}
            />
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
              boxShadow: "0 4px 16px rgba(57,97,59,0.3)", minHeight: 68,
            }}
          >
            {saved ? <><CircleCheck size={22} /> Na-save na! Magaling!</> : <><Save size={22} /> I-save ang Record</>}
          </button>

          <p style={{ textAlign: "center", fontSize: 16, color: MID, marginTop: 14, lineHeight: 1.6 }}>
            Gawin ito araw-araw para makita ang progress mo!
          </p>
        </div>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {view === "history" && (
        <div style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 8 }}><CalendarDays size={22} /> Inyong Record</h2>
          <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0" }}>Tingnan ang daily progress mo</p>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: WHITE, borderRadius: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "#E8F5E0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><ClipboardList size={28} color={G} /></div>
              <p style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Wala pang record</p>
              <p style={{ fontSize: 17, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>I-tap ang &quot;Ngayon&quot; para magsimula!</p>
              <button
                onClick={() => setView("today")}
                style={{ background: G, color: WHITE, border: "none", borderRadius: 14, padding: "18px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", minHeight: 56, display: "flex", alignItems: "center", gap: 8, margin: "0 auto" }}
              >
                <PenLine size={18} /> Magsimula →
              </button>
            </div>
          ) : (
            <>
              {/* Summary card */}
              <div style={{ background: G, borderRadius: 20, padding: "22px 20px", marginBottom: 20, display: "flex", gap: 12 }}>
                {[
                  { label: "Araw",      value: `${totalDays}` },
                  { label: "Avg Sakit", value: avgPain        },
                  { label: "2x/araw",   value: `${consistRate}%` },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" as const }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: GOLD, margin: 0 }}>{s.value}</p>
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
                {summaryCopied ? <><CircleCheck size={18} /> Na-copy na! I-paste sa chat ng Coach</> : <><Send size={18} /> I-share ang Progress sa Coach</>}
              </button>

              <PainChart entries={entries} />

              {[...entries].reverse().map((entry, i) => (
                <div key={i} style={{
                  background: WHITE, borderRadius: 18, padding: "20px",
                  marginBottom: 12, borderLeft: `5px solid ${getPainColor(entry.painScore)}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>
                      {new Date(entry.date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PainIcon score={entry.painScore} />
                      <span style={{
                        background: getPainColor(entry.painScore), color: WHITE,
                        borderRadius: 10, padding: "4px 12px", fontSize: 16, fontWeight: 700,
                      }}>
                        {entry.painScore}/10
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: entry.notes ? 10 : 0 }}>
                    <span style={{ fontSize: 16, background: entry.easebrewUmaga ? "#E8F5E0" : "#F5F0E8", color: entry.easebrewUmaga ? G : "#aaa", borderRadius: 8, padding: "5px 12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Coffee size={14} />{entry.easebrewUmaga ? <CircleCheck size={14} /> : <Minus size={14} />} AM
                    </span>
                    <span style={{ fontSize: 16, background: entry.easebrewGabi ? "#E8F5E0" : "#F5F0E8", color: entry.easebrewGabi ? G : "#aaa", borderRadius: 8, padding: "5px 12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Coffee size={14} />{entry.easebrewGabi ? <CircleCheck size={14} /> : <Minus size={14} />} PM
                    </span>
                    {(entry.painLocations?.length > 0) && entry.painLocations.map(loc => (
                      <span key={loc} style={{ fontSize: 16, background: "#F0EDE6", color: MID, borderRadius: 8, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={14} /> {loc}
                      </span>
                    ))}
                  </div>

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
        <Link href="/" style={{
          background: G, color: WHITE, borderRadius: 14,
          padding: "16px 40px", minHeight: 52,
          display: "flex", alignItems: "center",
          fontSize: 18, fontWeight: 700,
          textDecoration: "none", fontFamily: "Georgia, serif",
        }}>
          <Home size={20} /> Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}
