"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { EXERCISE_PROGRAM, type Phase, type Day, type Exercise } from "@/lib/exerciseProgram";
import { exerciseSlug, parseExerciseVideos, youTubeEmbedUrl } from "@/lib/exerciseVideos";
import { ChevronLeft, ChevronUp, ChevronDown, Dumbbell, Sprout, Trophy, Coffee, Lightbulb, Droplets, OctagonX, CalendarDays, CircleCheck, Moon as MoonIcon, PlayCircle } from "lucide-react";

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

// Phase, Day, Exercise types imported from @/lib/exerciseProgram

const PHASE_COLORS = {
  1: { bg: "#E8F5E0", color: "#39613B", border: "#7DAE2F" },
  2: { bg: "#FEF9E7", color: "#C0863B", border: "#FED255" },
  3: { bg: "#F0F4FF", color: "#2D4A8F", border: "#6B8FD4" },
};

const PHASE_ICON = { 1: Sprout, 2: Dumbbell, 3: Trophy };


export default function ExercisePage() {
  const { checking, session } = useSessionGuard();
  const ready = !checking;
  const daysStorageKey = progressStorageKey("eb_completed_days", session?.code);
  const exercisesStorageKey = progressStorageKey("eb_completed_exercises", session?.code);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [autoNavigated, setAutoNavigated] = useState(false);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [videoMap, setVideoMap] = useState<Record<string, string>>({});
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(res => {
        const raw = res?.content?.exercise_videos;
        setVideoMap(parseExerciseVideos(typeof raw === 'string' ? raw : undefined));
      })
      .catch(() => {});
  }, []);

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

  // Auto-jump to the customer's next uncompleted day on first load only.
  useEffect(() => {
    if (autoNavigated || completedDays.size === 0) return;
    const allDays = EXERCISE_PROGRAM.flatMap(p => p.days.map(d => ({ day: d.day, phase: p.phase })));
    const next = allDays.find(d => !completedDays.has(d.day));
    if (next) {
      if (next.phase !== selectedPhase) setSelectedPhase(next.phase);
      setExpandedDay(next.day);
    }
    setAutoNavigated(true);
  }, [completedDays, autoNavigated, selectedPhase]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#E8F5E0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Dumbbell size={28} color={G} /></div>
        <p style={{ fontSize: 22, color: G, fontWeight: 700 }}>Sandali lang...</p>
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
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#fff", lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>30-Araw na Programa<br />Para sa Seniors</h1>
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
            {completedDays.size} / {totalDays} araw na tapos ({progressPct}%)
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

      {/* ── PRE-WORKOUT SAFETY CHECKLIST ── */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ background: "#f0fdf4", border: `2px solid ${G}`, borderRadius: 16, padding: "16px 18px" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <CircleCheck size={20} /> Bago Mag-simula (Safety Checklist)
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, color: DARK, fontSize: 15, lineHeight: 1.75 }}>
            <li>May matibay na upuan sa tabi mo bilang support</li>
            <li>May tubig kang malapit para uminom habang exercise</li>
            <li>Suot ang komportableng sapatos na may grip (hindi tsinelas)</li>
            <li>Kumain nang konti 1-2 oras bago mag-exercise</li>
            <li>Kung may hypertension o heart condition, sukatin ang BP mo muna</li>
          </ul>
        </div>

        {/* ── STOP SIGNS ── */}
        <div style={{ background: "#fef2f2", border: "2px solid #dc2626", borderRadius: 16, padding: "16px 18px", marginTop: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#991b1b", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <OctagonX size={20} /> Tigilan Agad Kung Nararamdaman:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#7f1d1d", fontSize: 15, lineHeight: 1.75, fontWeight: 500 }}>
            <li>Sakit ng dibdib o pananakit sa braso/leeg</li>
            <li>Sobrang hirap huminga o pagkahilo</li>
            <li>Malabo ang paningin o nawawala ang balanse</li>
            <li>Malakas na sakit sa joint na hindi natural</li>
          </ul>
          <p style={{ fontSize: 14, color: "#991b1b", margin: "10px 0 0", fontWeight: 700 }}>
            Kung anumang ito ay maramdaman mo — tumigil, umupo, at magpakonsulta sa doctor. Kung matindi, tumawag agad ng 911.
          </p>
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
                        {day.exercises.length} {day.exercises.length === 1 ? "gawain" : "ehersisyo"}
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
                              {(() => {
                                const rawUrl = videoMap[exerciseSlug(currentPhase.phase, day.day, ex.name)];
                                const embed = rawUrl ? youTubeEmbedUrl(rawUrl) : null;
                                if (!embed) return null;
                                return (
                                  <div onClick={e => e.stopPropagation()} style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9", position: "relative" }}>
                                    <iframe src={embed} title={`Video: ${ex.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
                                  </div>
                                );
                              })()}
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
