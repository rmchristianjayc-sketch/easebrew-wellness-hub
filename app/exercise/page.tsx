"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { ChevronLeft, ChevronUp, ChevronDown, Dumbbell, Sprout, Trophy, Coffee, Lightbulb, Droplets, OctagonX, CalendarDays, CircleCheck, Moon as MoonIcon } from "lucide-react";

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

function getStoredCompletedDays(storageKey: string): Set<number> {
  return new Set(readProgressCache<number[]>(storageKey, []));
}

function getStoredCompletedExercises(storageKey: string): Set<string> {
  return new Set(readProgressCache<string[]>(storageKey, []));
}

type Phase = { phase: number; name: string; weeks: string; color: string; bg: string; days: Day[] };
type Day = { day: number; title: string; exercises: Exercise[] };
type Exercise = { name: string; sets?: number; reps?: string; duration?: string; rest: string; instruction: string; modification?: string };

const PHASE_COLORS = {
  1: { bg: "#E8F5E0", color: "#39613B", border: "#7DAE2F" },
  2: { bg: "#FEF9E7", color: "#C0863B", border: "#FED255" },
  3: { bg: "#F0F4FF", color: "#2D4A8F", border: "#6B8FD4" },
};

const PHASE_ICON = { 1: Sprout, 2: Dumbbell, 3: Trophy };

const EXERCISE_PROGRAM: Phase[] = [
  {
    phase: 1, name: "Foundation & Mobility", weeks: "Week 1–2", color: "#39613B", bg: "#E8F5E0",
    days: [
      { day: 1, title: "Gentle Morning Activation", exercises: [
        { name: "Neck Rolls", sets: 2, reps: "5 each direction", rest: "30s", instruction: "Slowly roll your head in a circular motion. Don't force it.", modification: "Can be done while seated" },
        { name: "Shoulder Circles", sets: 2, reps: "10 each direction", rest: "30s", instruction: "Rotate your shoulders forward and backward slowly." },
        { name: "Seated Hip Circles", sets: 2, reps: "8 each direction", rest: "30s", instruction: "While seated, rotate your hips in a circular motion.", modification: "Hold the chair for balance" },
        { name: "Ankle Pumps", sets: 2, reps: "15 each foot", rest: "20s", instruction: "Flex and point your feet repeatedly to improve circulation." },
        { name: "Seated Knee Extensions", sets: 2, reps: "10 each leg", rest: "30s", instruction: "While seated, straighten your leg and hold for 3 seconds.", modification: "Reduce the range if there's pain" },
      ]},
      { day: 2, title: "Rest & Light Walking", exercises: [
        { name: "Easy Walking", duration: "10–15 mins", rest: "N/A", instruction: "Walk around the house or outside. Keep it relaxed, no need to rush." },
        { name: "Deep Breathing", sets: 1, reps: "10 breaths", rest: "N/A", instruction: "Breathe in deeply for 4 seconds, hold for 4 seconds, exhale for 4 seconds." },
      ]},
      { day: 3, title: "Upper Body Mobility", exercises: [
        { name: "Wall Angels", sets: 2, reps: "8 reps", rest: "45s", instruction: "Stand facing the wall. Slide your hands up and down while keeping them against the wall.", modification: "Can be done while seated" },
        { name: "Chest Stretch", sets: 2, duration: "20 seconds", rest: "30s", instruction: "Clasp your hands behind your back and open your chest. Breathe deeply." },
        { name: "Seated Rows (with towel)", sets: 2, reps: "12 reps", rest: "45s", instruction: "Use a towel. Hold both ends and pull toward your body." },
        { name: "Wrist Circles", sets: 2, reps: "10 each direction", rest: "20s", instruction: "Rotate your wrists in a circular motion. Good for carpal tunnel." },
      ]},
      { day: 4, title: "Rest Day", exercises: [
        { name: "Gentle Stretching", duration: "10 mins", rest: "N/A", instruction: "Stretch your whole body slowly. Don't force it." },
        { name: "Easebrew + Hydration", duration: "Throughout the day", rest: "N/A", instruction: "Make sure to drink Easebrew and 8 glasses of water today." },
      ]},
      { day: 5, title: "Lower Body Strength", exercises: [
        { name: "Chair Squats", sets: 3, reps: "8–10 reps", rest: "60s", instruction: "Stand up from the chair and sit back down slowly. Hold armrests if needed.", modification: "Use a sturdy chair" },
        { name: "Standing Calf Raises", sets: 2, reps: "12 reps", rest: "45s", instruction: "Stand and raise up onto your toes. Hold the wall for balance.", modification: "Can be done while seated" },
        { name: "Side Leg Raises", sets: 2, reps: "10 each leg", rest: "45s", instruction: "Stand and raise your leg to the side slowly. Hold the wall.", modification: "Reduce the height if there's hip pain" },
        { name: "Seated Marching", sets: 2, duration: "30 seconds", rest: "30s", instruction: "While seated, alternately lift your knees as if marching." },
      ]},
      { day: 6, title: "Full Body Flexibility", exercises: [
        { name: "Cat-Cow Stretch", sets: 2, reps: "10 reps", rest: "30s", instruction: "On hands and knees, alternate between arching and rounding your back slowly.", modification: "Can also be done on a chair" },
        { name: "Child's Pose", sets: 2, duration: "30 seconds", rest: "20s", instruction: "From hands and knees, sit back onto your heels and stretch your arms forward.", modification: "Place a pillow between your hips and heels" },
        { name: "Seated Spinal Twist", sets: 2, duration: "20s each side", rest: "20s", instruction: "While seated, twist your body to the right and left slowly." },
        { name: "Lying Hip Flexor Stretch", sets: 2, duration: "25s each side", rest: "20s", instruction: "Lie down and hug one knee to your chest.", modification: "Do it on the bed if the floor is too difficult" },
      ]},
      { day: 7, title: "Complete Rest", exercises: [
        { name: "Full Rest Day", duration: "All day", rest: "N/A", instruction: "Rest your body. Drink EaseBrew and sleep early." },
      ]},
    ]
  },
  {
    phase: 2, name: "Strength Building", weeks: "Week 3–4", color: "#C0863B", bg: "#FEF9E7",
    days: [
      { day: 8, title: "Upper Body Strength", exercises: [
        { name: "Wall Push-Ups", sets: 3, reps: "10–12 reps", rest: "60s", instruction: "Face the wall and push your body away and back. Easier than floor push-ups.", modification: "Adjust the distance from the wall" },
        { name: "Resistance Band Rows", sets: 3, reps: "12 reps", rest: "60s", instruction: "Attach the band to a door or hold it firmly. Pull toward your body.", modification: "Use a towel if no band is available" },
        { name: "Bicep Curls (light weight)", sets: 2, reps: "12 reps", rest: "45s", instruction: "Use a light weight (water bottle or 1kg). Curl your hands upward.", modification: "Can be done while seated" },
        { name: "Shoulder Press (seated)", sets: 2, reps: "10 reps", rest: "45s", instruction: "Hold light weights at shoulder level and press upward slowly." },
      ]},
      { day: 9, title: "Cardio Walk + Balance", exercises: [
        { name: "Brisk Walking", duration: "20 mins", rest: "N/A", instruction: "Walk faster than usual. You should feel your heart rate increasing." },
        { name: "Single Leg Stand", sets: 3, duration: "20s each leg", rest: "30s", instruction: "Stand on one foot. Hold the wall if needed.", modification: "Hold a chair for balance" },
        { name: "Heel-to-Toe Walking", sets: 2, reps: "10 steps", rest: "30s", instruction: "Walk as if on a tightrope — each step, your heel touches the toes of your previous foot." },
      ]},
      { day: 10, title: "Lower Body Strength", exercises: [
        { name: "Modified Squats", sets: 3, reps: "12 reps", rest: "60s", instruction: "Chair squats but slower — 3 seconds going down, 3 seconds standing up.", modification: "Still use a chair if needed" },
        { name: "Step-Ups (low step)", sets: 2, reps: "8 each leg", rest: "60s", instruction: "Use a low step or book. Step up and step down slowly.", modification: "Hold the handrail or wall" },
        { name: "Glute Bridge", sets: 3, reps: "12 reps", rest: "45s", instruction: "Lie down, bend your knees, lift your hips up and hold for 3 seconds.", modification: "Reduce the height if there's lower back pain" },
        { name: "Seated Leg Press (wall)", sets: 2, reps: "10 each leg", rest: "45s", instruction: "Lie near a wall, place your feet on the wall and push." },
      ]},
      { day: 11, title: "Active Recovery", exercises: [
        { name: "Swimming or Water Walking", duration: "20–30 mins", rest: "N/A", instruction: "If you have access to a pool — water provides resistance without joint impact.", modification: "Just walk in the water if you can't swim" },
        { name: "Full Body Stretch", duration: "15 mins", rest: "N/A", instruction: "Stretch all muscle groups. Hold each stretch for 20–30 seconds." },
      ]},
      { day: 12, title: "Core & Stability", exercises: [
        { name: "Seated Core Twist", sets: 3, reps: "12 each side", rest: "45s", instruction: "While seated, hold a light weight at your chest and twist your upper body.", modification: "Do it without weight first" },
        { name: "Dead Bug (modified)", sets: 2, reps: "8 each side", rest: "60s", instruction: "Lie down, extend alternating arm and leg while keeping your back flat.", modification: "Extend only the leg, not the arm" },
        { name: "Plank (wall or knees)", sets: 2, duration: "20–30 seconds", rest: "60s", instruction: "Start with wall plank — stand and lean against the wall, like a push-up without moving.", modification: "Knee plank if you're ready for more" },
        { name: "Pelvic Tilts", sets: 2, reps: "15 reps", rest: "30s", instruction: "Lie down, flatten your back against the floor and release. Good for lower back pain." },
      ]},
      { day: 13, title: "Full Body Integration", exercises: [
        { name: "Warm-Up Walk", duration: "5 mins", rest: "N/A", instruction: "Walk slowly to warm up your body." },
        { name: "Squat to Press", sets: 3, reps: "10 reps", rest: "60s", instruction: "Combine a squat and shoulder press. Go down for the squat, press up for the press." },
        { name: "Lateral Band Walk", sets: 2, reps: "10 steps each way", rest: "45s", instruction: "Use a resistance band around your knees. Step sideways repeatedly.", modification: "Do it without a band first" },
        { name: "Cool-Down Stretch", duration: "10 mins", rest: "N/A", instruction: "Stretch all major muscle groups. Focus on the ones you worked today." },
      ]},
      { day: 14, title: "Rest & Recovery", exercises: [
        { name: "Rest Day", duration: "All day", rest: "N/A", instruction: "Rest your body. If something hurts — just do light stretching and rest." },
      ]},
    ]
  },
  {
    phase: 3, name: "Endurance & Maintenance", weeks: "Week 5–8 (and beyond)", color: "#2D4A8F", bg: "#F0F4FF",
    days: [
      { day: 15, title: "Progressive Cardio", exercises: [
        { name: "Power Walking", duration: "25–30 mins", rest: "N/A", instruction: "Faster and longer than before. Maintain a conversational pace." },
        { name: "Stair Climbing (if available)", sets: 2, reps: "2 flights", rest: "2 mins", instruction: "Use stairs for a natural lower body workout.", modification: "Always hold the handrail" },
      ]},
      { day: 16, title: "Strength Maintenance", exercises: [
        { name: "All Phase 2 exercises", duration: "30–40 mins", rest: "As needed", instruction: "Repeat your favorite exercises from Phase 2. Increase reps or sets if you can.", modification: "Maintain current level if there's pain" },
      ]},
      { day: 17, title: "Flexibility & Yoga-Inspired", exercises: [
        { name: "Sun Salutation (Modified)", sets: 3, reps: "5 rounds", rest: "60s", instruction: "Modified sun salutation — standing only, no floor work if you can't.", modification: "Do everything while standing" },
        { name: "Yin-Style Hold Stretches", sets: 1, duration: "3–5 mins each", rest: "30s", instruction: "Hold stretches longer — 2–5 minutes each for deep tissue release." },
      ]},
    ]
  }
];

export default function ExercisePage() {
  const { checking, session } = useSessionGuard();
  const ready = !checking;
  const daysStorageKey = progressStorageKey("eb_completed_days", session?.code);
  const exercisesStorageKey = progressStorageKey("eb_completed_exercises", session?.code);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load: localStorage first, then merge with Supabase ──────
  useEffect(() => {
    if (!ready || !session) return;

    async function loadProgress() {
      setCompletedDays(getStoredCompletedDays(daysStorageKey));
      setCompletedExercises(getStoredCompletedExercises(exercisesStorageKey));

      fetch('/api/progress?type=exercise')
        .then(r => r.json())
        .then(res => {
          if (!res?.data) return;
          const { days, exercises } = res.data;
          if (Array.isArray(days)) {
            const merged = new Set<number>(days);
            setCompletedDays(prev => {
              prev.forEach(d => merged.add(d));
              writeProgressCache(daysStorageKey, [...merged]);
              return merged;
            });
          }
          if (Array.isArray(exercises)) {
            const mergedEx = new Set<string>(exercises);
            setCompletedExercises(prev => {
              prev.forEach(e => mergedEx.add(e));
              writeProgressCache(exercisesStorageKey, [...mergedEx]);
              return mergedEx;
            });
          }
        })
        .catch(() => {});
    }

    loadProgress();
  }, [daysStorageKey, exercisesStorageKey, ready, session]);

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
    writeProgressCache(daysStorageKey, [...next]);
    triggerSync(next, completedExercises);
  };

  const toggleExercise = (key: string) => {
    const next = new Set(completedExercises);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCompletedExercises(next);
    writeProgressCache(exercisesStorageKey, [...next]);
    triggerSync(completedDays, next);
  };

  const currentPhase = EXERCISE_PROGRAM.find(p => p.phase === selectedPhase)!;
  const totalDays = EXERCISE_PROGRAM.flatMap(p => p.days).length;
  const progressPct = Math.round((completedDays.size / totalDays) * 100);

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#E8F5E0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Dumbbell size={28} color={G} /></div>
        <p style={{ fontSize: 22, color: G, fontWeight: 700 }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── HEADER ── */}
      <div style={{ background: G, color: "#fff" }}>
        {/* Hero image */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <Image src="/images/exercise-home.jpg" alt="Home Exercise" fill style={{ objectFit: "cover", objectPosition: "top" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(24,59,40,0.15) 0%, rgba(24,59,40,0.78) 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 20 }}>
            <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>
              HOME EXERCISE
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#fff", lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>30-Day Program<br />Para sa Seniors</h1>
          </div>
        </div>
        <div style={{ padding: "18px 24px 28px", position: "relative" }}>
          <div style={{ position: "absolute", top: -20, right: 20, width: 120, height: 120, background: "rgba(254,210,85,0.08)", borderRadius: "50%" }} />
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
            <ChevronLeft size={20} /> Bumalik sa Hub
          </Link>
          <p style={{ fontSize: 17, opacity: 0.9, margin: "0 0 20px 0", lineHeight: 1.6 }}>Ligtas at magaan na exercises para sa seniors.<br />Walang gym equipment na kailangan!</p>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, height: 14, overflow: "hidden" }}>
            <div style={{ background: GOLD, height: "100%", width: `${progressPct}%`, transition: "width 0.4s ease", borderRadius: 12 }} />
          </div>
          <p style={{ fontSize: 16, opacity: 0.85, margin: "10px 0 0 0", fontWeight: 600 }}>
            {completedDays.size} / {totalDays} days completed ({progressPct}%)
          </p>
        </div>
      </div>

      {/* ── EASEBREW REMINDER STRIP ── */}
      <div style={{ background: GOLD, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Coffee size={22} color={GOLD} /></div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: 0 }}>Inumin ang Easebrew bago mag-exercise!</p>
          <p style={{ fontSize: 16, color: AMBER, margin: 0 }}>30 minuto bago simulan — bahagi ng daily routine mo</p>
        </div>
      </div>

      {/* ── PHASE SELECTOR ── */}
      <div style={{ padding: "28px 24px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: G, marginBottom: 16 }}>Pumili ng Phase</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EXERCISE_PROGRAM.map((ph) => {
            const c = PHASE_COLORS[ph.phase as keyof typeof PHASE_COLORS];
            const isActive = selectedPhase === ph.phase;
            const PhIcon = PHASE_ICON[ph.phase as keyof typeof PHASE_ICON];
            const doneInPhase = ph.days.filter(d => completedDays.has(d.day)).length;
            return (
              <button key={ph.phase} onClick={() => { setSelectedPhase(ph.phase); setExpandedDay(null); }} style={{
                background: isActive ? c.bg : "#FFFFFB", border: `3px solid ${isActive ? c.border : "#C5B99A"}`,
                borderRadius: 18, padding: "20px 22px", textAlign: "left", cursor: "pointer", minHeight: 56,
                display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PhIcon size={24} color={c.color} /></div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: c.color, margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: 1 }}>Phase {ph.phase}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: "0 0 4px 0" }}>{ph.name}</p>
                    <p style={{ fontSize: 16, color: MID, margin: 0 }}>{ph.weeks} · {doneInPhase}/{ph.days.length} araw</p>
                  </div>
                </div>
                {isActive ? <ChevronDown size={22} color={c.color} /> : <ChevronDown size={22} color={c.color} style={{ transform: "rotate(-90deg)" }} />}
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
                      {isDone ? <CircleCheck size={22} color="#fff" /> : isRestDay ? <MoonIcon size={18} color={MID} /> : day.day}
                    </div>
                    <div>
                      <p style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: "0 0 4px 0", lineHeight: 1.3 }}>{day.title}</p>
                      <p style={{ fontSize: 16, color: MID, margin: 0 }}>
                        {day.exercises.length} {day.exercises.length === 1 ? "activity" : "exercises"}
                        {isDone && <span style={{ color: c.color, fontWeight: 700, marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4 }}><CircleCheck size={14} /> Tapos!</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: isOpen ? G : "#F0EAE0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: isOpen ? "#fff" : G, flexShrink: 0 }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
                              {exDone && <CircleCheck size={20} color="#fff" />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 19, fontWeight: 700, color: exDone ? G : DARK, margin: "0 0 6px 0", textDecoration: exDone ? "line-through" : "none" }}>{ex.name}</p>
                              <div style={{ display: "inline-block", background: exDone ? "#D6EDCC" : "#E8F5E0", borderRadius: 8, padding: "4px 12px", marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: G, fontWeight: 700, margin: 0 }}>
                                  {ex.sets && ex.reps && `${ex.sets} sets × ${ex.reps}`}
                                  {ex.duration && ex.duration}
                                  {" · "}Rest: {ex.rest}
                                </p>
                              </div>
                              <p style={{ fontSize: 17, color: DARK, margin: "0 0 8px 0", lineHeight: 1.6 }}>{ex.instruction}</p>
                              {ex.modification && (
                                <div style={{ background: "#FEF9E7", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "10px 14px", marginTop: 6 }}>
                                  <p style={{ fontSize: 16, color: AMBER, margin: 0, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}><Lightbulb size={16} style={{ flexShrink: 0, marginTop: 3 }} /> Modification: {ex.modification}</p>
                                </div>
                              )}
                              {!exDone && <p style={{ fontSize: 16, color: MID, margin: "10px 0 0 0", opacity: 0.75 }}>I-tap para markahan na tapos</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ padding: "20px 22px", background: "#FAFAF7" }}>
                      <button onClick={() => toggleDayComplete(day.day)} style={{ width: "100%", background: isDone ? "#F5F0E8" : G, color: isDone ? MID : "#fff", border: isDone ? `2px solid #C5B99A` : "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, lineHeight: 1.3, minHeight: 56 }}>
                        {isDone ? "Tapos na — I-undo" : "Tapos na ngayon!"}
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
          <h3 style={{ fontSize: 21, fontWeight: 700, color: G, margin: "0 0 18px 0", display: "flex", alignItems: "center", gap: 8 }}><Lightbulb size={22} /> Tips para sa Best Results</h3>
          {[
            { Icon: Coffee, text: "Inumin ang Easebrew 30 mins bago mag-exercise para sa mas magaan na pakiramdam." },
            { Icon: OctagonX, text: "Huwag pilitin — kung masakit, tumigil agad at magpahinga." },
            { Icon: Droplets, text: "Uminom ng tubig bago, habang, at pagkatapos ng exercise." },
            { Icon: CalendarDays, text: "Consistent lang — mas mabuti ang 15 mins araw-araw kaysa 1 oras minsan." },
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: i < 3 ? 16 : 0, padding: "14px 16px", background: "#F6F2EA", borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E8F5E0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><tip.Icon size={20} color={G} /></div>
              <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.6 }}>{tip.text}</p>
            </div>
          ))}
        </div>

        {/* Medical disclaimer */}
        <div style={{ marginTop: 14, padding: "12px 14px", background: "#f3f4f6", borderRadius: 10, border: "1px solid #d1d5db" }}>
          <p style={{ fontSize: 12, color: "#4E504F", margin: 0, lineHeight: 1.5 }}>
            <strong>Paalala:</strong> Bago simulan ang exercise program, magpakonsulta muna sa doctor kung may heart condition, joint injury, arthritis, o iba pang health issue. Tigilan agad ang exercise kung may sakit ng dibdib, hirap huminga, o pagkahilo.
          </p>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, background: "#fff", borderTop: `2px solid ${CREAM}`, padding: "12px 20px 16px", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: G, color: "#fff", borderRadius: 16, padding: "18px 22px", fontSize: 18, fontWeight: 700, textDecoration: "none", minHeight: 56 }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}
