"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

const PAIN_LOCATIONS = [
  "Tuhod", "Likod", "Balikat", "Kamay", "Paa",
  "Leeg", "Balakang", "Braso", "Dibdib", "Ulo"
];

const MOOD_LABELS = ["", "😢 Malungkot", "😕 Not Okay", "😐 Okay Lang", "🙂 Masaya", "😄 Very Happy"];
const RELIEF_LABELS = ["", "😣 No Relief", "😕 Konti Lang", "😐 May Tulong", "🙂 Malaking Tulong", "😄 Sobrang Gaan"];

type DayEntry = {
  date: string;
  painScore: number;
  painLocation: string;
  easebrew: boolean;
  avocadoOil: boolean;
  tubig: number;
  exercise: number;
  tulog: number;
  mood: number;
  reliefFeel: number;
  gamot: string;
  notes: string;
};

const emptyEntry = (): DayEntry => ({
  date: new Date().toISOString().split("T")[0],
  painScore: 0,
  painLocation: "",
  easebrew: false,
  avocadoOil: false,
  tubig: 0,
  exercise: 0,
  tulog: 0,
  mood: 0,
  reliefFeel: 0,
  gamot: "",
  notes: "",
});

function getPainColor(score: number) {
  if (score <= 2) return "#22c55e";
  if (score <= 4) return "#eab308";
  if (score <= 6) return "#f97316";
  return "#ef4444";
}

function getPainLabel(score: number) {
  if (score === 0) return "Hindi pa nire-rate";
  if (score <= 2) return "🟢 Halos Wala";
  if (score <= 4) return "🟡 Mild";
  if (score <= 6) return "🟠 Moderate";
  if (score <= 8) return "🔴 Matindi";
  return "🔴 Sobrang Sakit";
}

export default function TrackerPage() {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [view, setView] = useState<"today" | "history" | "summary" | "journal">("today");
  const [todayEntry, setTodayEntry] = useState<DayEntry>(emptyEntry());
  const [saved, setSaved] = useState(false);
  const [journalText, setJournalText] = useState<Record<number, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("easebrew-tracker");
    const savedJournal = localStorage.getItem("easebrew-journal");
    if (saved) {
      const data = JSON.parse(saved);
      setEntries(data.entries || []);
      setCurrentDay(data.entries?.length || 0);
      if (data.entries?.length > 0) {
        const last = data.entries[data.entries.length - 1];
        const today = new Date().toISOString().split("T")[0];
        if (last.date === today) {
          setTodayEntry(last);
        }
      }
    }
    if (savedJournal) {
      setJournalText(JSON.parse(savedJournal));
    }
  }, []);

  const saveEntry = () => {
    const today = new Date().toISOString().split("T")[0];
    const existing = entries.findIndex(e => e.date === today);
    let newEntries;
    if (existing >= 0) {
      newEntries = [...entries];
      newEntries[existing] = { ...todayEntry, date: today };
    } else {
      newEntries = [...entries, { ...todayEntry, date: today }];
    }
    setEntries(newEntries);
    setCurrentDay(newEntries.length);
    localStorage.setItem("easebrew-tracker", JSON.stringify({ entries: newEntries }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveJournal = (week: number, text: string) => {
    const newJournal = { ...journalText, [week]: text };
    setJournalText(newJournal);
    localStorage.setItem("easebrew-journal", JSON.stringify(newJournal));
  };

  const avgPain = entries.length > 0
    ? (entries.reduce((a, b) => a + b.painScore, 0) / entries.length).toFixed(1)
    : "—";

  const easebrewRate = entries.length > 0
    ? Math.round((entries.filter(e => e.easebrew).length / entries.length) * 100)
    : 0;

  const weeklyAvg = (week: number) => {
    const start = week * 7;
    const end = Math.min(start + 7, entries.length);
    const slice = entries.slice(start, end);
    if (slice.length === 0) return null;
    return (slice.reduce((a, b) => a + b.painScore, 0) / slice.length).toFixed(1);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ background: G, padding: "24px 24px 20px", color: "#fff" }}>
        <Link href="/" style={{ color: GOLD, fontSize: 14, textDecoration: "none", display: "block", marginBottom: 12 }}>
          ← Back to Hub
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>📊 Body Pain Tracker</h1>
            <p style={{ fontSize: 14, opacity: 0.8, margin: "4px 0 0 0" }}>30-Day Wellness Journal</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 16px" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: GOLD }}>Day {currentDay}</p>
            <p style={{ fontSize: 12, margin: 0, opacity: 0.8 }}>of 30</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.2)", borderRadius: 999, height: 8 }}>
          <div style={{
            width: `${Math.min((currentDay / 30) * 100, 100)}%`,
            background: GOLD, height: 8, borderRadius: 999,
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{ display: "flex", background: "#fff", borderBottom: `2px solid ${CREAM}` }}>
        {[
          { key: "today", label: "📝 Today" },
          { key: "history", label: "📅 History" },
          { key: "summary", label: "📊 Summary" },
          { key: "journal", label: "✍️ Journal" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key as "today" | "history" | "summary" | "journal")}
            style={{
              flex: 1, padding: "14px 4px", border: "none",
              background: "transparent", fontSize: 13,
              fontWeight: view === tab.key ? 700 : 400,
              color: view === tab.key ? G : MID,
              borderBottom: view === tab.key ? `3px solid ${G}` : "3px solid transparent",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TODAY VIEW */}
      {view === "today" && (
        <div style={{ padding: "24px 20px" }}>
          <p style={{ fontSize: 15, color: MID, marginBottom: 20 }}>
            {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* Pain Score */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 6px 0" }}>😣 Pain Score ngayon</h3>
            <p style={{ fontSize: 13, color: MID, margin: "0 0 16px 0" }}>1 = Halos wala, 10 = Sobrang sakit</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setTodayEntry(e => ({ ...e, painScore: n }))}
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    border: todayEntry.painScore === n ? `3px solid ${getPainColor(n)}` : "2px solid #e0e0e0",
                    background: todayEntry.painScore === n ? getPainColor(n) : "#fff",
                    color: todayEntry.painScore === n ? "#fff" : DARK,
                    fontSize: 16, fontWeight: 700, cursor: "pointer",
                  }}
                >{n}</button>
              ))}
            </div>
            {todayEntry.painScore > 0 && (
              <p style={{ fontSize: 15, color: getPainColor(todayEntry.painScore), fontWeight: 600, margin: 0 }}>
                {getPainLabel(todayEntry.painScore)}
              </p>
            )}
          </div>

          {/* Pain Location */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 12px 0" }}>📍 Pain Location</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PAIN_LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setTodayEntry(e => ({ ...e, painLocation: loc }))}
                  style={{
                    padding: "8px 14px", borderRadius: 20,
                    border: todayEntry.painLocation === loc ? `2px solid ${G}` : "2px solid #e0e0e0",
                    background: todayEntry.painLocation === loc ? G : "#fff",
                    color: todayEntry.painLocation === loc ? "#fff" : DARK,
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                  }}
                >{loc}</button>
              ))}
            </div>
          </div>

          {/* Wellness Checklist */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 16px 0" }}>☕ Wellness Checklist</h3>
            {[
              { key: "easebrew", label: "☕ Na-inom ang Easebrew ngayon", val: todayEntry.easebrew },
              { key: "avocadoOil", label: "🌿 Na-massage ang Avocado Oil", val: todayEntry.avocadoOil },
            ].map(item => (
              <div
                key={item.key}
                onClick={() => setTodayEntry(e => ({ ...e, [item.key]: !item.val }))}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", borderRadius: 12, marginBottom: 10,
                  background: item.val ? "#E8F5E0" : "#f5f5f5",
                  border: item.val ? `2px solid ${G}` : "2px solid #e0e0e0",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontSize: 16, margin: 0, fontWeight: 500, color: DARK }}>{item.label}</p>
                <span style={{ fontSize: 24 }}>{item.val ? "✅" : "⬜"}</span>
              </div>
            ))}
          </div>

          {/* Numbers */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 16px 0" }}>📊 Numbers ngayon</h3>
            {[
              { key: "tubig", label: "💧 Tubig (glasses)", max: 12, unit: "glasses" },
              { key: "exercise", label: "🏃 Exercise (minutes)", max: 120, unit: "mins" },
              { key: "tulog", label: "😴 Tulog (hours)", max: 12, unit: "hrs" },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 15, margin: 0, color: DARK }}>{item.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: G }}>
                    {todayEntry[item.key as keyof DayEntry] as number} {item.unit}
                  </p>
                </div>
                <input
                  type="range" min={0} max={item.max}
                  value={todayEntry[item.key as keyof DayEntry] as number}
                  onChange={e => setTodayEntry(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                  style={{ width: "100%", accentColor: G }}
                />
              </div>
            ))}
          </div>

          {/* Mood + Relief */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 16px 0" }}>😊 Mood at Relief</h3>
            {[
              { key: "mood", label: "😊 Mood ngayon", labels: MOOD_LABELS },
              { key: "reliefFeel", label: "💊 Naramdaman ang relief?", labels: RELIEF_LABELS },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 15, margin: "0 0 8px 0", color: DARK, fontWeight: 500 }}>{item.label}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setTodayEntry(e => ({ ...e, [item.key]: n }))}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 10,
                        border: (todayEntry[item.key as keyof DayEntry] as number) === n
                          ? `2.5px solid ${G}` : "2px solid #e0e0e0",
                        background: (todayEntry[item.key as keyof DayEntry] as number) === n
                          ? "#E8F5E0" : "#fff",
                        fontSize: 18, cursor: "pointer",
                      }}
                    >{n}</button>
                  ))}
                </div>
                {(todayEntry[item.key as keyof DayEntry] as number) > 0 && (
                  <p style={{ fontSize: 13, color: G, margin: "6px 0 0 0" }}>
                    {item.labels[todayEntry[item.key as keyof DayEntry] as number]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Gamot + Notes */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 16px 0" }}>💊 Medicine at Notes</h3>
            <p style={{ fontSize: 14, color: MID, margin: "0 0 6px 0" }}>Medicine na nainom (optional)</p>
            <input
              type="text"
              placeholder="e.g. Biogesic, Alaxan..."
              value={todayEntry.gamot}
              onChange={e => setTodayEntry(prev => ({ ...prev, gamot: e.target.value }))}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: "2px solid #e0e0e0", fontSize: 16,
                background: "#FFFFFB", marginBottom: 14,
                boxSizing: "border-box" as const,
              }}
            />
            <p style={{ fontSize: 14, color: MID, margin: "0 0 6px 0" }}>Notes / Observations</p>
            <textarea
              placeholder="Ano ang nararamdaman mo ngayon? May napansin kang pagbabago?"
              value={todayEntry.notes}
              onChange={e => setTodayEntry(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: "2px solid #e0e0e0", fontSize: 16,
                background: "#FFFFFB", resize: "none",
                boxSizing: "border-box" as const,
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveEntry}
            style={{
              width: "100%", padding: "18px",
              background: saved ? "#22c55e" : G,
              color: "#fff", border: "none",
              borderRadius: 14, fontSize: 19,
              fontWeight: 700, cursor: "pointer",
              transition: "background 0.3s",
            }}
          >
            {saved ? "✅ Saved na!" : "💾 I-save ang Entry ngayon"}
          </button>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === "history" && (
        <div style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: G, marginBottom: 16 }}>📅 Pain History</h2>
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: MID }}>
              <p style={{ fontSize: 48 }}>📋</p>
              <p style={{ fontSize: 17 }}>Wala pang entries. I-log ang first day mo!</p>
            </div>
          ) : (
            [...entries].reverse().map((entry, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, padding: 16,
                marginBottom: 12, borderLeft: `4px solid ${getPainColor(entry.painScore)}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>
                    {new Date(entry.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <span style={{
                    background: getPainColor(entry.painScore),
                    color: "#fff", borderRadius: 8,
                    padding: "2px 10px", fontSize: 14, fontWeight: 700
                  }}>
                    Pain: {entry.painScore}/10
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {entry.painLocation && <span style={{ fontSize: 13, color: MID }}>📍 {entry.painLocation}</span>}
                  <span style={{ fontSize: 13, color: entry.easebrew ? G : "#aaa" }}>
                    {entry.easebrew ? "☕✅" : "☕❌"} Easebrew
                  </span>
                  <span style={{ fontSize: 13, color: entry.avocadoOil ? G : "#aaa" }}>
                    {entry.avocadoOil ? "🌿✅" : "🌿❌"} Avocado Oil
                  </span>
                  <span style={{ fontSize: 13, color: MID }}>💧 {entry.tubig} glasses</span>
                  <span style={{ fontSize: 13, color: MID }}>😴 {entry.tulog} hrs</span>
                  <span style={{ fontSize: 13, color: MID }}>😊 Mood: {entry.mood}/5</span>
                </div>
                {entry.notes && (
                  <p style={{ fontSize: 14, color: MID, margin: "8px 0 0 0", fontStyle: "italic" }}>
                    "{entry.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SUMMARY VIEW */}
      {view === "summary" && (
        <div style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: G, marginBottom: 16 }}>📊 Your Progress</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Days Logged", value: `${entries.length}/30`, icon: "📅" },
              { label: "Average Pain", value: avgPain, icon: "😣" },
              { label: "Easebrew Rate", value: `${easebrewRate}%`, icon: "☕" },
              { label: "Days Remaining", value: `${Math.max(0, 30 - entries.length)}`, icon: "⏳" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px", textAlign: "center" as const }}>
                <p style={{ fontSize: 28, margin: "0 0 4px 0" }}>{stat.icon}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 4px 0" }}>{stat.value}</p>
                <p style={{ fontSize: 13, color: MID, margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: G, marginBottom: 12 }}>Weekly Progress</h3>
          {[0, 1, 2, 3].map(week => {
            const avg = weeklyAvg(week);
            return (
              <div key={week} style={{
                background: "#fff", borderRadius: 14, padding: 16,
                marginBottom: 10, display: "flex",
                justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>Week {week + 1}</p>
                  <p style={{ fontSize: 13, color: MID, margin: "2px 0 0 0" }}>
                    Day {week * 7 + 1}–{Math.min((week + 1) * 7, 30)}
                  </p>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  {avg ? (
                    <>
                      <p style={{ fontSize: 22, fontWeight: 700, color: getPainColor(Number(avg)), margin: 0 }}>{avg}</p>
                      <p style={{ fontSize: 12, color: MID, margin: 0 }}>avg pain</p>
                    </>
                  ) : (
                    <p style={{ fontSize: 14, color: "#ccc", margin: 0 }}>Not yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JOURNAL VIEW */}
      {view === "journal" && (
        <div style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: G, marginBottom: 8 }}>✍️ Wellness Journal</h2>
          <p style={{ fontSize: 15, color: MID, marginBottom: 20 }}>
            Isulat ang nararamdaman mo, ang laban mo, at ang tagumpay mo.
          </p>
          {[
            { week: 1, title: "🌱 Week 1 — Simula ng Journey (Day 1-7)", questions: ["Bakit ko sinimulang gamitin ang Easebrew?", "Ano ang pinaka-masakit na parte ng katawan ko?", "Ano ang gusto kong maramdaman pagkatapos ng 30 days?"] },
            { week: 2, title: "💪 Week 2 — Unang Pagbabago (Day 8-14)", questions: ["May napansin ba akong change sa nakaraang week?", "Paano ko nararamdaman ang Easebrew sa katawan ko?"] },
            { week: 3, title: "🌟 Week 3 — Progress Ko (Day 15-21)", questions: ["Kung ikukumpara ko ang sarili ko ngayon sa Week 1 — ano ang difference?", "Ano ang pinaka-epektibong part ng routine ko?"] },
            { week: 4, title: "🏆 Week 4 — Bagong Katawan (Day 22-30)", questions: ["Ano ang pinakamalaking pagbabago na naramdaman ko?", "Irerekomenda ko ba ang Easebrew sa pamilya at kaibigan ko? Bakit?"] },
          ].map(section => (
            <div key={section.week} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: G, margin: "0 0 10px 0" }}>{section.title}</h3>
              {section.questions.map((q, qi) => (
                <p key={qi} style={{ fontSize: 14, color: AMBER, margin: "0 0 8px 0" }}>❓ {q}</p>
              ))}
              <textarea
                placeholder="Isulat ang nararamdaman mo dito..."
                value={journalText[section.week] || ""}
                onChange={e => saveJournal(section.week, e.target.value)}
                rows={4}
                style={{
                  width: "100%", padding: "12px 14px",
                  borderRadius: 10, border: `2px solid ${CREAM}`,
                  fontSize: 16, background: "#FFFFFB",
                  resize: "none", marginTop: 8,
                  boxSizing: "border-box" as const, color: DARK,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, background: "#fff",
        borderTop: `2px solid ${CREAM}`, padding: "12px 24px",
        display: "flex", justifyContent: "center",
      }}>
        <Link href="/" style={{
          background: G, color: "#fff", borderRadius: 12,
          padding: "12px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none",
        }}>
          🏠 Back to Hub
        </Link>
      </div>
    </div>
  );
}