"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

// ─── PROGRESS SYNC HELPERS ───────────────────────────────────
// Saves to localStorage immediately (optimistic), syncs to Supabase in background
async function syncExerciseProgress(days: number[], exercises: string[]) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'exercise', data: { days, exercises } }),
    });
  } catch {
    // Silent fail — localStorage is the fallback
  }
}

function getStoredCompletedDays(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("eb_completed_days");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function getStoredCompletedExercises(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("eb_completed_exercises");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

type Phase = { phase: number; name: string; weeks: string; color: string; bg: string; days: Day[] };
type Day = { day: number; title: string; exercises: Exercise[] };
type Exercise = { name: string; sets?: number; reps?: string; duration?: string; rest: string; instruction: string; modification?: string };

const PHASE_COLORS = {
  1: { bg: "#E8F5E0", color: "#39613B", border: "#7DAE2F" },
  2: { bg: "#FEF9E7", color: "#C0863B", border: "#FED255" },
  3: { bg: "#F0F4FF", color: "#2D4A8F", border: "#6B8FD4" },
};

const PHASE_EMOJI = { 1: "🌱", 2: "💪", 3: "🏆" };

const EXERCISE_PROGRAM: Phase[] = [
  {
    phase: 1, name: "Foundation & Mobility", weeks: "Week 1–2", color: "#39613B", bg: "#E8F5E0",
    days: [
      { day: 1, title: "Gentle Morning Activation", exercises: [
        { name: "Neck Rolls", sets: 2, reps: "5 each direction", rest: "30s", instruction: "Dahan-dahang i-roll ang ulo sa circular motion. Huwag puwersahin.", modification: "Maaaring gawin habang nakaupo" },
        { name: "Shoulder Circles", sets: 2, reps: "10 each direction", rest: "30s", instruction: "I-rotate ang mga balikat forward at backward ng dahan-dahan." },
        { name: "Seated Hip Circles", sets: 2, reps: "8 each direction", rest: "30s", instruction: "Habang nakaupo, i-rotate ang balakang sa circular motion.", modification: "Hawakan ang upuan para sa balance" },
        { name: "Ankle Pumps", sets: 2, reps: "15 each foot", rest: "20s", instruction: "I-flex at i-point ang paa ng paulit-ulit para mapabilis ang circulation." },
        { name: "Seated Knee Extensions", sets: 2, reps: "10 each leg", rest: "30s", instruction: "Habang nakaupo, i-straighten ang binti at hawakan ng 3 segundo.", modification: "I-reduce ang range kung may pain" },
      ]},
      { day: 2, title: "Rest & Light Walking", exercises: [
        { name: "Easy Walking", duration: "10–15 mins", rest: "N/A", instruction: "Maglakad sa loob ng bahay o sa labas. Relax lang, hindi kailangan mabilis." },
        { name: "Deep Breathing", sets: 1, reps: "10 breaths", rest: "N/A", instruction: "Huminga nang malalim sa loob ng 4 segundo, hawak 4 segundo, labas 4 segundo." },
      ]},
      { day: 3, title: "Upper Body Mobility", exercises: [
        { name: "Wall Angels", sets: 2, reps: "8 reps", rest: "45s", instruction: "Tumayo sa harap ng pader. I-slide ang mga kamay pataas at pababa habang nakadikit sa pader.", modification: "Pwedeng gawin habang nakaupo" },
        { name: "Chest Stretch", sets: 2, duration: "20 seconds", rest: "30s", instruction: "I-clasp ang mga kamay sa likod at i-open ang dibdib. Huminga nang malalim." },
        { name: "Seated Rows (with towel)", sets: 2, reps: "12 reps", rest: "45s", instruction: "Gamitin ang tuwalya. I-hold ang dalawang dulo at i-pull papalapit sa katawan." },
        { name: "Wrist Circles", sets: 2, reps: "10 each direction", rest: "20s", instruction: "I-rotate ang mga pulso sa circular motion. Para sa mga may carpal tunnel." },
      ]},
      { day: 4, title: "Rest Day", exercises: [
        { name: "Gentle Stretching", duration: "10 mins", rest: "N/A", instruction: "Mag-stretch ng buong katawan ng dahan-dahan. Walang puwersahan." },
        { name: "Easebrew + Hydration", duration: "Throughout the day", rest: "N/A", instruction: "Siguraduhing uminom ng Easebrew at 8 glasses ng tubig ngayon." },
      ]},
      { day: 5, title: "Lower Body Strength", exercises: [
        { name: "Chair Squats", sets: 3, reps: "8–10 reps", rest: "60s", instruction: "Tumayo mula sa upuan at bumalik ng dahan-dahan. Hawakan ang armrests kung kailangan.", modification: "Gumamit ng matibay na upuan" },
        { name: "Standing Calf Raises", sets: 2, reps: "12 reps", rest: "45s", instruction: "Tumayo at i-raise ang mga paa sa toes. Hawakan ang pader para sa balance.", modification: "Maaaring gawin habang nakaupo" },
        { name: "Side Leg Raises", sets: 2, reps: "10 each leg", rest: "45s", instruction: "Tumayo at i-raise ang binti sa gilid ng dahan-dahan. Hawakan ang pader.", modification: "I-reduce ang height kung may hip pain" },
        { name: "Seated Marching", sets: 2, duration: "30 seconds", rest: "30s", instruction: "Habang nakaupo, alternating i-lift ang mga tuhod parang nagmamartsa." },
      ]},
      { day: 6, title: "Full Body Flexibility", exercises: [
        { name: "Cat-Cow Stretch", sets: 2, reps: "10 reps", rest: "30s", instruction: "Sa kamay at tuhod, alternating i-arch at i-round ang likod ng dahan-dahan.", modification: "Pwede ring gawin sa upuan" },
        { name: "Child's Pose", sets: 2, duration: "30 seconds", rest: "20s", instruction: "Mula sa kamay at tuhod, i-sit back sa heels at i-stretch ang mga kamay pasulong.", modification: "Gumamit ng unan sa pagitan ng puwit at heels" },
        { name: "Seated Spinal Twist", sets: 2, duration: "20s each side", rest: "20s", instruction: "Habang nakaupo, i-twist ang katawan sa kanan at kaliwa ng dahan-dahan." },
        { name: "Lying Hip Flexor Stretch", sets: 2, duration: "25s each side", rest: "20s", instruction: "Humiga, i-hug ang isang tuhod sa dibdib at hawakan.", modification: "Gawin sa kama kung hindi makaya sa sahig" },
      ]},
      { day: 7, title: "Complete Rest", exercises: [
        { name: "Full Rest Day", duration: "All day", rest: "N/A", instruction: "Pahinga ang katawan. Inumin ang Easebrew, mag-massage ng Avocado Oil, at matulog ng maaga." },
      ]},
    ]
  },
  {
    phase: 2, name: "Strength Building", weeks: "Week 3–4", color: "#C0863B", bg: "#FEF9E7",
    days: [
      { day: 8, title: "Upper Body Strength", exercises: [
        { name: "Wall Push-Ups", sets: 3, reps: "10–12 reps", rest: "60s", instruction: "Sa harap ng pader, i-push ang katawan papalayo at papabalik. Mas madali kaysa floor push-ups.", modification: "I-adjust ang distansya mula sa pader" },
        { name: "Resistance Band Rows", sets: 3, reps: "12 reps", rest: "60s", instruction: "I-attach ang band sa pinto o hawakan ng matibay. I-pull papalapit sa katawan.", modification: "Gumamit ng tuwalya kung walang band" },
        { name: "Bicep Curls (light weight)", sets: 2, reps: "12 reps", rest: "45s", instruction: "Gumamit ng light weight (water bottle o 1kg). I-curl ang mga kamay pataas.", modification: "Gawin habang nakaupo" },
        { name: "Shoulder Press (seated)", sets: 2, reps: "10 reps", rest: "45s", instruction: "Hawakan ang light weights sa balikat level, i-press pataas ng dahan-dahan." },
      ]},
      { day: 9, title: "Cardio Walk + Balance", exercises: [
        { name: "Brisk Walking", duration: "20 mins", rest: "N/A", instruction: "Maglakad ng mas mabilis kaysa karaniwang lakad. Dapat nararamdaman ang heart rate na tumataas." },
        { name: "Single Leg Stand", sets: 3, duration: "20s each leg", rest: "30s", instruction: "Tumayo sa isang paa. Hawakan ang pader kung kailangan.", modification: "Hawakan ang upuan para sa balance" },
        { name: "Heel-to-Toe Walking", sets: 2, reps: "10 steps", rest: "30s", instruction: "Maglakad nang parang nasa tali — bawat hakbang, ang heel ay nakaabot sa toes ng nakaraang paa." },
      ]},
      { day: 10, title: "Lower Body Strength", exercises: [
        { name: "Modified Squats", sets: 3, reps: "12 reps", rest: "60s", instruction: "Chair squats na ngayon ay mas mabagal — 3 segundo pababa, 3 segundo pagtayo.", modification: "Gumamit pa rin ng upuan kung kailangan" },
        { name: "Step-Ups (low step)", sets: 2, reps: "8 each leg", rest: "60s", instruction: "Gumamit ng mababang step o libro. I-step up at i-step down ng dahan-dahan.", modification: "Hawakan ang handrail o pader" },
        { name: "Glute Bridge", sets: 3, reps: "12 reps", rest: "45s", instruction: "Humiga, balutin ang tuhod, i-lift ang balakang pataas at hawakan ng 3 segundo.", modification: "I-reduce ang height kung may lower back pain" },
        { name: "Seated Leg Press (wall)", sets: 2, reps: "10 each leg", rest: "45s", instruction: "Humiga malapit sa pader, i-place ang paa sa pader at i-push." },
      ]},
      { day: 11, title: "Active Recovery", exercises: [
        { name: "Swimming or Water Walking", duration: "20–30 mins", rest: "N/A", instruction: "Kung may access sa pool — ang tubig ay nagbibigay ng resistance nang walang joint impact.", modification: "Maglakad lang sa tubig kung hindi marunong lumangoy" },
        { name: "Full Body Stretch", duration: "15 mins", rest: "N/A", instruction: "Mag-stretch ng lahat ng muscle groups. Hawakan ang bawat stretch ng 20–30 segundo." },
      ]},
      { day: 12, title: "Core & Stability", exercises: [
        { name: "Seated Core Twist", sets: 3, reps: "12 each side", rest: "45s", instruction: "Habang nakaupo, i-hold ang light weight sa dibdib at i-twist ang upper body.", modification: "Gawin nang walang weight muna" },
        { name: "Dead Bug (modified)", sets: 2, reps: "8 each side", rest: "60s", instruction: "Humiga, i-extend ang alternating arm at baba habang pinapanatiling flat ang likod.", modification: "I-extend lang ang binti, hindi ang kamay" },
        { name: "Plank (wall or knees)", sets: 2, duration: "20–30 seconds", rest: "60s", instruction: "Wall plank muna — tumayo at i-lean sa pader, parang push-up na walang galaw.", modification: "Knee plank kung mas kaya na" },
        { name: "Pelvic Tilts", sets: 2, reps: "15 reps", rest: "30s", instruction: "Humiga, i-flatten ang likod sa sahig at i-release. Para sa lower back pain." },
      ]},
      { day: 13, title: "Full Body Integration", exercises: [
        { name: "Warm-Up Walk", duration: "5 mins", rest: "N/A", instruction: "Maglakad ng dahan-dahan para i-warm up ang katawan." },
        { name: "Squat to Press", sets: 3, reps: "10 reps", rest: "60s", instruction: "I-combine ang squat at shoulder press. Pababa para sa squat, pataas para sa press." },
        { name: "Lateral Band Walk", sets: 2, reps: "10 steps each way", rest: "45s", instruction: "Gumamit ng resistance band sa mga tuhod. I-step sa gilid ng paulit-ulit.", modification: "Gawin nang walang band muna" },
        { name: "Cool-Down Stretch", duration: "10 mins", rest: "N/A", instruction: "Mag-stretch ng lahat ng major muscle groups. Mag-focus sa mga nag-trabaho ngayon." },
      ]},
      { day: 14, title: "Rest & Recovery", exercises: [
        { name: "Rest Day", duration: "All day", rest: "N/A", instruction: "Pahinga ang katawan. Gamitin ang Avocado Oil para sa self-massage sa masakit na parte." },
      ]},
    ]
  },
  {
    phase: 3, name: "Endurance & Maintenance", weeks: "Week 5–8 (and beyond)", color: "#2D4A8F", bg: "#F0F4FF",
    days: [
      { day: 15, title: "Progressive Cardio", exercises: [
        { name: "Power Walking", duration: "25–30 mins", rest: "N/A", instruction: "Mas mabilis at mas matagal kaysa dati. I-maintain ang conversational pace." },
        { name: "Stair Climbing (if available)", sets: 2, reps: "2 flights", rest: "2 mins", instruction: "Gamitin ang mga hagdan para sa natural na lower body workout.", modification: "Mag-hold ng handrail palagi" },
      ]},
      { day: 16, title: "Strength Maintenance", exercises: [
        { name: "All Phase 2 exercises", duration: "30–40 mins", rest: "As needed", instruction: "Ulitin ang mga paboritong exercises mula sa Phase 2. Dagdagan ang reps o sets kung kaya na.", modification: "I-maintain ang current level kung may pain" },
      ]},
      { day: 17, title: "Flexibility & Yoga-Inspired", exercises: [
        { name: "Sun Salutation (Modified)", sets: 3, reps: "5 rounds", rest: "60s", instruction: "Modified na sun salutation — standing lang, walang floor work kung hindi kaya.", modification: "Gawin ang lahat habang nakatayo" },
        { name: "Yin-Style Hold Stretches", sets: 1, duration: "3–5 mins each", rest: "30s", instruction: "I-hold ang mga stretches nang mas matagal — 2–5 minuto bawat isa para sa deep tissue release." },
      ]},
    ]
  }
];

export default function ExercisePage() {
  const { checking } = useSessionGuard();
  const ready = !checking;
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(getStoredCompletedDays);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(getStoredCompletedExercises);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load: localStorage first, then merge with Supabase ──────
  useEffect(() => {
    if (!ready) return;

    fetch('/api/progress?type=exercise')
      .then(r => r.json())
      .then(res => {
        if (!res?.data) return;
        const { days, exercises } = res.data;
        if (Array.isArray(days)) {
          const merged = new Set<number>(days);
          setCompletedDays(prev => {
            prev.forEach(d => merged.add(d));
            localStorage.setItem("eb_completed_days", JSON.stringify([...merged]));
            return merged;
          });
        }
        if (Array.isArray(exercises)) {
          const mergedEx = new Set<string>(exercises);
          setCompletedExercises(prev => {
            prev.forEach(e => mergedEx.add(e));
            localStorage.setItem("eb_completed_exercises", JSON.stringify([...mergedEx]));
            return mergedEx;
          });
        }
      })
      .catch(() => {});
  }, [ready]);

  // ── Debounced sync to Supabase after every change ────────────
  const triggerSync = (days: Set<number>, exercises: Set<string>) => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      syncExerciseProgress([...days], [...exercises]);
    }, 1000); // 1 second debounce
  };

  const toggleDayComplete = (day: number) => {
    const next = new Set(completedDays);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setCompletedDays(next);
    localStorage.setItem("eb_completed_days", JSON.stringify([...next]));
    triggerSync(next, completedExercises);
  };

  const toggleExercise = (key: string) => {
    const next = new Set(completedExercises);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCompletedExercises(next);
    localStorage.setItem("eb_completed_exercises", JSON.stringify([...next]));
    triggerSync(completedDays, next);
  };

  const currentPhase = EXERCISE_PROGRAM.find(p => p.phase === selectedPhase)!;
  const totalDays = EXERCISE_PROGRAM.flatMap(p => p.days).length;
  const progressPct = Math.round((completedDays.size / totalDays) * 100);

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
        <p style={{ fontSize: 22, color: G, fontWeight: 700 }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── HEADER ── */}
      <div style={{ background: G, padding: "44px 24px 36px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(254,210,85,0.1)", borderRadius: "50%" }} />
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 17, fontWeight: 600, marginBottom: 20 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 20, padding: "6px 18px", fontSize: 16, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
          💪 30-DAY PROGRAM
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 12px 0", color: "#fff", lineHeight: 1.2 }}>Home Exercise Guide</h1>
        <p style={{ fontSize: 18, opacity: 0.9, margin: "0 0 24px 0", lineHeight: 1.6 }}>Safe, low-impact exercises para sa joint pain.<br />Walang gym equipment needed!</p>
        <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, height: 14, overflow: "hidden" }}>
          <div style={{ background: GOLD, height: "100%", width: `${progressPct}%`, transition: "width 0.4s ease", borderRadius: 12 }} />
        </div>
        <p style={{ fontSize: 16, opacity: 0.85, margin: "10px 0 0 0", fontWeight: 600 }}>
          {completedDays.size} / {totalDays} araw na nakumpleto ({progressPct}%)
        </p>
      </div>

      {/* ── EASEBREW REMINDER STRIP ── */}
      <div style={{ background: GOLD, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>☕</span>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: 0 }}>Inumin ang Easebrew bago mag-exercise!</p>
          <p style={{ fontSize: 16, color: AMBER, margin: 0 }}>30 minuto bago simulan — para mas magaan ang katawan</p>
        </div>
      </div>

      {/* ── PHASE SELECTOR ── */}
      <div style={{ padding: "28px 24px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: G, marginBottom: 16 }}>Piliin ang Phase</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EXERCISE_PROGRAM.map((ph) => {
            const c = PHASE_COLORS[ph.phase as keyof typeof PHASE_COLORS];
            const isActive = selectedPhase === ph.phase;
            const emoji = PHASE_EMOJI[ph.phase as keyof typeof PHASE_EMOJI];
            const doneInPhase = ph.days.filter(d => completedDays.has(d.day)).length;
            return (
              <button key={ph.phase} onClick={() => { setSelectedPhase(ph.phase); setExpandedDay(null); }} style={{
                background: isActive ? c.bg : "#FFFFFB", border: `3px solid ${isActive ? c.border : "#C5B99A"}`,
                borderRadius: 18, padding: "20px 22px", textAlign: "left", cursor: "pointer", minHeight: 56,
                display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 36 }}>{emoji}</span>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: c.color, margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: 1 }}>Phase {ph.phase}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: "0 0 4px 0" }}>{ph.name}</p>
                    <p style={{ fontSize: 16, color: MID, margin: 0 }}>{ph.weeks} · {doneInPhase}/{ph.days.length} araw</p>
                  </div>
                </div>
                <span style={{ fontSize: 26, color: c.color }}>{isActive ? "▼" : "▶"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DAYS LIST ── */}
      <div style={{ padding: "28px 24px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: G, marginBottom: 16 }}>{currentPhase.name} — {currentPhase.weeks}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {currentPhase.days.map((day) => {
            const isDone = completedDays.has(day.day);
            const isOpen = expandedDay === day.day;
            const c = PHASE_COLORS[currentPhase.phase as keyof typeof PHASE_COLORS];
            const isRestDay = day.title.toLowerCase().includes("rest");
            return (
              <div key={day.day} style={{ background: "#FFFFFB", border: `2px solid ${isDone ? c.border : "#C5B99A"}`, borderRadius: 18, overflow: "hidden", boxShadow: isDone ? `0 2px 8px ${c.border}40` : "none" }}>
                <div onClick={() => setExpandedDay(isOpen ? null : day.day)} style={{ padding: "20px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: isDone ? c.bg : "transparent", minHeight: 80 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 999, background: isDone ? c.border : isRestDay ? "#F0EAE0" : G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDone ? 22 : 18, fontWeight: 700, color: isDone ? "#fff" : isRestDay ? MID : "#fff", flexShrink: 0 }}>
                      {isDone ? "✓" : isRestDay ? "😴" : day.day}
                    </div>
                    <div>
                      <p style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: "0 0 4px 0", lineHeight: 1.3 }}>{day.title}</p>
                      <p style={{ fontSize: 16, color: MID, margin: 0 }}>
                        {day.exercises.length} {day.exercises.length === 1 ? "activity" : "exercises"}
                        {isDone && <span style={{ color: c.color, fontWeight: 700, marginLeft: 8 }}>✓ Tapos na!</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: isOpen ? G : "#F0EAE0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: isOpen ? "#fff" : G, flexShrink: 0 }}>
                    {isOpen ? "▲" : "▼"}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: "2px solid #E5DDD0" }}>
                    {day.exercises.map((ex, ei) => {
                      const exKey = `${day.day}-${ei}`;
                      const exDone = completedExercises.has(exKey);
                      return (
                        <div key={ei} onClick={() => toggleExercise(exKey)} style={{ padding: "20px 22px", borderBottom: "1px solid #F0EAE0", cursor: "pointer", background: exDone ? "#F4FAF0" : "transparent" }}>
                          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 999, border: `3px solid ${exDone ? G : "#C5B99A"}`, background: exDone ? G : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {exDone && <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>✓</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 19, fontWeight: 700, color: exDone ? G : DARK, margin: "0 0 6px 0", textDecoration: exDone ? "line-through" : "none" }}>{ex.name}</p>
                              <div style={{ display: "inline-block", background: exDone ? "#D6EDCC" : "#E8F5E0", borderRadius: 8, padding: "4px 12px", marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: G, fontWeight: 700, margin: 0 }}>
                                  {ex.sets && ex.reps && `${ex.sets} sets × ${ex.reps}`}
                                  {ex.duration && `⏱ ${ex.duration}`}
                                  {" · "}Rest: {ex.rest}
                                </p>
                              </div>
                              <p style={{ fontSize: 17, color: DARK, margin: "0 0 8px 0", lineHeight: 1.6 }}>{ex.instruction}</p>
                              {ex.modification && (
                                <div style={{ background: "#FEF9E7", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "10px 14px", marginTop: 6 }}>
                                  <p style={{ fontSize: 16, color: AMBER, margin: 0, fontWeight: 600 }}>💡 Modification: {ex.modification}</p>
                                </div>
                              )}
                              {!exDone && <p style={{ fontSize: 16, color: MID, margin: "10px 0 0 0", opacity: 0.75 }}>I-tap para markahan bilang tapos ✓</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ padding: "20px 22px", background: "#FAFAF7" }}>
                      <button onClick={() => toggleDayComplete(day.day)} style={{ width: "100%", background: isDone ? "#F5F0E8" : G, color: isDone ? MID : "#fff", border: isDone ? `2px solid #C5B99A` : "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, lineHeight: 1.3, minHeight: 56 }}>
                        {isDone ? "✓ Tapos na — I-undo" : "✅ Tapos na ang Araw na Ito!"}
                      </button>
                      {!isDone && <p style={{ fontSize: 16, color: MID, textAlign: "center", margin: "10px 0 0 0", opacity: 0.8 }}>I-tap pagkatapos ng lahat ng exercises</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TIPS ── */}
      <div style={{ padding: "36px 24px 0" }}>
        <div style={{ background: "#FFFFFB", border: `2px solid ${G}`, borderRadius: 20, padding: "26px" }}>
          <h3 style={{ fontSize: 21, fontWeight: 700, color: G, margin: "0 0 18px 0" }}>💡 Tips para sa Best Results</h3>
          {[
            { emoji: "☕", text: "Inumin ang Easebrew 30 mins bago mag-exercise para sa mas magaan na pakiramdam." },
            { emoji: "🫒", text: "I-massage ang Avocado Oil sa joints bago at pagkatapos ng exercise." },
            { emoji: "🛑", text: "Huwag puwersahin — kung masakit, stop agad at mag-rest." },
            { emoji: "💧", text: "Uminom ng tubig bago, habang, at pagkatapos ng exercise." },
            { emoji: "📅", text: "Consistent lang — mas mabuti ang 15 mins araw-araw kaysa 1 oras minsan." },
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: i < 4 ? 16 : 0, padding: "14px 16px", background: "#F6F2EA", borderRadius: 12 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.emoji}</span>
              <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.6 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/" style={{ display: "block", background: G, color: "#fff", borderRadius: 16, padding: "22px", fontSize: 20, fontWeight: 700, textDecoration: "none", textAlign: "center", letterSpacing: 0.5 }}>
          ← Bumalik sa Wellness Hub
        </Link>
      </div>
    </div>
  );
}
