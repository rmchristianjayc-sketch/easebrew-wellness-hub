"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { G, GOLD, AMBER, CREAM, WHITE, DARK, MID, LIGHT_G } from "@/lib/colors";
import { DEFAULT_PRODUCTS, applyContentOverrides, splitByTier } from "@/lib/products";
import { PRICE_CONFIG } from "@/lib/price-config";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";

// ✅ 1.2 — Imported from single source of truth (no more duplicate definitions)
import { Coach, DEFAULT_COACHES, buildCoaches } from "@/lib/coaches";
import { Gift, Home as HomeIcon, Lightbulb, Phone, Users, HeartPulse, UtensilsCrossed, Dumbbell, Crown, Activity, Pill, IdCard } from "lucide-react";

// ============================================================
// ⚙️ CONFIG — FALLBACK DEFAULTS (used when no value in DB)
// ============================================================
const DEFAULT_VIDEOS = [
  { title: "How to Prepare EaseBrew",              desc: "The right way to maximize the herbal benefits of EaseBrew.", url: "" },
  { title: "Simple Exercises for Joint Pain",      desc: "Low-impact exercises that are safe for seniors and those with arthritis.",     url: "" },
];

const DEFAULT_WELLNESS_TIPS = [
  "Drink EaseBrew 30 mins before eating for the best effect.",
  "Drink 8 glasses of water daily — dehydration makes joint pain worse.",
  "Walk 15 mins after eating for better digestion.",
  "Eat fish (salmon or bangus) 3x a week for omega-3.",
  "Turmeric and ginger are natural anti-inflammatory — add them to your meals daily.",
  "Sleep 7-8 hours — this is when your joints and muscles repair.",
  "Malunggay is a superfood — add it to sinigang, tinola, or lugaw.",
];

const DEFAULT_RECIPES = [
  { name: "Sinigang na Salmon",            benefit: "Omega-3 Anti-Inflammation",    ingredients: "Salmon, kamatis, kangkong, labanos, sampalok", icon: "🐟" },
  { name: "Tinolang Manok with Malunggay", benefit: "Immune Boost + Joint Support", ingredients: "Manok, malunggay, sayote, luya, bawang",        icon: "🍗" },
  { name: "Ginger-Turmeric Lugaw",         benefit: "Powerful Anti-Inflammation",   ingredients: "Bigas, luya, turmeric, bawang, sibuyas",         icon: "🍚" },
];

const DEFAULT_FAQS = [
  { q: "When should I drink EaseBrew?",                   a: "Morning and evening — 2 sachets per day for best results. Drink 30 mins before meals for the best effect." },
  { q: "Is it safe for people with ulcer?",               a: "Yes, but drink it after eating a little. Don't drink on an empty stomach." },
  { q: "When will I feel the effect?",                    a: "Most customers feel a change within 7-14 days of consistent use. For deeper results — 30-90 days." },
  { q: "How many sachets per day?",                       a: "2 sachets per day — one in the morning, one in the evening. This is the recommended dosage for the best results." },
  { q: "How do I access my free digital products?",       a: "Tap the button on each product card. All products included in your order are automatically accessible!" },
  { q: "Does EaseBrew have side effects?",                a: "EaseBrew is made from natural herbs. No known side effects for most people. If you have allergies or maintenance medicine — consult your doctor first." },
];

const DEFAULT_TESTIMONIALS = [
  { name: "Nena R.",   age: 58, location: "Quezon City", quote: "After 3 weeks, my knee feels so much lighter. I don't need to take medicine every day anymore.", stars: 5, painBefore: 8, painAfter: 3 },
  { name: "Mang Tony", age: 64, location: "Cebu City",   quote: "I didn't believe it at first but I tried it. Now — I can't imagine my morning without EaseBrew.",    stars: 5, painBefore: 7, painAfter: 2 },
  { name: "Ate Susan", age: 52, location: "Davao",       quote: "The free meal plan and recipe book — super helpful! Now I know which foods make my arthritis worse.", stars: 5, painBefore: 6, painAfter: 3 },
];

const REMINDERS = [
  { time: "Morning",   icon: "☕", text: "Drink EaseBrew — 1st sachet of the day",   bg: "#E8F5E0", border: "#39613B", textColor: "#39613B" },
  { time: "Noon",      icon: "🚶", text: "Walk 15 mins after eating",               bg: "#FEF9E7", border: "#C0863B", textColor: "#C0863B" },
  { time: "Afternoon", icon: "💧", text: "Drink 8 glasses of water today",          bg: "#FFFBF0", border: "#FED255", textColor: "#8B6914" },
  { time: "Evening",   icon: "☕", text: "Drink EaseBrew — 2nd sachet of the day",  bg: "#F4F8F0", border: "#7DAE2F", textColor: "#39613B" },
];

const PROGRESS_GUIDE = [
  { period: "Week 1–2", title: "The Beginning",               desc: "You'll feel the first effects — lighter mornings, better energy.",                                    bg: "#E8F5E0", border: "#39613B", color: "#39613B" },
  { period: "Week 3–4", title: "Visible Change",              desc: "People around you will notice. Easier movement, lower pain score.",                                   bg: "#FEF9E7", border: "#C0863B", color: "#C0863B" },
  { period: "Month 2",  title: "Steady Progress",             desc: "Your anti-inflammation routine becomes a natural habit. No more reminders needed.",                    bg: "#FFFBF0", border: "#FED255", color: "#8B6914" },
  { period: "Month 3",  title: "New You, New Life",           desc: "50%+ pain score reduction. More active, happier, healthier. This is the New You.",                     bg: "#F4F8F0", border: "#7DAE2F", color: "#39613B" },
];

const PRODUCT_ICONS: Record<number, { icon: typeof HeartPulse; bg: string }> = {
  1: { icon: HeartPulse,       bg: "#E74C3C" },
  2: { icon: UtensilsCrossed,  bg: "#27AE60" },
  3: { icon: Dumbbell,         bg: "#2980B9" },
  4: { icon: Crown,            bg: "#F39C12" },
};

function getTierLabel(tier: number): string {
  const map: Record<number, string> = {
    399: "1 Pack", 699: "2 Packs", 999: "3 Packs", 1499: "5 Packs",
    2998: "10 Packs", 4497: "15 Packs", 5996: "20 Packs", 7499: "25 Packs",
    8994: "30 Packs", 11992: "40 Packs", 14990: "50 Packs",
  };
  return map[tier] ?? `₱${tier.toLocaleString()} order`;
}

// ============================================================
// CONTENT BUILDERS — extract from API response w/ fallback
// ============================================================
function buildTips(c: Record<string, string>, defaults: string[]): string[] {
  const fromDB = [1,2,3,4,5,6,7,8]
    .map(n => c[`daily_tip_${n}`]?.trim())
    .filter(Boolean) as string[];
  return fromDB.length > 0 ? fromDB : defaults;
}

function buildFaqs(c: Record<string, string>, defaults: { q: string; a: string }[]): { q: string; a: string }[] {
  const fromDB = [1,2,3,4,5,6,7]
    .map(n => {
      const q = c[`faq_${n}_q`]?.trim();
      const a = c[`faq_${n}_a`]?.trim();
      return q && a ? { q, a } : null;
    })
    .filter(Boolean) as { q: string; a: string }[];
  return fromDB.length > 0 ? fromDB : defaults;
}

function buildTestimonials(
  c: Record<string, string>,
  defaults: typeof DEFAULT_TESTIMONIALS
): typeof DEFAULT_TESTIMONIALS {
  const fromDB = [1,2,3].map(n => {
    const name  = c[`testimonial_${n}_name`]?.trim();
    const quote = c[`testimonial_${n}_quote`]?.trim();
    if (!name || !quote) return null;
    return {
      name,
      age:        parseInt(c[`testimonial_${n}_age`]?.trim() || "0"),
      location:   c[`testimonial_${n}_location`]?.trim() || "",
      quote,
      stars:      5,
      painBefore: parseInt(c[`testimonial_${n}_pain_before`]?.trim() || "0"),
      painAfter:  parseInt(c[`testimonial_${n}_pain_after`]?.trim()  || "0"),
    };
  }).filter(Boolean) as typeof DEFAULT_TESTIMONIALS;
  return fromDB.length > 0 ? fromDB : defaults;
}

function buildVideos(
  c: Record<string, string>,
  defaults: typeof DEFAULT_VIDEOS
): typeof DEFAULT_VIDEOS {
  return defaults.map((def, i) => {
    const n = i + 1;
    return {
      title: c[`video_${n}_title`]?.trim() || def.title,
      desc:  c[`video_${n}_desc`]?.trim()  || def.desc,
      url:   c[`video_${n}_url`]?.trim()   || def.url,
    };
  });
}

// ============================================================
// YOUTUBE HELPER
// ============================================================
function extractYouTubeId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return "";
}

// ============================================================
// EXPIRY BANNER — auto-shows when customer's access is expiring
// ============================================================
function ExpiryBanner({ daysLeft, onReorder, onDismiss }: { daysLeft: number; onReorder: () => void; onDismiss: () => void }) {
  const urgent = daysLeft <= 3;
  return (
    <div style={{ background: urgent ? "#7f1d1d" : "#78350f", borderBottom: `3px solid ${urgent ? "#ef4444" : "#f59e0b"}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{urgent ? "🚨" : "⏰"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: urgent ? "#fca5a5" : "#FED255", margin: "0 0 2px" }}>
          {urgent ? `Only ${daysLeft} days left!` : `Expires in ${daysLeft} days!`}
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>Order now so your wellness journey continues uninterrupted.</p>
      </div>
      <button onClick={onReorder} style={{ background: urgent ? "#ef4444" : "#f59e0b", color: "white", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
        🛒 Order
      </button>
      <button onClick={onDismiss} aria-label="Close" style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 999, width: 28, height: 28, fontSize: 14, cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ============================================================
// NOTIFICATION BANNER (admin-sent announcements)
// ============================================================
function NotificationBanner({ title, message, onDismiss }: { title: string; message: string; onDismiss: () => void }) {
  return (
    <div style={{ background: "#1B201A", borderBottom: `3px solid ${G}`, padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>📣</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#FED255", margin: "0 0 2px" }}>{title}</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>{message}</p>
      </div>
      <button onClick={onDismiss} aria-label="Close" style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 999, width: 32, height: 32, fontSize: 16, cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ============================================================
// PROMO BANNER
// ============================================================
function PromoBanner({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  return (
    <div style={{ background: GOLD, borderBottom: `3px solid ${AMBER}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <p style={{ flex: 1, fontSize: 16, fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.5 }}>{text}</p>
      <button onClick={onDismiss} aria-label="Close promo" style={{ background: "rgba(0,0,0,0.12)", border: "none", borderRadius: 999, width: 34, height: 34, fontSize: 18, cursor: "pointer", color: DARK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ============================================================
// COACH PICKER MODAL
// ============================================================
function CoachModal({ coaches, onClose, reorderMessage }: { coaches: Coach[]; onClose: () => void; reorderMessage?: string }) {
  const [msgCopied, setMsgCopied] = useState(false);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto", padding: "0 0 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div style={{ width: 48, height: 5, borderRadius: 999, background: "#D9D0C0" }} />
        </div>
        {reorderMessage && (
          <div style={{ margin: "0 20px 4px", background: "#E8F5E0", border: "2px solid #39613B", borderRadius: 16, padding: "16px 18px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#39613B", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: 1 }}>📋 I-copy ang mensahe, tapos i-send sa coach:</p>
            <p style={{ fontSize: 14, color: "#1B201A", margin: "0 0 12px", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{reorderMessage}</p>
            <button
              onClick={() => navigator.clipboard.writeText(reorderMessage).then(() => { setMsgCopied(true); setTimeout(() => setMsgCopied(false), 3000); })}
              style={{ background: msgCopied ? "#39613B" : "white", color: msgCopied ? "white" : "#39613B", border: "2px solid #39613B", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }}
            >
              {msgCopied ? "✅ Copied!" : "📋 Copy Message"}
            </button>
          </div>
        )}
        <div style={{ padding: "12px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 4px 0" }}>👥 Choose Your Coach</h2>
              <p style={{ fontSize: 15, color: MID, margin: 0 }}>{reorderMessage ? "Copy the message above, then send to your coach!" : "Call or message to order"}</p>
            </div>
            <button onClick={onClose} style={{ background: "#F0EDE6", border: "none", borderRadius: 999, width: 40, height: 40, fontSize: 20, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {coaches.map((c, i) => (
            <div key={i} style={{ background: "#FAFAF5", border: "2px solid #D9D0C0", borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Image src={c.photo} alt={c.name} width={52} height={52} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", border: `2px solid ${G}`, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 13, color: G, margin: "2px 0 0 0", fontWeight: 600 }}>R&M EaseBrew Wellness Coach</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={`tel:${c.number}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: G, color: "#fff", borderRadius: 14, padding: "16px 8px", fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center" as const }}>📞 Tumawag</a>
                <a href={c.facebook} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1877F2", color: "#fff", borderRadius: 14, padding: "16px 8px", fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center" as const }}>📘 Facebook</a>
              </div>
              <p style={{ fontSize: 14, color: MID, margin: "10px 0 0 0", textAlign: "center" as const }}>📱 {c.display}</p>
            </div>
          ))}
        </div>
        <div style={{ margin: "20px 20px 0", background: "#FEF9E7", borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${GOLD}`, textAlign: "center" as const }}>
          <p style={{ fontSize: 15, color: AMBER, fontWeight: 700, margin: "0 0 4px 0" }}>💬 Don't hesitate!</p>
          <p style={{ fontSize: 14, color: MID, margin: 0, lineHeight: 1.6 }}>We're always here for you. Tap 📞 to call directly!</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================
function StarRating({ count }: { count: number }) {
  return <div style={{ display: "flex", gap: 2 }}>{[...Array(count)].map((_, i) => <span key={i} style={{ color: GOLD, fontSize: 20 }}>★</span>)}</div>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: "1px solid #D9D0C0", padding: "20px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: DARK, margin: 0, lineHeight: 1.4 }}>{q}</p>
        <span style={{ fontSize: 26, color: G, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      {open && <p style={{ fontSize: 17, color: MID, margin: "12px 0 0 0", lineHeight: 1.7 }}>{a}</p>}
    </div>
  );
}

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return (
    <div style={{ background: DARK, borderRadius: 18, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${G}` }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 60, marginBottom: 10, color: GOLD }}>▶</div>
        <p style={{ fontSize: 13, opacity: 0.55, margin: 0 }}>Paste the YouTube link in Admin → Content → Videos</p>
      </div>
    </div>
  );
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", aspectRatio: "16/9", border: `2px solid ${G}` }}>
      <iframe
        width="100%" height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: "block", border: "none" }}
      />
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

// ============================================================
// AUDIO FEEDBACK (Web Audio API — no files needed)
// ============================================================
function playChime(type: "check" | "save" = "check") {
  try {
    type AC = typeof AudioContext;
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: AC }).webkitAudioContext);
    const ctx = new Ctx();
    const notes = type === "save" ? [659, 784] : [784, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13);
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.13 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.3);
      osc.start(ctx.currentTime + i * 0.13);
      osc.stop(ctx.currentTime + i * 0.13 + 0.35);
    });
  } catch {}
}

// ============================================================
// QUICK CHECK-IN (1-tap log from home page)
// ============================================================
type QuickEntry = { date: string; painScore: number; painLocation: string; easebrewUmaga: boolean; easebrewGabi: boolean; mood: number; notes: string };

function QuickCheckIn({ storageKey }: { storageKey: string }) {
  const today = new Date().toISOString().split("T")[0];
  const [umaga, setUmaga] = useState(false);
  const [gabi,  setGabi]  = useState(false);

  useEffect(() => {
    const entries = readProgressCache<QuickEntry[]>(storageKey, []);
    const t = entries.find(e => e.date === today);
    if (t) { setUmaga(t.easebrewUmaga); setGabi(t.easebrewGabi); }
  }, [storageKey, today]);

  function logIntake(period: "umaga" | "gabi") {
    const entries = readProgressCache<QuickEntry[]>(storageKey, []);
    const idx = entries.findIndex(e => e.date === today);
    const base: QuickEntry = idx >= 0 ? entries[idx] : { date: today, painScore: 0, painLocation: "", easebrewUmaga: false, easebrewGabi: false, mood: 0, notes: "" };
    const updated = { ...base, [period === "umaga" ? "easebrewUmaga" : "easebrewGabi"]: true };
    const next = idx >= 0 ? entries.map((e, i) => i === idx ? updated : e) : [...entries, updated];
    writeProgressCache(storageKey, next);
    fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "tracker", data: { entries: next } }) }).catch(() => {});
    if (period === "umaga") setUmaga(true); else setGabi(true);
    playChime("check");
  }

  const both = umaga && gabi;
  const btn = (period: "umaga" | "gabi", icon: string, label: string, done: boolean) => (
    <button
      onClick={() => !done && logIntake(period)}
      style={{ flex: 1, background: done ? G : "white", color: done ? "white" : DARK, border: `2.5px solid ${done ? G : "#D9D0C0"}`, borderRadius: 20, padding: "22px 10px", cursor: done ? "default" : "pointer", transition: "all 0.2s", textAlign: "center" as const }}
    >
      <div style={{ fontSize: 36, marginBottom: 6 }}>{done ? "✅" : icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, opacity: 0.7, marginTop: 3 }}>{done ? "Done!" : "Tap to log"}</div>
    </button>
  );

  return (
    <div style={{ background: both ? "#E8F5E0" : "white", border: `2px solid ${both ? G : "#D9D0C0"}`, borderRadius: 22, padding: "18px", marginBottom: 24 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: both ? G : MID, margin: "0 0 12px", textAlign: "center" as const }}>
        {both ? "✅ Done for today!" : "☕ Have you taken yours today?"}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        {btn("umaga", "☀️", "Morning", umaga)}
        {btn("gabi",  "🌙", "Evening", gabi)}
      </div>
    </div>
  );
}

// ============================================================
// INSTALL BANNER — iOS, Android, Tablet
// ============================================================
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Re-show after 3 days (not permanent dismiss)
    const dismissedAt = localStorage.getItem("pwa-banner-dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 3 * 86400000) return;

    // iOS 13+ iPads show as MacIntel with touch — detect both cases
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);

    if (isIOS && isSafari) { setTimeout(() => setShowIOS(true), 3000); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowAndroid(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setShowAndroid(false); }
    setDeferredPrompt(null);
  };
  const handleDismiss = () => {
    setShowAndroid(false); setShowIOS(false); setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (installed || dismissed) return null;

  if (showAndroid) return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, zIndex: 9998, background: G, padding: "20px 24px", boxShadow: "0 -4px 24px rgba(0,0,0,0.25)", borderTop: `4px solid ${GOLD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 40, flexShrink: 0 }}>📲</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>I-install ang R&M EaseBrew App!</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>Save to your phone — easy access anytime!</p>
        </div>
        <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 24, cursor: "pointer", padding: "4px", flexShrink: 0 }}>✕</button>
      </div>
      <button onClick={handleAndroidInstall} style={{ marginTop: 14, width: "100%", background: GOLD, color: G, border: "none", borderRadius: 14, padding: "16px", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>✅ Yes! I-install sa Aking Phone →</button>
    </div>
  );

  if (showIOS) return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, zIndex: 9998, background: WHITE, padding: "24px 24px 32px", boxShadow: "0 -4px 24px rgba(0,0,0,0.2)", borderTop: `4px solid ${GOLD}`, borderRadius: "20px 20px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📱</span>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>Save to your iPhone!</p>
            <p style={{ fontSize: 13, color: MID, margin: 0 }}>For easy access anytime</p>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: "#f0f0f0", border: "none", borderRadius: 999, width: 32, height: 32, fontSize: 18, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {[
          { step: "1", icon: "🌐", label: "Open in", highlight: "Safari" },
          { step: "2", icon: "⬆️", label: "Tap the", highlight: "Share button (⬆️) at the bottom" },
          { step: "3", icon: "➕", label: "Select", highlight: '"Add to Home Screen"' },
          { step: "4", icon: "✅", label: "Tap", highlight: '"Add" — done!' },
        ].map(s => (
          <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F4FAF0", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #C5D9BC" }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: G, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
            <p style={{ fontSize: 15, margin: 0, color: DARK, lineHeight: 1.4 }}>{s.label} <strong style={{ color: G }}>{s.highlight}</strong></p>
          </div>
        ))}
      </div>
      <div style={{ background: "#FEF9E7", borderRadius: 10, padding: "10px 14px", border: `1px solid ${GOLD}` }}>
        <p style={{ fontSize: 13, color: AMBER, margin: 0, textAlign: "center", fontWeight: 600 }}>⚠️ Use Safari — hindi Chrome ang gagamitin sa iPhone</p>
      </div>
    </div>
  );
  return null;
}

// ============================================================
// TAB TYPE
// ============================================================
type Tab = "home" | "gifts" | "tips" | "coaches";

// ============================================================
// DAILY REMINDER CARD
// ============================================================
// PACK COUNTDOWN (Feature 3)
// ============================================================
function PackCountdownCard({ tier, packs, daysLeft, onReorder }: { tier: number; packs: number; daysLeft: number; onReorder: () => void }) {
  const config = PRICE_CONFIG[tier];
  if (!config) return null;
  const { validityDays } = config;
  const daysElapsed = Math.max(0, validityDays - daysLeft);
  const progressPct = Math.min(100, Math.round(daysElapsed / validityDays * 100));
  const packDuration = validityDays / packs;
  const currentPack = Math.min(packs, Math.ceil(Math.max(1, daysElapsed) / packDuration));
  const barColor = progressPct >= 80 ? "#ef4444" : progressPct >= 55 ? "#f59e0b" : "#39613B";
  const borderColor = progressPct >= 80 ? "#fca5a5" : progressPct >= 55 ? "#fde68a" : "#c8e6c9";
  return (
    <div style={{ background: "white", border: `2px solid ${borderColor}`, borderRadius: 18, padding: "20px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#1B201A", margin: "0 0 3px" }}>📦 Pack {currentPack} of {packs}</p>
          <p style={{ fontSize: 17, color: "#4E504F", margin: 0 }}>{daysLeft} days • ~{daysLeft * 2} sachets left</p>
        </div>
        {daysLeft <= 14 && (
          <button onClick={onReorder} style={{ background: "#39613B", color: "white", border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
            🛒 Order
          </button>
        )}
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 999, height: 13, overflow: "hidden" }}>
        <div style={{ width: `${progressPct}%`, height: "100%", background: barColor, borderRadius: 999 }} />
      </div>
      <p style={{ fontSize: 16, color: "#9E9E9E", margin: "6px 0 0", textAlign: "right" as const }}>{progressPct}% used</p>
    </div>
  );
}

// ============================================================
// ENGAGEMENT NUDGE (Feature 2)
// ============================================================
function EngagementNudge({ days, onDismiss }: { days: number; onDismiss: () => void }) {
  return (
    <div style={{ background: "#FEF9E7", border: "2px solid #FED255", borderRadius: 18, padding: "18px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ fontSize: 36, flexShrink: 0 }}>📋</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#1B201A", margin: "0 0 4px" }}>{days} days since last log!</p>
        <p style={{ fontSize: 15, color: "#4E504F", margin: 0, lineHeight: 1.5 }}>Update your pain tracker to track your progress.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        <Link href="/tracker" style={{ background: "#39613B", color: "white", textDecoration: "none", borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 700, textAlign: "center" as const }}>
          📝 Log Now
        </Link>
        <button onClick={onDismiss} style={{ background: "transparent", border: "none", fontSize: 12, color: "#9E9E9E", cursor: "pointer", padding: "4px" }}>
          Later
        </button>
      </div>
    </div>
  );
}

// ============================================================
// WEEKLY SUMMARY CARD (Feature 4)
// ============================================================
function WeeklySummaryCard({ data, onDismiss }: { data: { avgPain: number; consistency: number; entries: number }; onDismiss: () => void }) {
  const isGood = data.consistency >= 70;
  const stats = [
    { label: "Days Logged", value: `${data.entries}/7`, icon: "📅" },
    { label: "Consistency",      value: `${data.consistency}%`, icon: "🎯" },
    { label: "Avg Pain",         value: `${data.avgPain}/10`, icon: "💊" },
  ];
  return (
    <div style={{ background: isGood ? "#E8F5E0" : "#FEF9E7", border: `2px solid ${isGood ? "#39613B" : "#FED255"}`, borderRadius: 18, padding: "20px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: isGood ? "#39613B" : "#b45309", margin: "0 0 3px", textTransform: "uppercase" as const, letterSpacing: 1 }}>📊 Weekly Summary</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1B201A", margin: 0, lineHeight: 1.4 }}>
            {isGood ? "Great! You're consistent this week! 🌟" : "You can do it! Try to reach 7/7 this week! 💪"}
          </p>
        </div>
        <button onClick={onDismiss} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#9E9E9E", padding: "0 0 0 10px", flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "13px 10px", textAlign: "center" as const }}>
            <p style={{ fontSize: 22, margin: "0 0 4px" }}>{s.icon}</p>
            <p style={{ fontSize: 19, fontWeight: 700, color: "#1B201A", margin: "0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize: 14, color: "#9E9E9E", margin: 0, lineHeight: 1.3 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
function DailyReminderCard({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  const [perm, setPerm] = useState<NotificationPermission>("default");
  useEffect(() => {
    if ("Notification" in window) setPerm(Notification.permission);
  }, []);

  async function handleEnable() {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") {
      onToggle();
      new Notification("☕ EaseBrew Reminder", { body: "Your daily reminder is set! We'll alert you morning (7–9 AM) and evening (7–9 PM).", icon: "/icon-192.png" });
    }
  }

  if (perm === "denied") return null;

  return (
    <div style={{ background: enabled ? "#E8F5E0" : "#FEF9E7", border: `2px solid ${enabled ? "#39613B" : "#FED255"}`, borderRadius: 18, padding: "20px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <span style={{ fontSize: 36 }}>🔔</span>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#1B201A", margin: 0 }}>Daily Reminder</p>
          <p style={{ fontSize: 15, color: "#4E504F", margin: "3px 0 0 0", lineHeight: 1.5 }}>We'll remind you at 7 AM and 7 PM so you never miss a drink!</p>
        </div>
      </div>
      {enabled ? (
        <button onClick={onToggle} style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          ✅ Reminder ON — Tap to turn off
        </button>
      ) : (
        <button onClick={handleEnable} style={{ width: "100%", background: "#FED255", color: "#39613B", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          🔔 I-on ang Daily Reminder
        </button>
      )}
    </div>
  );
}

// ============================================================
// ONBOARDING MODAL — shows only on first visit
// ============================================================
function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      emoji: "☕",
      title: "Welcome!",
      body: "This is your personal EaseBrew Wellness Hub. We're here to guide you on your wellness journey!",
    },
    {
      emoji: "💊",
      title: "Drink 2x Daily",
      body: "For best results — drink EaseBrew every morning and evening. Don't skip a day for fastest results!",
    },
    {
      emoji: "📊",
      title: "Track Your Progress",
      body: "Use the Pain Tracker daily to see your improvement. You'll see how fast your pain goes down!",
    },
  ];
  const s = steps[step];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 28, padding: "40px 28px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>{s.emoji}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1B201A", margin: "0 0 14px", lineHeight: 1.3, fontFamily: "Georgia, serif" }}>{s.title}</h2>
        <p style={{ fontSize: 17, color: "#4E504F", margin: "0 0 28px", lineHeight: 1.7, fontFamily: "Georgia, serif" }}>{s.body}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#39613B" : "#E0D8CC", transition: "all 0.3s" }} />
          ))}
        </div>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onClose}
            style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
          >
            ✅ Let's Get Started!
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Home() {
  // ✅ FIXED — gumagamit na ng shared useSessionGuard (may server-side
  // revalidation sa /api/verify), kapareho ng ibang customer pages.
  // Dati ay sariling getSession() lang ang ginagamit dito na local-cookie
  // check lang — kaya kahit na-deactivate/na-delete na ang code sa Admin,
  // patuloy pa ring may access ang customer hangga't valid ang lumang cookie.
  const { checking, session } = useSessionGuard();
  const customerTier = session?.tier ?? 0;
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!session?.expires_at) { setDaysLeft(null); return; }
    setDaysLeft(Math.ceil((new Date(session.expires_at).getTime() - Date.now()) / 86400000));
  }, [session?.expires_at]);

  const [tipIndex, setTipIndex] = useState(0);
  const [tab, setTab] = useState<Tab>("home");
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [reorderMessage, setReorderMessage] = useState<string | undefined>();

  // ── DYNAMIC STATE ────────────────────────────────────────────
  const [notifTitle, setNotifTitle]         = useState("");
  const [notifMessage, setNotifMessage]     = useState("");
  const [notifActive, setNotifActive]       = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);
  const [promoText, setPromoText]           = useState("");
  const [promoEnabled, setPromoEnabled]     = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [expiryDismissed, setExpiryDismissed] = useState(false);
  const [daysSinceLog, setDaysSinceLog]     = useState<number | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [weeklyData, setWeeklyData]         = useState<{ avgPain: number; consistency: number; entries: number } | null>(null);
  const [weeklyDismissed, setWeeklyDismissed] = useState(false);
  const [products, setProducts]             = useState(DEFAULT_PRODUCTS);
  const [coaches, setCoaches]               = useState<Coach[]>(DEFAULT_COACHES);
  const [heroTitle, setHeroTitle]           = useState("Kamusta, Nanay at Tatay! 👋");
  const [heroSubtitle, setHeroSubtitle]     = useState("Your daily companion for a healthier body.");
  const [wellnessTips, setWellnessTips]     = useState(DEFAULT_WELLNESS_TIPS);
  const [faqs, setFaqs]                     = useState(DEFAULT_FAQS);
  const [testimonials, setTestimonials]     = useState(DEFAULT_TESTIMONIALS);
  const [videos, setVideos]                 = useState(DEFAULT_VIDEOS);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── ONBOARDING — show once on first visit ────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("eb_onboarded_v1")) {
      setShowOnboarding(true);
    }
  }, []);

  const showExpiryBanner = daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && !expiryDismissed;

  // ── FETCH PUBLIC CONTENT ─────────────────────────────────────
  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(data => {
        if (!data?.content) return;
        const c = data.content as Record<string, string>;

        if (c.notification_active === "true" && c.notification_title?.trim()) {
          const title = c.notification_title.trim();
          const dismissed = localStorage.getItem(`eb_notif_dismissed_${title}`) === "1";
          setNotifTitle(title);
          setNotifMessage(c.notification_message?.trim() || "");
          setNotifActive(true);
          setNotifDismissed(dismissed);
        }

        if (c.promo_enabled === "true" && c.promo_text?.trim()) {
          setPromoEnabled(true);
          setPromoText(c.promo_text.trim());
        }

        if (c.hero_title?.trim())    setHeroTitle(c.hero_title.trim());
        if (c.hero_subtitle?.trim()) setHeroSubtitle(c.hero_subtitle.trim());

        setProducts(applyContentOverrides(DEFAULT_PRODUCTS, c));

        setCoaches(buildCoaches(c, DEFAULT_COACHES));
        setWellnessTips(buildTips(c, DEFAULT_WELLNESS_TIPS));
        setFaqs(buildFaqs(c, DEFAULT_FAQS));
        setTestimonials(buildTestimonials(c, DEFAULT_TESTIMONIALS));
        setVideos(buildVideos(c, DEFAULT_VIDEOS));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLargeFont(localStorage.getItem("eb_large_font") === "1");
    const r = localStorage.getItem("eb_reminder_on") === "1";
    setReminderOn(r);
    if (r) {
      navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage({ type: "SET_REMINDER", enabled: true }));
    }

    // Send a TICK to the SW every 30 min while the page is open.
    // This replaces the unreliable setInterval inside the SW (browsers suspend SWs on mobile).
    const tick = setInterval(() => {
      navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage({ type: "REMINDER_TICK" }));
    }, 30 * 60 * 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (checking || !session) return;
    const key = progressStorageKey("easebrew-tracker-v2", session.code);
    const entries = readProgressCache<{ date: string; painScore: number }[]>(key, []);
    if (entries.length === 0) return;

    const lastDate = entries[entries.length - 1].date;
    const days = Math.floor((Date.now() - new Date(lastDate + "T00:00:00").getTime()) / 86400000);
    setDaysSinceLog(days);

    const todayStr = new Date().toISOString().split("T")[0];
    const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const weekEntries = entries.filter(e => e.date >= sevenAgo && e.date <= todayStr);
    if (weekEntries.length >= 2) {
      const avgPain = Math.round(weekEntries.reduce((s, e) => s + e.painScore, 0) / weekEntries.length * 10) / 10;
      setWeeklyData({ avgPain, consistency: Math.round(weekEntries.length / 7 * 100), entries: weekEntries.length });
    }
  }, [checking, session]);

  // Handle quick_log from SW notification action (URL param or postMessage)
  useEffect(() => {
    if (checking || !session) return;
    const key = progressStorageKey("easebrew-tracker-v2", session.code);

    function doQuickLog(period: "umaga" | "gabi") {
      const today = new Date().toISOString().split("T")[0];
      const entries = readProgressCache<QuickEntry[]>(key, []);
      const idx = entries.findIndex(e => e.date === today);
      const base: QuickEntry = idx >= 0 ? entries[idx] : { date: today, painScore: 0, painLocation: "", easebrewUmaga: false, easebrewGabi: false, mood: 0, notes: "" };
      const updated = { ...base, [period === "umaga" ? "easebrewUmaga" : "easebrewGabi"]: true };
      const next = idx >= 0 ? entries.map((e, i) => i === idx ? updated : e) : [...entries, updated];
      writeProgressCache(key, next);
      fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "tracker", data: { entries: next } }) }).catch(() => {});
      playChime("check");
    }

    // From URL param (SW opened app with ?quick_log=umaga)
    const params = new URLSearchParams(window.location.search);
    const ql = params.get("quick_log");
    if (ql === "umaga" || ql === "gabi") {
      window.history.replaceState({}, "", "/");
      doQuickLog(ql);
    }

    // From SW postMessage (app was already open)
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "QUICK_LOG" && (e.data.period === "umaga" || e.data.period === "gabi")) {
        doQuickLog(e.data.period);
      }
      if (e.data?.type === "NAVIGATE" && typeof e.data.url === "string") {
        window.location.href = e.data.url;
      }
    };
    navigator.serviceWorker?.addEventListener("message", handler);
    return () => navigator.serviceWorker?.removeEventListener("message", handler);
  }, [checking, session]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (localStorage.getItem("eb_reminder_on") !== "1") return;
    const h = new Date().getHours();
    const today = new Date().toISOString().split("T")[0];
    if (h >= 7 && h < 9 && !localStorage.getItem(`eb_rem_am_${today}`)) {
      localStorage.setItem(`eb_rem_am_${today}`, "1");
      new Notification("☕ EaseBrew Morning Reminder", { body: "Good morning! Don't forget to drink your 1st EaseBrew sachet today!", icon: "/icon-192.png" });
    }
    if (h >= 19 && h < 21 && !localStorage.getItem(`eb_rem_pm_${today}`)) {
      localStorage.setItem(`eb_rem_pm_${today}`, "1");
      new Notification("🌙 EaseBrew Evening Reminder", { body: "Good evening! Don't forget to drink your 2nd EaseBrew sachet tonight!", icon: "/icon-192.png" });
    }
  }, []);

  const { unlocked: unlockedProducts, locked: lockedProducts } = splitByTier(products, customerTier);

  function buildReorderMessage() {
    const pkgLabel = getTierLabel(customerTier);
    const expiryStr = session?.expires_at
      ? new Date(session.expires_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
      : null;
    return `Hi po! I'd like to order EaseBrew again.\n\nPackage: ${pkgLabel}${expiryStr ? `\nExpires: ${expiryStr}` : ""}\n\nIs it available? Thank you po! 🙏`;
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p className="c-body" style={{ color: G, fontWeight: 600 }}>☕ Loading...</p>
    </div>
  );

  const tabBtn = (t: Tab, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => { setTab(t); window.scrollTo({ top: 0 }); }}
      style={{
        flex: 1, padding: "12px 4px 10px", fontSize: "13px", fontWeight: "bold",
        border: "none", borderBottom: tab === t ? `4px solid ${GOLD}` : "4px solid transparent",
        background: "transparent", color: tab === t ? GOLD : "rgba(255,255,255,0.6)",
        cursor: "pointer", transition: "all 0.2s", fontFamily: "Georgia, serif", lineHeight: 1.2,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      }}
    >
      <Icon size={22} strokeWidth={tab === t ? 2.5 : 1.8} />
      {label}
    </button>
  );

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", fontSize: largeFont ? "110%" : "100%" }}>
      <InstallBanner />
      {showOnboarding && (
        <OnboardingModal onClose={() => {
          localStorage.setItem("eb_onboarded_v1", "1");
          setShowOnboarding(false);
        }} />
      )}
      {showCoachModal && <CoachModal coaches={coaches} onClose={() => { setShowCoachModal(false); setReorderMessage(undefined); }} reorderMessage={reorderMessage} />}

      {/* ── STICKY HEADER + TABS ─────────────────────────────── */}
      <div style={{ background: G, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        {showExpiryBanner && (
          <ExpiryBanner
            daysLeft={daysLeft!}
            onReorder={() => { setReorderMessage(buildReorderMessage()); setShowCoachModal(true); }}
            onDismiss={() => setExpiryDismissed(true)}
          />
        )}
        {notifActive && !notifDismissed && (
          <NotificationBanner
            title={notifTitle}
            message={notifMessage}
            onDismiss={() => {
              localStorage.setItem(`eb_notif_dismissed_${notifTitle}`, "1");
              setNotifDismissed(true);
            }}
          />
        )}
        {promoEnabled && !promoDismissed && (
          <PromoBanner text={promoText} onDismiss={() => setPromoDismissed(true)} />
        )}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 12, padding: "5px 14px", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>R&amp;M EASEBREW</div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, margin: "4px 0 0 0", fontWeight: 500 }}>
              {getTierLabel(customerTier)} — {unlockedProducts.length} {unlockedProducts.length === 1 ? "Gift" : "Gifts"} Unlocked
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setLargeFont(v => { const n = !v; localStorage.setItem("eb_large_font", n ? "1" : "0"); return n; })}
              style={{ background: largeFont ? GOLD : "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 15, fontWeight: 700, color: largeFont ? G : "white", cursor: "pointer", lineHeight: 1 }}
              aria-label="Increase text size"
            >
              {largeFont ? "A−" : "A+"}
            </button>
            <span style={{ fontSize: 32 }}>☕</span>
          </div>
        </div>
        <nav className="customer-home-nav" aria-label="Main menu" style={{ display: "flex", marginTop: 8 }}>
          {tabBtn("home",    "Home",    HomeIcon)}
          {tabBtn("gifts",   "Gifts",   Gift)}
          {tabBtn("tips",    "Tips",    Lightbulb)}
          {tabBtn("coaches", "Coaches", Users)}
        </nav>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────── */}
      <div style={{ padding: "28px 20px 80px" }}>

        {/* ═══ HOME TAB ═════════════════════════════════════════ */}
        {tab === "home" && (
          <div>
            {/* ── Hero Banner with Image ── */}
            <div style={{ borderRadius: 22, marginBottom: 24, overflow: "hidden", position: "relative", boxShadow: "0 8px 32px rgba(24,59,40,0.25)" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: G }}>
                <Image
                  src="/images/home-hero.jpg"
                  alt="EaseBrew Wellness"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  priority
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(24,59,40,0.15) 0%, rgba(24,59,40,0.82) 100%)" }} />
              </div>
              <div style={{ background: G, padding: "20px 24px 24px", position: "relative" }}>
                <div style={{ position: "absolute", top: -30, right: -20, width: 100, height: 100, background: "rgba(125,174,47,0.18)", borderRadius: "50%" }} />
                <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 999, padding: "5px 16px", fontSize: 14, fontWeight: 900, letterSpacing: 1.2, marginBottom: 10 }}>
                  R&amp;M EASEBREW
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 10px 0", lineHeight: 1.3, color: "#fff" }}>{heroTitle}</h1>
                <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.65, margin: 0, color: "#fff" }}>{heroSubtitle}</p>
              </div>
            </div>

            {weeklyData && !weeklyDismissed && (
              <WeeklySummaryCard data={weeklyData} onDismiss={() => setWeeklyDismissed(true)} />
            )}
            {daysSinceLog !== null && daysSinceLog >= 3 && !nudgeDismissed && (
              <EngagementNudge days={daysSinceLog} onDismiss={() => setNudgeDismissed(true)} />
            )}
            {session && daysLeft !== null && (
              <PackCountdownCard
                tier={customerTier}
                packs={session.packs ?? 1}
                daysLeft={daysLeft}
                onReorder={() => { setReorderMessage(buildReorderMessage()); setShowCoachModal(true); }}
              />
            )}

            {session && (
              <QuickCheckIn storageKey={progressStorageKey("easebrew-tracker-v2", session.code)} />
            )}

            {/* ── Quick Access to Unlocked Tools ── */}
            {unlockedProducts.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 14px 0" }}>Mabilis na Access</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {unlockedProducts.map(p => {
                    const meta = PRODUCT_ICONS[p.id];
                    const Icon = meta?.icon;
                    return (
                    <Link key={p.id} href={p.appUrl} style={{
                      background: WHITE, border: `2px solid ${G}`, borderRadius: 18,
                      padding: "16px 20px", textDecoration: "none",
                      display: "flex", alignItems: "center", gap: 14, minHeight: 64,
                      boxShadow: "0 2px 10px rgba(24,59,40,0.10)",
                    }}>
                      {meta && Icon ? (
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${meta.bg}40` }}>
                          <Icon size={22} color="#fff" strokeWidth={2.2} />
                        </div>
                      ) : (
                        <span style={{ fontSize: 36, flexShrink: 0 }}>{p.icon}</span>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 17, fontWeight: 700, color: G, margin: 0, lineHeight: 1.3 }}>{p.name}</p>
                        <p style={{ fontSize: 14, color: MID, margin: "3px 0 0 0" }}>Buksan</p>
                      </div>
                      <span style={{ fontSize: 24, color: G, flexShrink: 0, fontWeight: 700 }}>›</span>
                    </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Free Wellness Tools ── */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>Free Health Tools</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { href: "/blood-pressure", icon: Activity, bg: "#8E44AD", label: "Blood Pressure Log" },
                  { href: "/medication",     icon: Pill,     bg: "#E67E22", label: "Medication Log" },
                  { href: "/medical-card",   icon: IdCard,   bg: "#16A085", label: "Medical Info Card" },
                  { href: "/bmi",            icon: Dumbbell, bg: "#2980B9", label: "BMI Calculator" },
                ] as const).map(tool => {
                  const TIcon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href} style={{ background: WHITE, border: "2px solid #D9D0C0", borderRadius: 18, padding: "18px 16px", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minHeight: 90 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: tool.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${tool.bg}40` }}>
                        <TIcon size={22} color="#fff" strokeWidth={2.2} />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0, textAlign: "center", lineHeight: 1.3 }}>{tool.label}</p>
                    </Link>
                  );
                })}
                <Link href="/report" style={{ background: WHITE, border: "2px solid #D9D0C0", borderRadius: 18, padding: "18px 16px", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minHeight: 90, gridColumn: "1 / -1" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E74C3C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(231,76,60,0.4)" }}>
                    <HeartPulse size={22} color="#fff" strokeWidth={2.2} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0, textAlign: "center", lineHeight: 1.3 }}>Weekly Wellness Report</p>
                </Link>
              </div>
            </div>

            {/* ── Daily Wellness Tip ── */}
            <div style={{ background: "#FFFBF0", border: `2px solid ${GOLD}`, borderRadius: 18, padding: "20px 22px", marginBottom: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: AMBER, margin: "0 0 10px 0", textTransform: "uppercase" as const, letterSpacing: 1 }}>💡 Tip of the Day</p>
              <p style={{ fontSize: 18, color: DARK, margin: "0 0 16px 0", lineHeight: 1.75 }}>🌿 {wellnessTips[tipIndex % wellnessTips.length]}</p>
              <button
                onClick={() => setTipIndex(i => (i + 1) % wellnessTips.length)}
                className="c-btn c-btn-gold"
                style={{ width: "100%" }}
              >
                Next Tip →
              </button>
            </div>

            <div style={{ background: "#FEF9E7", border: `2.5px solid ${GOLD}`, borderRadius: 18, padding: "18px 20px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: AMBER, margin: "0 0 6px 0" }}>☕ Drink 2x a day</p>
              <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}><strong style={{ color: G }}>Morning</strong> and <strong style={{ color: G }}>Evening</strong> — for best results!</p>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Your Daily Routine ☀️</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Follow this daily for best results.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {REMINDERS.map((r, i) => (
                <div key={i} style={{ background: r.bg, border: `2px solid ${r.border}`, borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 36, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: r.textColor, margin: "0 0 4px 0", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>{r.time}</p>
                    <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <DailyReminderCard
              enabled={reminderOn}
              onToggle={() => setReminderOn(v => {
                const n = !v;
                localStorage.setItem("eb_reminder_on", n ? "1" : "0");
                navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage({ type: "SET_REMINDER", enabled: n }));
                return n;
              })}
            />

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Your 90-Day Journey 📅</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Here's what to expect each phase.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {PROGRESS_GUIDE.map((p, i) => (
                <div key={i} style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 18, padding: "22px" }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: p.color, margin: "0 0 5px 0", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>{p.period}</p>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: "0 0 6px 0" }}>{p.title}</h3>
                  <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Upsell */}
            <div style={{ background: G, borderRadius: 22, padding: "36px 22px", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, background: "rgba(254,210,85,0.12)", borderRadius: "50%" }} />
              <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>✨ SPECIAL OFFER</div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3 }}>Bagong Katawan 90-Day Program</h2>
              <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 20px 0", lineHeight: 1.7 }}>The most complete wellness program — 90-day master plan, full exercise program, weekly check-ins, and all digital products!</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" as const }}>
                {["✅ 90-Day Master Plan with daily schedule", "✅ 3 Phases of progressive wellness program", "✅ Full exercise library for joint pain", "✅ Weekly milestone check-ins", "✅ All digital products included"].map((item, i) => (
                  <p key={i} style={{ fontSize: 16, margin: 0 }}>{item}</p>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/bagong-katawan" style={{ background: GOLD, color: G, borderRadius: 14, padding: "18px 28px", fontSize: 18, fontWeight: 700, width: "100%", textAlign: "center" as const, textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
                  🏆 I-start ang 90-Day Program →
                </Link>
                <button onClick={() => setShowCoachModal(true)} className="c-btn c-btn-outline" style={{ width: "100%", color: "#fff", borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)" }}>
                  🛒 Order 90-Day Program
                </button>
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, margin: "14px 0 0 0" }}>COD available • Free shipping • Nationwide</p>
            </div>
          </div>
        )}

        {/* ═══ GIFTS TAB ════════════════════════════════════════ */}
        {tab === "gifts" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>Your Free Gifts 🎁</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>All these gifts are <strong style={{ color: G }}>FREE</strong> — included with your order!</p>

            {unlockedProducts.length === 0 && (
              <div style={{ background: "#FEF9E7", border: `1.5px solid ${GOLD}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
                <p style={{ fontSize: 16, color: AMBER, margin: 0, fontWeight: 600 }}>ℹ️ Basic access lang ang order mo. Order 3 packs (₱999) para ma-unlock ang first free gift!</p>
              </div>
            )}

            {unlockedProducts.map(p => {
              const meta = PRODUCT_ICONS[p.id];
              const Icon = meta?.icon;
              return (
              <div key={p.id} style={{ background: WHITE, border: `2.5px solid ${G}`, borderRadius: 20, marginBottom: 14, overflow: "hidden", boxShadow: "0 6px 20px rgba(24,59,40,0.12)" }}>
                <div style={{ background: `linear-gradient(135deg, ${G} 0%, #2d6e40 100%)`, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ background: GOLD, color: G, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 900 }}>FREE GIFT</span>
                  </div>
                  {meta && Icon && (
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${meta.bg}60` }}>
                      <Icon size={28} color="#fff" strokeWidth={2.2} />
                    </div>
                  )}
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <h3 style={{ fontSize: 19, fontWeight: 900, color: G, margin: "0 0 8px 0" }}>{p.name}</h3>
                  <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.65 }}>{p.desc}</p>
                  <Link href={p.appUrl} style={{ background: G, color: "#fff", borderRadius: 14, padding: "16px 22px", fontSize: 17, fontWeight: 900, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {p.appLabel} →
                  </Link>
                </div>
              </div>
              );
            })}

            {lockedProducts.length > 0 && (
              <>
                <div style={{ background: "#FEF9E7", border: `1.5px solid ${GOLD}`, borderRadius: 14, padding: "14px 18px", margin: "20px 0 12px 0" }}>
                  <p style={{ fontSize: 15, color: AMBER, margin: 0, fontWeight: 700, textAlign: "center" as const }}>
                    🔒 Order more to unlock {lockedProducts.length} more free {lockedProducts.length === 1 ? "gift" : "gifts"}!
                  </p>
                </div>
                {lockedProducts.map(p => {
                  const meta = PRODUCT_ICONS[p.id];
                  const Icon = meta?.icon;
                  return (
                  <div key={p.id} style={{ background: "#F5F0E8", border: "2px solid #C5B99A", borderRadius: 18, padding: "22px", marginBottom: 14, opacity: 0.85 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      {meta && Icon ? (
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#C5B99A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={22} color="#8A7D6A" strokeWidth={2.2} />
                        </div>
                      ) : (
                        <span style={{ fontSize: 40, filter: "grayscale(1)" }}>{p.icon}</span>
                      )}
                      <span style={{ background: "#E8E0D0", color: "#8A7D6A", borderRadius: 8, padding: "7px 14px", fontSize: 15, fontWeight: 700 }}>🔒 I-unlock sa {p.tierLabel}</span>
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, color: "#8A7D6A", margin: "0 0 6px 0" }}>{p.name}</h3>
                    <p style={{ fontSize: 16, color: "#A89880", margin: "0 0 18px 0", lineHeight: 1.65 }}>{p.desc}</p>
                    <button onClick={() => setShowCoachModal(true)} className="c-btn c-btn-outline" style={{ width: "100%" }}>
                      Order more to unlock this →
                    </button>
                  </div>
                  );
                })}
              </>
            )}

            {/* Videos */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0" }}>Videos for You 🎬</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Watch these to learn how to use your products.</p>
            {videos.map((v, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <YouTubeEmbed url={v.url} title={v.title} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "12px 0 5px 0" }}>{v.title}</h3>
                <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}

            {/* Recipe Preview */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0" }}>Recipe Preview 🍲</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>3 recipes from our free Recipe Book.</p>
            {DEFAULT_RECIPES.map((r, i) => {
              const recipePhotos = ["/images/recipe-sinigang.jpg", "/images/recipe-tinola.jpg", "/images/recipe-lugaw.jpg"];
              return (
              <div key={i} style={{ background: WHITE, border: "1.5px solid #C5B99A", borderRadius: 18, marginBottom: 14, overflow: "hidden", boxShadow: "0 4px 14px rgba(27,32,26,0.07)" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: CREAM }}>
                  <Image
                    src={recipePhotos[i] ?? recipePhotos[0]}
                    alt={r.name}
                    fill
                    style={{ objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(24,59,40,0.85)", borderRadius: 8, padding: "4px 10px" }}>
                    <span style={{ fontSize: 12, color: GOLD, fontWeight: 900 }}>{r.benefit}</span>
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{r.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{r.name}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 15, color: MID, margin: 0, lineHeight: 1.6 }}><strong>Ingredients:</strong> {r.ingredients}</p>
                </div>
              </div>
              );
            })}
            <div style={{ background: G, borderRadius: 18, padding: "22px", textAlign: "center" as const }}>
              <p style={{ fontSize: 16, color: GOLD, fontWeight: 700, margin: "0 0 12px 0" }}>📖 27 more recipes in the full Recipe Book!</p>
              <Link href="/recipes" style={{ background: GOLD, color: G, borderRadius: 12, padding: "15px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
                📖 Open Full Recipe Book →
              </Link>
            </div>
          </div>
        )}

        {/* ═══ TIPS TAB ═════════════════════════════════════════ */}
        {tab === "tips" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 18px 0" }}>Tip of the Day 💡</h2>
            <div style={{ background: WHITE, borderLeft: `6px solid ${AMBER}`, borderRadius: 14, padding: "22px", marginBottom: 14 }}>
              <p style={{ fontSize: 18, color: DARK, margin: 0, lineHeight: 1.75 }}>🌿 {wellnessTips[tipIndex % wellnessTips.length]}</p>
            </div>
            <button
              onClick={() => setTipIndex(i => (i + 1) % wellnessTips.length)}
              className="c-btn c-btn-outline"
              style={{ width: "100%", marginBottom: 32 }}
            >
              Next Tip →
            </button>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Customer Stories 💬</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Real stories from people like you.</p>
            {testimonials.map((t, i) => {
              const isFemale = i !== 1;
              const photoSrc = isFemale ? "/images/testimonial-female.jpg" : "/images/testimonial-male.jpg";
              return (
                <div key={i} style={{ background: WHITE, border: `2px solid ${LIGHT_G}`, borderRadius: 20, padding: "20px", marginBottom: 14, boxShadow: "0 4px 16px rgba(27,32,26,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `3px solid ${G}`, flexShrink: 0, background: CREAM, position: "relative" }}>
                      <Image
                        src={photoSrc}
                        alt={t.name}
                        fill
                        style={{ objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 17, fontWeight: 900, color: DARK, margin: 0 }}>{t.name}{t.age > 0 ? `, ${t.age} taong gulang` : ""}</p>
                      <p style={{ fontSize: 13, color: MID, margin: "2px 0 0" }}>{t.location}</p>
                      <StarRating count={t.stars} />
                    </div>
                  </div>
                  <p style={{ fontSize: 17, color: DARK, margin: "0 0 14px", lineHeight: 1.75, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                  {t.painBefore > 0 && t.painAfter > 0 && (
                    <div style={{ background: "#F0F8F0", border: `1.5px solid ${LIGHT_G}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, color: MID }}>Pain Score:</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "#dc2626" }}>{t.painBefore}</span>
                      <span style={{ fontSize: 18 }}>→</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: G }}>{t.painAfter}</span>
                      <span style={{ fontSize: 14, color: G, fontWeight: 700 }}>✅ Malaking improvement!</span>
                    </div>
                  )}
                </div>
              );
            })}

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0" }}>Questions ❓</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 8px 0", lineHeight: 1.6 }}>Tap a question to see the answer.</p>
            <div style={{ background: WHITE, border: "1.5px solid #C5B99A", borderRadius: 18, padding: "8px 22px" }}>
              {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        )}

        {/* ═══ COACHES TAB ══════════════════════════════════════ */}
        {tab === "coaches" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Our Coaches 👥</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>Need help? We're here for you!</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {coaches.map((c, i) => (
                <div key={i} style={{ background: WHITE, border: "2px solid #C5B99A", borderRadius: 18, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <Image src={c.photo} alt={c.name} width={60} height={60} style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover", border: `2.5px solid ${G}`, flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: 0 }}>{c.name}</h3>
                      <p style={{ fontSize: 14, color: G, margin: "3px 0 0 0", fontWeight: 600 }}>R&M EaseBrew Wellness Coach</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={`tel:${c.number}`} className="c-btn c-btn-green" style={{ flex: 1, textDecoration: "none", gap: 6 }}>📞 {c.display}</a>
                    <a href={c.facebook} target="_blank" rel="noopener noreferrer" className="c-btn c-btn-fb" style={{ flex: 1, textDecoration: "none" }}>📘 Facebook</a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, background: "#FEF9E7", borderRadius: 16, padding: "18px 20px", border: `2px solid ${GOLD}`, textAlign: "center" as const }}>
              <p style={{ fontSize: 17, color: AMBER, fontWeight: 700, margin: "0 0 6px 0" }}>💬 Don't hesitate!</p>
              <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}>We're always here for you. Your health is our priority. ❤️</p>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: `3px solid ${G}`, textAlign: "center" as const }}>
              <div style={{ display: "inline-block", background: G, color: GOLD, borderRadius: 14, padding: "10px 22px", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>R&M EaseBrew</div>
              <p style={{ fontSize: 13, color: G, fontWeight: 700, margin: "0 0 5px 0", letterSpacing: 1, textTransform: "uppercase" as const }}>Everyday We Care</p>
              <p style={{ fontSize: 15, color: MID, margin: "0 0 20px 0", lineHeight: 1.65 }}>Natural relief for body pain and inflammation.</p>
              <button onClick={() => setShowCoachModal(true)} className="c-btn c-btn-gold" style={{ width: "100%" }}>
                🛒 Order Again
              </button>
              <p style={{ fontSize: 13, color: MID, marginTop: 24, lineHeight: 1.7 }}>
                COD | Free Shipping | Nationwide Delivery<br />
                © 2025 EaseBrew Herbal Coffee. All rights reserved.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Floating coach button */}
      <button
        onClick={() => setShowCoachModal(true)}
        aria-label="Call Coach"
        style={{
          position: "fixed", bottom: 88, right: 14,
          width: 62, height: 62, borderRadius: "50%",
          background: "#39613B", border: "3px solid #FED255",
          boxShadow: "0 4px 20px rgba(57,97,59,0.5)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 500, gap: 1,
        }}
      >
        <Phone size={20} color="#FED255" strokeWidth={2.5} />
        <span style={{ fontSize: 9, color: "#FED255", fontWeight: 700, letterSpacing: 0.5 }}>COACH</span>
      </button>
    </div>
  );
}
