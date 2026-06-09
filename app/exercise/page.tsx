"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

type TrackEntry = { easebrew: boolean; exercise: boolean; avocado: boolean; tubig: number; duration: string; pain: number; energy: number; notes: string; };

const INTENSITY_COLOR: Record<string, string> = {
  "🟢 Beginner": "#22c55e",
  "🟡 Easy-Medium": "#eab308",
  "🟠 Moderate": "#f97316",
  "🔴 Challenging": "#ef4444",
  "⚪ Rest": "#9ca3af",
};

const INTENSITY_BG: Record<string, string> = {
  "🟢 Beginner": "#E8F5E0",
  "🟡 Easy-Medium": "#FFFBF0",
  "🟠 Moderate": "#FEF0E0",
  "🔴 Challenging": "#FEF0F0",
  "⚪ Rest": "#F5F5F5",
};

const EXERCISES = [
  { day: 1, week: "Week 1", weekday: "Lunes", intensity: "🟢 Beginner", totalTime: "~30 mins", target: "Legs, Core, Upper Body", isRest: false, warmup: "March in place • Ankle circles (10x bawat paa) • Shoulder rolls (10x)", main: "Seated leg raises — 2 sets x 10 reps\nWall push-ups — 2 sets x 8 reps\nSeated torso twist — 2 sets x 8 reps each side", cooldown: "Neck rolls • Deep breathing • Calf stretch seated — 5 mins", note: "Simula! Huwag mag-force. Kung masakit — stop agad." },
  { day: 2, week: "Week 1", weekday: "Martes", intensity: "🟢 Beginner", totalTime: "~30 mins", target: "Knees, Thighs, Balance", isRest: false, warmup: "Arm circles (10x forward/back) • Knee lifts (10x each leg) • Hip circles (8x)", main: "Chair squats (bangon-upo lang) — 2 sets x 10 reps\nSeated knee extensions — 2 sets x 12 reps\nStanding wall hold (balance) — 2 sets x 20 secs", cooldown: "Hamstring stretch (seated) • Quad stretch (may support) • Deep breathing — 5 mins", note: "REST DAY bukas. Ang katawan mo ay nag-a-adjust pa." },
  { day: 3, week: "Week 1", weekday: "Miyerkules", intensity: "⚪ Rest", totalTime: "~20 mins", target: "Full Body Recovery", isRest: true, warmup: "", main: "🌿 REST DAY — Active Recovery\n\nLight walking sa loob ng bahay (10–15 mins)\nGentle stretching lang (5 mins)", cooldown: "Full body gentle stretch • Ankle circles • Shoulder rolls — 10 mins", note: "I-massage ang Avocado Miracle Oil sa joints ngayong gabi. Mahalaga ang recovery!" },
  { day: 4, week: "Week 1", weekday: "Huwebes", intensity: "🟢 Beginner", totalTime: "~30 mins", target: "Calves, Core, Shoulders", isRest: false, warmup: "March in place (3 mins) • Wrist circles (10x) • Shoulder blade squeeze (10x)", main: "Standing calf raises (may support) — 2 sets x 15 reps\nSeated bicycle (slow) — 2 sets x 10 reps each leg\nArm raises with water bottle — 2 sets x 10 reps", cooldown: "Calf stretch standing • Arm cross-body stretch • Deep breathing — 5 mins", note: "Gumamit ng water bottle (puno) bilang light weight — libre at epektibo!" },
  { day: 5, week: "Week 1", weekday: "Biyernes", intensity: "🟢 Beginner", totalTime: "~30 mins", target: "Hips, Thighs, Glutes", isRest: false, warmup: "Ankle circles (10x each) • Neck stretches (5x each side) • Warm-up walk 3 mins", main: "Wall sit (15 secs hold) — 2 sets\nSeated leg press (vs dingding) — 2 sets x 10 reps\nStanding hip abduction (may support) — 2 sets x 10 reps each leg", cooldown: "Hip flexor stretch • Inner thigh seated stretch • Child's pose (modified) — 5 mins", note: "Malapit na ang weekend! Consistent ka na ngayong Week 1." },
  { day: 6, week: "Week 1", weekday: "Sabado", intensity: "🟡 Easy-Medium", totalTime: "~35 mins", target: "Full Body (Light)", isRest: false, warmup: "Light stretching • Arm swings • March in place — 2 mins each", main: "🔄 FULL BODY LIGHT CIRCUIT (1 round lang)\n\nChair squats x 10\nWall push-ups x 8\nSeated leg raises x 10\nCalf raises x 15", cooldown: "Full body stretch • Deep breathing (5 counts in, 5 out) • Meditation: 2 mins — 10 mins total", note: "First week complete! Inumin mo ang Easebrew mo nang may pride!" },
  { day: 7, week: "Week 1", weekday: "Linggo", intensity: "⚪ Rest", totalTime: "0 mins", target: "Full Body Rest", isRest: true, warmup: "", main: "💤 FULL REST DAY\n\nWalang exercise ngayon.\nMaitulog nang maaga.\nAng katawan mo ay nagtatayo ng muscle ngayong araw na ito.", cooldown: "", note: "Walang exercise ngayon. Matulog nang maaga." },
  { day: 8, week: "Week 2", weekday: "Lunes", intensity: "🟡 Easy-Medium", totalTime: "~35 mins", target: "Full Body", isRest: false, warmup: "March (3 mins) • Hip circles (10x) • Shoulder rolls (10x) • Wrist/ankle warm-up (10x each)", main: "Chair squats (deeper) — 3 sets x 10 reps\nWall push-ups (wider grip) — 3 sets x 10 reps\nSeated row (may tali o band) — 3 sets x 12 reps\nStanding march — 2 mins", cooldown: "Quad stretch • Hamstring stretch • Shoulder stretch • Deep breathing — 6 mins", note: "Week 2 na! Dagdag tayo ng 1 set sa bawat exercise. Slow and controlled pa rin." },
  { day: 9, week: "Week 2", weekday: "Martes", intensity: "🟡 Easy-Medium", totalTime: "~35 mins", target: "Core, Arms, Hips", isRest: false, warmup: "Arm circles (bigger) • Knee lifts (higher) • Lateral leg swings (8x each)", main: "Step touches (side to side) — 3 sets x 20 secs\nSeated punches (boxing) — 3 sets x 15 reps\nStanding hip hinge (deadlift motion, walang weight) — 3 sets x 10 reps\nLeg extension seated — 3 sets x 12 reps", cooldown: "Hip flexor stretch • Calf stretch • Chest opener stretch — 6 mins", note: "Seated punches ay maganda para sa shoulder mobility — mahalaga sa may rayuma sa kamay." },
  { day: 10, week: "Week 2", weekday: "Miyerkules", intensity: "⚪ Rest", totalTime: "~25 mins", target: "Active Recovery", isRest: true, warmup: "", main: "🌿 REST DAY — Active Recovery\n\n15-min walk sa labas o loob ng bahay\nGentle yoga: cat-cow x10, child's pose x2, seated twist x5 each", cooldown: "Full body release — 10 mins", note: "Kung maari — maglakad sa labas. Ang fresh air ay natural na mood booster at joint lubricant." },
  { day: 11, week: "Week 2", weekday: "Huwebes", intensity: "🟡 Easy-Medium", totalTime: "~35 mins", target: "Glutes, Lower Back, Hips", isRest: false, warmup: "March (3 mins) • Ankle pumps (15x) • Shoulder blade squeeze (10x) • Neck rolls (5x each)", main: "Glute bridges (lying sa sahig) — 3 sets x 12 reps\nClam shells (lying on side) — 3 sets x 12 reps each side\nSeated lat pulldown (may tali/band) — 3 sets x 10 reps\nBird dog (modified) — 3 sets x 8 reps each side", cooldown: "Glute stretch • Piriformis stretch • Lower back gentle twist — 6 mins", note: "Glute bridges ay NAPAKA-EPEKTIBO para sa lower back pain. Huwag palaging lulusot nito!" },
  { day: 12, week: "Week 2", weekday: "Biyernes", intensity: "🟡 Easy-Medium", totalTime: "~35 mins", target: "Balance, Legs, Calves", isRest: false, warmup: "Modified jumping jacks (step touch) • Arm swings • Hip opener stretch — 2 mins each", main: "Standing balance (1 leg, may support) — 3 sets x 20 secs each leg\nSide leg raises (standing) — 3 sets x 12 reps each\nSeated leg curl (may resistance) — 3 sets x 12 reps\nCalf raises (single leg, may support) — 2 sets x 12 reps each", cooldown: "Standing quad stretch • Ankle circles • Deep breathing — 6 mins", note: "Balance exercises ay nagpapatibay ng tuhod — pinakamahalagang exercise para sa may joint pain." },
  { day: 13, week: "Week 2", weekday: "Sabado", intensity: "🟡 Easy-Medium", totalTime: "~40 mins", target: "Full Body Circuit", isRest: false, warmup: "Full warm-up circuit (march + arm circles + hip circles) — 5 mins total", main: "🔄 WEEK 2 CIRCUIT (2 rounds, 30 secs rest between exercises)\n\nChair squat x 12\nWall push-up x 10\nGlute bridge x 12\nSeated row x 12\nCalf raise x 15\nSeated leg raise x 12", cooldown: "Full body stretch • 5 mins deep breathing • Congratulate yourself! — 10 mins total", note: "2 weeks na! Pansinin mo kung gaan na ang katawan mo. Ipost mo ang progress mo!" },
  { day: 14, week: "Week 2", weekday: "Linggo", intensity: "⚪ Rest", totalTime: "0 mins", target: "Full Body Rest", isRest: true, warmup: "", main: "💤 FULL REST DAY\n\nDeserved rest!\nMag-avocado oil massage habang nagpapahinga.", cooldown: "", note: "Deserved rest! Mag-avocado oil massage habang nagpapahinga." },
  { day: 15, week: "Week 3", weekday: "Lunes", intensity: "🟠 Moderate", totalTime: "~40 mins", target: "Lower Body, Core, Chest", isRest: false, warmup: "Dynamic warm-up: Leg swings, arm circles, hip rotations, march — 7 mins total", main: "Sumo chair squat (wider stance) — 3 sets x 12 reps\nIncline push-up (mas mataas ang hands) — 3 sets x 12 reps\nDead bug (core — lying down) — 3 sets x 8 reps each side\nStanding hip flexor march — 3 sets x 15 reps", cooldown: "Figure-4 hip stretch • Thoracic rotation • Deep breathing — 6 mins", note: "Week 3 — papalakasin na natin ang core! Malakas na core = less back pain." },
  { day: 16, week: "Week 3", weekday: "Martes", intensity: "🟠 Moderate", totalTime: "~40 mins", target: "Arms, Shoulders, Upper Back", isRest: false, warmup: "Arm swings • Torso rotations • Knee circles • March in place — 7 mins total", main: "Seated dumbbell curl (water bottle) — 3 sets x 12 reps\nTricep dips (upuan) — 3 sets x 10 reps\nShoulder press (water bottles) — 3 sets x 10 reps\nBent over row (may tali) — 3 sets x 12 reps", cooldown: "Bicep stretch • Tricep stretch • Chest stretch • Shoulder cross-body — 6 mins", note: "Upper body day! Para sa mga laging nagbubuhat o nagtatrabaho sa bahay." },
  { day: 17, week: "Week 3", weekday: "Miyerkules", intensity: "⚪ Rest", totalTime: "~35 mins", target: "Active Recovery", isRest: true, warmup: "", main: "🌿 REST DAY — Active Recovery\n\n20-min brisk walk\nGentle yoga flow: cat-cow x10, child's pose x2, seated twist x5 each", cooldown: "Full body cooldown — 5 mins", note: "Tumawid na tayo sa kalahati! 17 days done. Pansinin ang pagbabago sa katawan mo." },
  { day: 18, week: "Week 3", weekday: "Huwebes", intensity: "🟠 Moderate", totalTime: "~40 mins", target: "Glutes, Core, Legs", isRest: false, warmup: "High knees (mabagal) • Arm circles • Ankle hops (maliit) • Hip circles — 7 mins total", main: "Step-up (gamit ang mababang step o libro) — 3 sets x 10 reps each leg\nReverse lunge (may support) — 3 sets x 10 reps each leg\nGlute bridge march (alternating legs) — 3 sets x 10 reps\nPlank (on knees — hold) — 3 sets x 20 secs", cooldown: "Hip flexor stretch • Lunging hip flexor • Downward dog (modified) — 6 mins", note: "Step-up ay maganda para sa tuhod — pinapatibay ang quadriceps na nagpoprotekta sa knee joint." },
  { day: 19, week: "Week 3", weekday: "Biyernes", intensity: "🟠 Moderate", totalTime: "~40 mins", target: "Core, Lower Back, Hips", isRest: false, warmup: "Marching arms • Lateral shuffles (mabagal) • Hip hinge warm-up • Wrist rotations — 7 mins total", main: "Romanian deadlift (walang weight — hinge lang) — 3 sets x 12 reps\nSide plank (sa tuhod) — 3 sets x 15 secs each side\nSeated good morning (forward lean, straight back) — 3 sets x 10 reps\nPallof press (may band o tali) — 3 sets x 10 reps each side", cooldown: "Lower back stretch • Piriformis stretch • Full body roll-down stretch — 6 mins", note: "Core day! Kapag malakas ang core mo — automatic na bababa ang back pain mo." },
  { day: 20, week: "Week 3", weekday: "Sabado", intensity: "🟠 Moderate", totalTime: "~45 mins", target: "Full Body Challenge", isRest: false, warmup: "Full warm-up: March + swings + circles • Light jogging in place — 7 mins total", main: "🔄 WEEK 3 CHALLENGE CIRCUIT (2 rounds, 45 secs rest)\n\nSumo squat x 12\nIncline push-up x 10\nGlute bridge march x 10\nDead bug x 8 each\nStep-up x 10 each\nPlank on knees x 25 secs", cooldown: "Full body foam roll (o towel roll) • 10 mins stretching • Deep breathing — 10 mins total", note: "3 weeks done! Ang joints mo ay nagpapalakas na kahit hindi pa halata sa labas." },
  { day: 21, week: "Week 3", weekday: "Linggo", intensity: "⚪ Rest", totalTime: "0 mins", target: "Full Body Rest", isRest: true, warmup: "", main: "💤 FULL REST DAY\n\n3 weeks! I-check ang mga suot mong damit — baka medyo gaan na ang katawan mo.", cooldown: "", note: "3 weeks! I-check ang mga suot mong damit — baka medyo gaan na ang katawan mo." },
  { day: 22, week: "Week 4", weekday: "Lunes", intensity: "🔴 Challenging", totalTime: "~45 mins", target: "Full Body Strength", isRest: false, warmup: "Dynamic stretch circuit: Leg swings x10 each • Arm circles x10 • Hip rotations x10 • Torso twists x10 — 7 mins total", main: "Bulgarian split squat (rear foot sa upuan) — 3 sets x 10 reps each leg\nPush-up (full, sa tuhod kung kailangan) — 3 sets x 10 reps\nRenegade row (may water bottles) — 3 sets x 8 reps each\nMountain climber (mabagal) — 3 sets x 10 reps each leg", cooldown: "Deep hip flexor stretch • Shoulder capsule stretch • Full spine stretch — 7 mins", note: "WEEK 4! Kung masakit ang joints — bumalik sa Week 3 exercises. Walang rush!" },
  { day: 23, week: "Week 4", weekday: "Martes", intensity: "🔴 Challenging", totalTime: "~45 mins", target: "Upper Body Strength", isRest: false, warmup: "Jump rope (imaginary, mabagal) • Arm warm-up circles • Leg swings • Ankle bounces — 7 mins total", main: "Dumbbell Romanian deadlift (water bottles) — 3 sets x 12 reps\nSeated overhead press — 3 sets x 12 reps\nBent over row (heavier resistance) — 3 sets x 12 reps\nBicep curls + Tricep kickback (superset) — 3 sets x 10 reps each", cooldown: "Full arm stretches • Spinal decompression (kung posible) • Shoulder cross-body — 7 mins", note: "Superset = mas mabilis ang workout at mas epektibo ang fat burning." },
  { day: 24, week: "Week 4", weekday: "Miyerkules", intensity: "⚪ Rest", totalTime: "~50 mins", target: "Active Recovery", isRest: true, warmup: "", main: "🌿 REST DAY — Active Recovery\n\n25-min brisk walk o swimming (kung malapit)\nFull yoga session: cat-cow, pigeon pose, seated forward fold, supine twist", cooldown: "Full body deep stretch — 10 mins", note: "Sa Week 4 na — ang active recovery ay mas mahalaga kaysa dati. Bigyan ng oras ang katawan." },
  { day: 25, week: "Week 4", weekday: "Huwebes", intensity: "🔴 Challenging", totalTime: "~45 mins", target: "Legs, Glutes, Balance", isRest: false, warmup: "High knees (moderate pace) • Lateral lunges (warm-up) • Glute activation — 7 mins total", main: "Lateral lunge to balance — 3 sets x 10 reps each\nSingle leg deadlift (may support muna) — 3 sets x 8 reps each\nCurtsy lunge — 3 sets x 10 reps each\nSeated hamstring curl (may resistance) — 3 sets x 15 reps\nAnkle weight calf raise — 3 sets x 15 reps", cooldown: "IT band stretch • Piriformis stretch • Standing quad stretch • Ankle circles — 7 mins", note: "Single leg exercises ay nagpapalakas ng joint stability — crucial para sa may knee issues." },
  { day: 26, week: "Week 4", weekday: "Biyernes", intensity: "🔴 Challenging", totalTime: "~40 mins", target: "Core Focus Day", isRest: false, warmup: "Core activation: Deep breathing x10 • Pelvic tilts x10 • Dead bug (warm-up) x5 each — 5 mins", main: "Plank (full, sa toes kung kaya) — 3 sets x 30 secs\nSide plank (full) — 3 sets x 20 secs each\nRussian twist (may water bottle) — 3 sets x 15 reps\nV-sit hold (modified, knees bent) — 3 sets x 20 secs\nLeg raises (lying down) — 3 sets x 10 reps", cooldown: "Child's pose • Supine spinal twist • Knee to chest stretch • Deep breathing — 7 mins", note: "CORE DAY! Pansinin mo sa susunod na linggo kung gaan na ang likod mo." },
  { day: 27, week: "Week 4", weekday: "Sabado", intensity: "🔴 Challenging", totalTime: "~50 mins", target: "Full Body Power", isRest: false, warmup: "Full warm-up: 7 mins dynamic stretch", main: "🔄 WEEK 4 POWER CIRCUIT (2 rounds, 1 min rest)\n\nBulgarian split squat x 10 each\nFull push-up x 10\nRenegade row x 8 each\nLateral lunge x 10 each\nPlank x 30 secs\nMountain climber x 10 each\nSeated overhead press x 12", cooldown: "Full body foam roll • 10 mins deep stretch • Warm Avocado Oil massage sa legs — 10-15 mins total", note: "4 weeks! Ikaw na ang boss ng sarili mong katawan. Proud ka dapat sa sarili mo!" },
  { day: 28, week: "Week 4", weekday: "Linggo", intensity: "⚪ Rest", totalTime: "0 mins", target: "Full Body Rest", isRest: true, warmup: "", main: "💤 FULL REST DAY\n\n4 weeks done. Malaki na ang nagawa ng katawan mo.\nHanda ka na sa final stretch!", cooldown: "", note: "4 weeks done. Malaki na ang nagawa ng katawan mo. Handa ka na sa final stretch!" },
  { day: 29, week: "Week 5", weekday: "Lunes", intensity: "🔴 Challenging", totalTime: "~55 mins", target: "Full Body — Best Of", isRest: false, warmup: "Full dynamic warm-up: All previous moves (march, circles, swings, lunges) — 7-8 mins total", main: "🏆 BEST OF 30 DAYS — FAVORITES (2 rounds, 45 secs rest)\n\nChair squat to jump (mabagal landing) x 10\nIncline to full push-up x 10\nGlute bridge march x 12\nBulgarian split squat x 10 each\nDead bug x 10 each\nPlank hold x 40 secs\nLateral lunge x 12 each", cooldown: "Full body stretch • 10 mins yoga flow • Gratitude meditation (2 mins) • Avocado Oil massage sa buong katawan — 15 mins total", note: "Penultimate day! Dalhin mo ang lahat ng natutunan mo sa 29 days na ito." },
  { day: 30, week: "Week 5", weekday: "Martes 🎉", intensity: "🔴 Challenging", totalTime: "~60 mins", target: "FULL BODY — 30 DAY COMPLETE 🏆", isRest: false, warmup: "Celebration warm-up: Favorite moves mo — 5 mins", main: "🎉 30-DAY FINAL WORKOUT (3 rounds — FINAL PUSH!, 1 min rest each)\n\nChair squat x 15\nFull push-up x 12\nGlute bridge x 15\nPlank x 45 secs\nSide plank x 30 secs each\nDead bug x 10 each\nMountain climber x 15 each\nSeated overhead press x 15\nBicep curl x 15\nCalf raise x 20", cooldown: "20 mins FULL BODY CELEBRATION STRETCH\n5 mins Easebrew celebration 🌿\nFull Avocado Oil massage — deserved! — 20 mins total", note: "🎉 30 DAYS COMPLETE! Ang katawan mo ngayon ay mas malakas, mas flexible, at mas malusog! CONTINUE THE JOURNEY!" },
];

const WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

const emptyTrack = (): TrackEntry => ({ easebrew: false, exercise: false, avocado: false, tubig: 0, duration: "", pain: 0, energy: 0, notes: "" });

export default function ExercisePage() {
  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [trackData, setTrackData] = useState<Record<number, TrackEntry>>({});
  const [trackingDay, setTrackingDay] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("easebrew-exercise");
    const savedTrack = localStorage.getItem("easebrew-exercise-track");
    if (saved) setCompletedDays(JSON.parse(saved));
    if (savedTrack) setTrackData(JSON.parse(savedTrack));
  }, []);

  const toggleComplete = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day];
    setCompletedDays(updated);
    localStorage.setItem("easebrew-exercise", JSON.stringify(updated));
  };

  const saveTrack = (day: number, data: TrackEntry) => {
    const updated = { ...trackData, [day]: data };
    setTrackData(updated);
    localStorage.setItem("easebrew-exercise-track", JSON.stringify(updated));
  };

  const filteredDays = EXERCISES.filter(d => d.week === selectedWeek);
  const progress = Math.round((completedDays.length / 30) * 100);
  const restDays = completedDays.filter(d => EXERCISES.find(e => e.day === d)?.isRest).length;
  const workoutDays = completedDays.length - restDays;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ background: G, padding: "24px 24px 20px", color: "#fff" }}>
        <Link href="/" style={{ color: GOLD, fontSize: 14, textDecoration: "none", display: "block", marginBottom: 12 }}>
          ← Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>💪 30-Day Exercise Guide</h1>
            <p style={{ fontSize: 14, opacity: 0.8, margin: "4px 0 0 0" }}>Low-Impact Home Workout Program</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 16px" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: GOLD }}>{workoutDays}</p>
            <p style={{ fontSize: 12, margin: 0, opacity: 0.8 }}>workouts</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>{completedDays.length} / 30 araw — {progress}%</p>
            <p style={{ fontSize: 13, margin: 0, color: GOLD, fontWeight: 700 }}>{30 - completedDays.length} na lang!</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, height: 8 }}>
            <div style={{ width: `${progress}%`, background: GOLD, height: 8, borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* DAILY REMINDER STRIP */}
      <div style={{ background: "#FFFFFB", borderBottom: `2px solid ${CREAM}`, padding: "12px 20px", display: "flex", gap: 20, overflowX: "auto" }}>
        {[
          { icon: "☕", text: "Easebrew 30 mins bago mag-exercise" },
          { icon: "🌿", text: "Avocado Oil pagkatapos" },
          { icon: "💧", text: "2 glasses bago at pagkatapos" },
          { icon: "⚠️", text: "Kung masakit — stop agad" },
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>{tip.icon}</span>
            <span style={{ fontSize: 13, color: G, fontWeight: 600, whiteSpace: "nowrap" }}>{tip.text}</span>
          </div>
        ))}
      </div>

      {/* WEEK SELECTOR */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ fontSize: 15, color: MID, fontWeight: 600, margin: "0 0 10px 0" }}>Piliin ang linggo:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {WEEKS.map(w => (
            <button key={w} onClick={() => { setSelectedWeek(w); setExpandedDay(null); }} style={{
              padding: "10px 16px", borderRadius: 12,
              border: selectedWeek === w ? `2.5px solid ${G}` : "2px solid #C5B99A",
              background: selectedWeek === w ? G : "#FFFFFB",
              color: selectedWeek === w ? "#fff" : MID,
              fontSize: 14, fontWeight: selectedWeek === w ? 700 : 500, cursor: "pointer",
            }}>{w}</button>
          ))}
        </div>
      </div>

      {/* DAY CARDS */}
      <div style={{ padding: "20px 20px 0" }}>
        {filteredDays.map((d) => {
          const isDone = completedDays.includes(d.day);
          const isExpanded = expandedDay === d.day;
          const iColor = INTENSITY_COLOR[d.intensity] || G;
          const iBg = INTENSITY_BG[d.intensity] || "#FFFFFB";
          const track = trackData[d.day] || emptyTrack();

          return (
            <div key={d.day} style={{ marginBottom: 14 }}>
              <div
                onClick={() => setExpandedDay(isExpanded ? null : d.day)}
                style={{
                  background: isDone ? "#E8F5E0" : "#FFFFFB",
                  border: `2px solid ${isDone ? G : "#C5B99A"}`,
                  borderRadius: 16, padding: "16px 18px", cursor: "pointer",
                }}
              >
                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: isDone ? G : d.isRest ? "#E0E0E0" : iBg,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      border: `2px solid ${isDone ? G : iColor}`,
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isDone ? "#fff" : iColor }}>
                        {isDone ? "✓" : d.isRest ? "💤" : d.day}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>
                        Araw {d.day} — {d.weekday}
                      </p>
                      <p style={{ fontSize: 13, color: MID, margin: "2px 0 0 0" }}>{d.totalTime} • {d.target}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: MID }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Intensity Badge */}
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: iBg, color: iColor, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, border: `1px solid ${iColor}` }}>
                    {d.intensity}
                  </span>
                  {isDone && <span style={{ background: "#E8F5E0", color: G, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>✅ Tapos na!</span>}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ marginTop: 16, borderTop: `1px solid ${CREAM}`, paddingTop: 16 }}>

                    {/* Sections */}
                    {!d.isRest && d.warmup && (
                      <div style={{ background: "#E8F5E0", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: G, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: 0.8 }}>🌅 Warm-Up (5–7 mins)</p>
                        <p style={{ fontSize: 15, color: DARK, margin: 0, lineHeight: 1.6 }}>{d.warmup}</p>
                      </div>
                    )}

                    <div style={{ background: d.isRest ? "#F5F5F5" : "#FFFFFB", border: `1.5px solid ${d.isRest ? "#ddd" : AMBER}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: AMBER, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: 0.8 }}>💪 {d.isRest ? "Rest Day Activity" : "Main Workout (15–20 mins)"}</p>
                      <p style={{ fontSize: 15, color: DARK, margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{d.main}</p>
                    </div>

                    {d.cooldown && (
                      <div style={{ background: "#E6F1FB", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#185FA5", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: 0.8 }}>🧘 Cool-Down (5 mins)</p>
                        <p style={{ fontSize: 15, color: DARK, margin: 0, lineHeight: 1.6 }}>{d.cooldown}</p>
                      </div>
                    )}

                    {/* Coach Tip */}
                    <div style={{ background: "#FFFBF0", border: `1.5px solid ${GOLD}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: AMBER, margin: "0 0 4px 0" }}>💡 Coach Tip</p>
                      <p style={{ fontSize: 14, color: DARK, margin: 0, lineHeight: 1.6 }}>{d.note}</p>
                    </div>

                    {/* Daily Tracker */}
                    <div style={{ background: CREAM, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>📊 I-track ang araw na ito</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        {[
                          { key: "easebrew", label: "☕ Easebrew nainumin?", val: track.easebrew },
                          { key: "exercise", label: "💪 Exercise natapos?", val: track.exercise },
                          { key: "avocado", label: "🌿 Avocado Oil na-massage?", val: track.avocado },
                        ].map(item => (
                          <div
                            key={item.key}
                            onClick={(e) => { e.stopPropagation(); saveTrack(d.day, { ...track, [item.key]: !item.val }); }}
                            style={{
                              background: item.val ? "#E8F5E0" : "#fff",
                              border: `1.5px solid ${item.val ? G : "#ddd"}`,
                              borderRadius: 10, padding: "10px 12px",
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <p style={{ fontSize: 13, margin: 0, color: DARK }}>{item.label}</p>
                            <span style={{ fontSize: 20 }}>{item.val ? "✅" : "⬜"}</span>
                          </div>
                        ))}
                        <div style={{ background: "#fff", border: "1.5px solid #ddd", borderRadius: 10, padding: "10px 12px" }}
                          onClick={e => e.stopPropagation()}>
                          <p style={{ fontSize: 13, margin: "0 0 4px 0", color: DARK }}>💧 Tubig (glasses)</p>
                          <input type="number" min={0} max={12} value={track.tubig}
                            onChange={e => saveTrack(d.day, { ...track, tubig: Number(e.target.value) })}
                            style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 16, textAlign: "center", background: "transparent" }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}
                        onClick={e => e.stopPropagation()}>
                        {[
                          { key: "pain", label: "😣 Pain Level (1-10)", val: track.pain },
                          { key: "energy", label: "⚡ Energy Level (1-10)", val: track.energy },
                        ].map(item => (
                          <div key={item.key} style={{ background: "#fff", border: "1.5px solid #ddd", borderRadius: 10, padding: "10px 12px" }}>
                            <p style={{ fontSize: 13, margin: "0 0 4px 0", color: DARK }}>{item.label}</p>
                            <input type="number" min={1} max={10} value={item.val || ""}
                              onChange={e => saveTrack(d.day, { ...track, [item.key]: Number(e.target.value) })}
                              style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 16, textAlign: "center", background: "transparent" }} />
                          </div>
                        ))}
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <textarea
                          placeholder="Notes / Observations (optional)..."
                          value={track.notes}
                          onChange={e => saveTrack(d.day, { ...track, notes: e.target.value })}
                          rows={2}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, background: "#fff", resize: "none", boxSizing: "border-box" as const, color: DARK }} />
                      </div>
                    </div>

                    {/* Done Button */}
                    <button onClick={(e) => toggleComplete(d.day, e)} style={{
                      width: "100%", padding: "14px",
                      background: isDone ? "#ef4444" : G,
                      color: "#fff", border: "none",
                      borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer",
                    }}>
                      {isDone ? "✗ I-undo ang Done" : (d.isRest ? "✅ Rest Day Complete!" : "✅ Workout Complete!")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SAFETY REMINDERS */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ background: "#FEF0F0", border: "2px solid #ef4444", borderRadius: 18, padding: "20px 24px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#ef4444", margin: "0 0 12px 0" }}>⚠️ Safety Reminders</h3>
          {[
            "STOP agad kapag: matulis na sakit sa joints, pamamanhid, pagkahilo, sobrang hirap huminga",
            "OKAY lang ang kaunting pagod ng muscles — HINDI OKAY ang matulis na pain sa joints",
            "Konsultahin ang doktor bago magsimula — lalo na kung may diagnosed na arthritis o heart condition",
            "Huwag mag-exercise nang empty stomach — kumain ng konti (saging o pandesal) 1 hr bago",
          ].map((tip, i) => (
            <p key={i} style={{ fontSize: 14, margin: "0 0 8px 0", color: DARK, lineHeight: 1.6 }}>• {tip}</p>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: "#fff",
        borderTop: `2px solid ${CREAM}`, padding: "12px 24px",
        display: "flex", justifyContent: "center",
      }}>
        <Link href="/" style={{ background: G, color: "#fff", borderRadius: 12, padding: "12px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
          🏠 Bumalik sa Hub
        </Link>
      </div>
    </div>
  );
}