"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { G, GOLD, AMBER, CREAM, WHITE, DARK, MID, LIGHT_G } from "@/lib/colors";
import { DEFAULT_PRODUCTS, applyContentOverrides, splitByTier, type Product } from "@/lib/products";
import { EXERCISE_PROGRAM } from "@/lib/exerciseProgram";
import { PRICE_CONFIG } from "@/lib/price-config";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { localDateStr, localDateStrOffset } from "@/lib/localDate";

// 1.2 — Imported from single source of truth (no more duplicate definitions)
import { Coach, DEFAULT_COACHES, buildCoaches } from "@/lib/coaches";
import { Gift, Home as HomeIcon, Lightbulb, Phone, Users, HeartPulse, UtensilsCrossed, Dumbbell, Crown, Activity, Pill, IdCard, Coffee, Footprints, Droplets, Moon, Sun, Sparkles, Trophy, BookOpen, Leaf, MessageCircle, HelpCircle, Heart, ShoppingCart, ClipboardList, Bell, Smartphone, BarChart3, Video, CookingPot, CircleCheck, Lock, Info, Package, Calendar, Target, AlertTriangle, Megaphone, AlertCircle, Timer, X, Fish, Globe, Share2, Plus, Star, Copy, Wheat } from "lucide-react";

// ============================================================
// CONFIG — FALLBACK DEFAULTS (used when no value in DB)
// ============================================================
const DEFAULT_VIDEOS = [
  { title: "Paano Ihanda ang EaseBrew",                desc: "Tamang paraan para maghanda ng EaseBrew araw-araw.", url: "" },
  { title: "Simpleng Ehersisyo para sa Seniors",       desc: "Magaan na exercises na kayang gawin sa bahay.",  url: "" },
];

const DEFAULT_WELLNESS_TIPS = [
  "Inumin ang EaseBrew 30 mins bago kumain — bahagi ng daily routine mo.",
  "Uminom ng 8 baso ng tubig araw-araw — mahalaga sa katawan.",
  "Maglakad ng 15 mins pagkatapos kumain para sa mabuting digestion.",
  "Kumain ng isda (salmon o bangus) 3x sa isang linggo — mayaman sa omega-3.",
  "Ang turmeric at luya ay traditional na Pinoy ingredients sa lugaw at soup.",
  "Matulog ng 7-8 oras araw-araw — mahalaga sa recovery ng katawan.",
  "Ang malunggay ay tradisyonal na superfood — idagdag sa sinigang, tinola, o lugaw.",
];

const DEFAULT_RECIPES = [
  { name: "Sinigang na Salmon",            benefit: "Omega-3, Vitamin C",           ingredients: "Salmon, kamatis, kangkong, labanos, sampalok", iconId: "fish" },
  { name: "Tinolang Manok with Malunggay", benefit: "Vitamin A, Iron, Protein",     ingredients: "Manok, malunggay, sayote, luya, bawang",        iconId: "chicken" },
  { name: "Ginger-Turmeric Lugaw",         benefit: "Warming Pinoy Comfort Food",   ingredients: "Bigas, luya, turmeric, bawang, sibuyas",         iconId: "rice" },
];

const RECIPE_ICONS: Record<string, { icon: typeof Fish; bg: string }> = {
  fish:    { icon: Fish,              bg: "#2980B9" },
  chicken: { icon: UtensilsCrossed,   bg: "#E67E22" },
  rice:    { icon: Wheat,             bg: "#8B6914" },
};

const DEFAULT_FAQS = [
  { q: "Kailan ko dapat inumin ang EaseBrew?",             a: "Umaga at gabi — 2 sachets bawat araw. Inumin 30 mins bago kumain bilang bahagi ng daily routine mo." },
  { q: "May maintenance medicine ako — pwede pa rin ba?",  a: "Kumonsulta muna sa doktor mo bago mag-umpisa. Ipakita mo sa kanya ang EaseBrew para masuri kung compatible sa gamot mo." },
  { q: "Kailan pa lamang ako makakaramdam ng pagbabago?",  a: "Iba-iba ang karanasan ng bawat isa. Ituloy lang ang daily routine at i-track ang progress mo sa daily tracker sa app na ito." },
  { q: "Ilang sachets bawat araw?",                        a: "2 sachets bawat araw — isa sa umaga, isa sa gabi. Sundin lang ang instructions sa packaging." },
  { q: "Paano ko ma-access ang mga libreng digital products?", a: "I-tap ang button sa bawat product card. Lahat ng products na kasama sa order mo ay automatic na ma-access!" },
  { q: "May allergy ako sa ilang herbs — safe ba ito?",    a: "Palaging basahin muna ang ingredients list sa packaging. Kung may kilalang allergy ka, kumonsulta sa doktor bago inumin." },
];

const DEFAULT_TESTIMONIALS = [
  { name: "Nena R.",   age: 58, location: "Quezon City", quote: "Bahagi na ng aking daily routine ang EaseBrew — kasama sa umaga at gabi ko.", stars: 5, painBefore: 8, painAfter: 3 },
  { name: "Mang Tony", age: 64, location: "Cebu City",   quote: "Sinubukan ko at naging habit ko na. Kasama ko lagi ang EaseBrew araw-araw.", stars: 5, painBefore: 7, painAfter: 2 },
  { name: "Ate Susan", age: 52, location: "Davao",       quote: "Yung libreng meal plan at recipe book — super helpful sa pagpapalinis ng diet ko.", stars: 5, painBefore: 6, painAfter: 3 },
];

const REMINDERS = [
  { time: "Umaga",      Icon: Coffee,      iconBg: "#39613B", text: "Inumin ang EaseBrew — 1st sachet mo",       bg: "#E8F5E0", border: "#39613B", textColor: "#39613B" },
  { time: "Tanghali",   Icon: Footprints,  iconBg: "#C0863B", text: "Maglakad ng 15 mins pagkatapos kumain",  bg: "#FEF9E7", border: "#C0863B", textColor: "#C0863B" },
  { time: "Hapon",      Icon: Droplets,    iconBg: "#2980B9", text: "Uminom ng 8 baso ng tubig ngayon",       bg: "#FFFBF0", border: "#FED255", textColor: "#8B6914" },
  { time: "Gabi",       Icon: Moon,        iconBg: "#7DAE2F", text: "Inumin ang EaseBrew — 2nd sachet mo",     bg: "#F4F8F0", border: "#7DAE2F", textColor: "#39613B" },
];

const PROGRESS_GUIDE = [
  { period: "Linggo 1–2", title: "Simula",                    desc: "Kasama mo ang EaseBrew sa umaga at gabi. I-set up ang daily routine mo — tracker, meal plan, exercise.",      bg: "#E8F5E0", border: "#39613B", color: "#39613B" },
  { period: "Linggo 3–4", title: "Consistent na Habit",       desc: "Nagiging bahagi na ng araw-araw ang wellness journey mo. I-track ang progress mo sa daily tracker.",           bg: "#FEF9E7", border: "#C0863B", color: "#C0863B" },
  { period: "Buwan 2",    title: "Tuloy-tuloy na Progress",   desc: "Natural na habit na ang daily routine mo. I-review ang lingguhang wellness report para sa insights.",         bg: "#FFFBF0", border: "#FED255", color: "#8B6914" },
  { period: "Buwan 3",    title: "Bagong Ikaw, Bagong Buhay", desc: "Kumpleto na ang 90 araw. I-review ang trend ng pain score at BP. Ipagpatuloy ang malusog na pamumuhay.",       bg: "#F4F8F0", border: "#7DAE2F", color: "#39613B" },
];

const PRODUCT_ICONS: Record<number, { icon: typeof HeartPulse; bg: string }> = {
  1: { icon: HeartPulse,       bg: "#E74C3C" },
  2: { icon: UtensilsCrossed,  bg: "#27AE60" },
  3: { icon: Dumbbell,         bg: "#2980B9" },
  4: { icon: Crown,            bg: "#F39C12" },
};

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "Magandang Umaga!";
  if (h >= 11 && h < 13) return "Magandang Tanghali!";
  if (h >= 13 && h < 18) return "Magandang Hapon!";
  return "Magandang Gabi!";
}

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
  // Three severity levels for more advance notice:
  //  * 8–14 days -> subtle heads-up (dark green, no red)
  //  * 4–7 days  -> medium urgency (amber)
  //  * 1–3 days  -> urgent (red)
  const tier = daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "medium" : "heads-up";
  const bg = tier === "urgent" ? "#7f1d1d" : tier === "medium" ? "#78350f" : "#183b28";
  const border = tier === "urgent" ? "#ef4444" : tier === "medium" ? "#f59e0b" : "#FED255";
  const titleColor = tier === "urgent" ? "#fca5a5" : "#FED255";
  const btnBg = tier === "urgent" ? "#ef4444" : tier === "medium" ? "#f59e0b" : "#FED255";
  const btnFg = tier === "heads-up" ? "#183b28" : "white";
  const Icon = tier === "urgent" ? AlertCircle : Timer;
  const iconColor = tier === "urgent" ? "#fca5a5" : tier === "medium" ? "#f59e0b" : "#FED255";
  const title = daysLeft === 0
    ? "Ngayong araw na mag-e-expire!"
    : tier === "urgent"
    ? `${daysLeft} araw na lang!`
    : tier === "medium"
    ? `Mag-e-expire sa ${daysLeft} araw!`
    : `${daysLeft} araw pa bago mag-expire`;
  const subtitle = tier === "heads-up"
    ? "Mag-order na para hindi maputol ang wellness journey mo."
    : "Mag-order na para tuloy-tuloy ang wellness journey mo.";
  return (
    <div style={{ background: bg, borderBottom: `3px solid ${border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ flexShrink: 0 }}><Icon size={22} color={iconColor} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: titleColor, margin: "0 0 2px" }}>{title}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>{subtitle}</p>
      </div>
      <button onClick={onReorder} style={{ background: btnBg, color: btnFg, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
        <ShoppingCart size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Order
      </button>
      <button onClick={onDismiss} aria-label="Close" style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 999, width: 28, height: 28, fontSize: 14, cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={14} /></button>
    </div>
  );
}

// ============================================================
// NOTIFICATION BANNER (admin-sent announcements)
// ============================================================
function NotificationBanner({ title, message, onDismiss }: { title: string; message: string; onDismiss: () => void }) {
  return (
    <div style={{ background: "#1B201A", borderBottom: `3px solid ${G}`, padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}><Megaphone size={22} color="#FED255" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#FED255", margin: "0 0 2px" }}>{title}</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>{message}</p>
      </div>
      <button onClick={onDismiss} aria-label="Close" style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={16} /></button>
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
      <button onClick={onDismiss} aria-label="Close promo" style={{ background: "rgba(0,0,0,0.12)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", color: DARK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={18} /></button>
    </div>
  );
}

// ============================================================
// COACH PICKER MODAL
// ============================================================
function CoachModal({ coaches, onClose, reorderMessage, modalTitle, subtitleReorder, subtitleDefault }: { coaches: Coach[]; onClose: () => void; reorderMessage?: string; modalTitle: string; subtitleReorder: string; subtitleDefault: string }) {
  const [msgCopied, setMsgCopied] = useState(false);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto", padding: "0 0 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div style={{ width: 48, height: 5, borderRadius: 999, background: "#D9D0C0" }} />
        </div>
        {reorderMessage && (
          <div style={{ margin: "0 20px 4px", background: "#E8F5E0", border: "2px solid #39613B", borderRadius: 16, padding: "16px 18px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#39613B", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}><ClipboardList size={14} /> I-copy ang mensahe, tapos i-send sa coach:</p>
            <p style={{ fontSize: 14, color: "#1B201A", margin: "0 0 12px", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{reorderMessage}</p>
            <button
              onClick={() => navigator.clipboard.writeText(reorderMessage).then(() => { setMsgCopied(true); setTimeout(() => setMsgCopied(false), 3000); })}
              style={{ background: msgCopied ? "#39613B" : "white", color: msgCopied ? "white" : "#39613B", border: "2px solid #39613B", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }}
            >
              {msgCopied ? <><CircleCheck size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Na-copy na!</> : <><Copy size={16} style={{ display: "inline", verticalAlign: "middle" }} /> I-copy ang Mensahe</>}
            </button>
          </div>
        )}
        <div style={{ padding: "12px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}><Users size={22} /> {modalTitle}</h2>
              <p style={{ fontSize: 15, color: MID, margin: 0 }}>{reorderMessage ? subtitleReorder : subtitleDefault}</p>
            </div>
            <button onClick={onClose} style={{ background: "#F0EDE6", border: "none", borderRadius: 999, width: 40, height: 40, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={20} /></button>
          </div>
        </div>
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {coaches.map((c, i) => (
            <div key={i} style={{ background: "#FAFAF5", border: "2px solid #D9D0C0", borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Image src={c.photo} alt={c.name} width={52} height={52} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", border: `2px solid ${G}`, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 13, color: G, margin: "2px 0 0 0", fontWeight: 600 }}>EaseBrew Wellness Guide</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={`tel:${c.number}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: G, color: "#fff", borderRadius: 14, padding: "16px 8px", fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center" as const }}><Phone size={16} /> Tumawag</a>
                <a href={c.facebook} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1877F2", color: "#fff", borderRadius: 14, padding: "16px 8px", fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center" as const }}><BookOpen size={16} /> Facebook</a>
              </div>
              <p style={{ fontSize: 14, color: MID, margin: "10px 0 0 0", textAlign: "center" as const, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Smartphone size={14} /> {c.display}</p>
            </div>
          ))}
        </div>
        <div style={{ margin: "20px 20px 0", background: "#FEF9E7", borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${GOLD}`, textAlign: "center" as const }}>
          <p style={{ fontSize: 15, color: AMBER, fontWeight: 700, margin: "0 0 4px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><MessageCircle size={16} /> Huwag mag-atubili!</p>
          <p style={{ fontSize: 14, color: MID, margin: 0, lineHeight: 1.6 }}>Lagi kaming nandito para sa iyo. I-tap ang <Phone size={13} style={{ display: "inline", verticalAlign: "middle" }} /> para tumawag!</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================
function StarRating({ count }: { count: number }) {
  return <div style={{ display: "flex", gap: 2 }}>{[...Array(count)].map((_, i) => <Star key={i} size={18} color={GOLD} fill={GOLD} />)}</div>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #D9D0C0", padding: "20px 0" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, width: "100%", background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif" }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, color: DARK, margin: 0, lineHeight: 1.4 }}>{q}</p>
        <span style={{ fontSize: 26, color: G, flexShrink: 0 }} aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
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
        <p style={{ fontSize: 13, opacity: 0.55, margin: 0 }}>Malapit nang idagdag ang video na ito.</p>
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
// TODAY'S SUMMARY (at-a-glance daily checklist)
// ============================================================
type TodayTaskStatus = { key: string; label: string; done: boolean; href: string; Icon: typeof CircleCheck };

function TodaysSummaryCard({ sessionCode }: { sessionCode: string }) {
  const [tasks, setTasks] = useState<TodayTaskStatus[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = localDateStr();

    // EaseBrew Umaga + Gabi from tracker
    const trackerKey = progressStorageKey("easebrew-tracker-v2", sessionCode);
    const trackerEntries = readProgressCache<QuickEntry[]>(trackerKey, []);
    const trackerToday = trackerEntries.find(e => e.date === today);
    const umagaDone = !!trackerToday?.easebrewUmaga;
    const gabiDone = !!trackerToday?.easebrewGabi;

    // BP from bp storage
    const bpKey = progressStorageKey("easebrew-bp-v1", sessionCode);
    const bpEntries = readProgressCache<{ date: string }[]>(bpKey, []);
    const bpDone = bpEntries.some(e => e.date === today);

    // Gamot from medication storage
    const medKey = progressStorageKey("easebrew-medication-v1", sessionCode);
    const medData = readProgressCache<{ medications: { active: boolean }[]; logs: { date: string; taken: string[] }[] }>(medKey, { medications: [], logs: [] });
    const hasMeds = medData.medications.some(m => m.active);
    const medLog = medData.logs.find(l => l.date === today);
    const medDone = !hasMeds || (medLog?.taken?.length ?? 0) > 0;

    setTasks([
      { key: "umaga", label: "Umagang EaseBrew", done: umagaDone, href: "/tracker", Icon: Sun },
      { key: "gabi",  label: "Gabing EaseBrew",  done: gabiDone,  href: "/tracker", Icon: Moon },
      { key: "bp",    label: "BP Log",           done: bpDone,    href: "/blood-pressure", Icon: HeartPulse },
      ...(hasMeds ? [{ key: "gamot", label: "Gamot", done: medDone, href: "/medication", Icon: Pill }] : []),
    ]);
  }, [sessionCode]);

  if (tasks.length === 0) return null;
  const doneCount = tasks.filter(t => t.done).length;
  const allDone = doneCount === tasks.length;

  return (
    <div style={{ background: allDone ? "#E8F5E0" : WHITE, border: `2px solid ${allDone ? G : "#D9D0C0"}`, borderRadius: 20, padding: 18, marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: allDone ? G : MID, margin: 0 }}>
          {allDone ? "✓ Tapos na lahat ngayon!" : `Ngayong araw • ${doneCount}/${tasks.length} tapos`}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        {tasks.map(t => (
          <Link key={t.key} href={t.href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: t.done ? "rgba(57,97,59,0.08)" : "#f9f7f2", borderRadius: 12, border: `1.5px solid ${t.done ? "rgba(57,97,59,0.25)" : "#e5e2d7"}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.done ? G : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: t.done ? "none" : "1.5px solid #d9d0c0" }}>
              {t.done ? <CircleCheck size={20} color="#fff" /> : <t.Icon size={20} color={G} />}
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: t.done ? G : DARK, margin: 0, textDecoration: t.done ? "line-through" : "none", flex: 1 }}>{t.label}</p>
            {!t.done && <span style={{ fontSize: 14, color: G, fontWeight: 700 }}>Buksan →</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TESTIMONIAL SUBMISSION CARD — customer shares their story
// ============================================================
function TestimonialSubmissionCard() {
  const [expanded, setExpanded] = useState(false);
  const [quote, setQuote] = useState("");
  const [painBefore, setPainBefore] = useState("");
  const [painAfter, setPainAfter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (quote.trim().length < 20) { setError("Kailangan ng at least 20 characters."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "testimonial_submission",
          data: {
            quote: quote.trim(),
            painBefore: painBefore ? Number(painBefore) : null,
            painAfter: painAfter ? Number(painAfter) : null,
            submitted_at: new Date().toISOString(),
          },
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) { setError(d.error || "Failed to submit."); return; }
      setSubmitted(true);
    } catch { setError("Network error."); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div style={{ background: "#dcfce7", border: `2px solid ${G}`, borderRadius: 20, padding: 18, marginBottom: 20, textAlign: "center" }}>
        <CircleCheck size={40} color={G} style={{ margin: "0 auto 8px" }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#166534", margin: "0 0 4px" }}>Salamat sa kwento mo!</p>
        <p style={{ fontSize: 14, color: "#166534", margin: 0 }}>I-review namin at maaaring mai-share sa hub para makapag-inspire ng iba.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fdf4ff", border: `2px solid #a855f7`, borderRadius: 20, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <MessageCircle size={20} color="#7c3aed" />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#581c87", margin: 0 }}>Ikaw ba may kwento?</p>
      </div>
      <p style={{ fontSize: 14, color: "#6b21a8", margin: "0 0 12px", lineHeight: 1.5 }}>
        I-share ang wellness journey mo — makakatulong ito sa ibang senior na mag-decide.
      </p>
      {!expanded ? (
        <button onClick={() => setExpanded(true)} style={{ width: "100%", background: "#a855f7", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
          Ibahagi ang kwento ko
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            placeholder="Halimbawa: Bago ako uminom ng EaseBrew, matindi ang pananakit ng tuhod ko. Ngayon..."
            rows={4}
            style={{ width: "100%", border: "2px solid #d8b4fe", borderRadius: 12, padding: 12, fontSize: 15, fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }}
            maxLength={500}
          />
          <p style={{ fontSize: 11, color: "#7c3aed", margin: 0 }}>{quote.length}/500</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 16, color: "#6b21a8", fontWeight: 700, display: "block", marginBottom: 6 }}>Sakit noon (1–10)</label>
              <input type="number" min={1} max={10} value={painBefore} onChange={e => setPainBefore(e.target.value)} style={{ width: "100%", border: "1.5px solid #d8b4fe", borderRadius: 10, padding: 12, fontSize: 16, fontFamily: "Georgia, serif", boxSizing: "border-box", minHeight: 48 }} />
            </div>
            <div>
              <label style={{ fontSize: 16, color: "#6b21a8", fontWeight: 700, display: "block", marginBottom: 6 }}>Sakit ngayon (1–10)</label>
              <input type="number" min={1} max={10} value={painAfter} onChange={e => setPainAfter(e.target.value)} style={{ width: "100%", border: "1.5px solid #d8b4fe", borderRadius: 10, padding: 12, fontSize: 16, fontFamily: "Georgia, serif", boxSizing: "border-box", minHeight: 48 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submit} disabled={submitting} style={{ flex: 1, background: "#a855f7", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
              {submitting ? "Sini-save..." : "I-submit"}
            </button>
            <button onClick={() => setExpanded(false)} style={{ background: "transparent", color: "#7c3aed", border: "2px solid #a855f7", borderRadius: 12, padding: "12px 16px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
              Kansel
            </button>
          </div>
          {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// REFERRAL CARD — invite a friend to try EaseBrew
// ============================================================
function ReferralCard({ coaches }: { coaches: Coach[] }) {
  const [copied, setCopied] = useState(false);
  const primaryCoach = coaches[0];

  function buildReferralMessage() {
    const coachInfo = primaryCoach
      ? `\n\nContact po ninyo ang aking coach:\n${primaryCoach.name}\n${primaryCoach.display || primaryCoach.number}`
      : "";
    return `Hi po! Gusto kong ibahagi sayo ang EaseBrew Wellness Hub — may daily wellness tracking, meal plan, ehersisyo, at coach guidance na kasama.\n\nSubukan mo — magaan lang gamitin at para sa mga senior tayo.${coachInfo}\n\nEaseBrew — wellness routine para sa Pinoy seniors.`;
  }

  function copyReferral() {
    navigator.clipboard.writeText(buildReferralMessage()).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareNative() {
    if (typeof navigator === "undefined" || !("share" in navigator)) return;
    (navigator as unknown as { share: (data: { title: string; text: string }) => Promise<void> })
      .share({ title: "EaseBrew — Wellness for Seniors", text: buildReferralMessage() })
      .catch(() => {});
  }

  return (
    <div style={{ background: "#fef3c7", border: `2px solid ${AMBER}`, borderRadius: 20, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Sparkles size={20} color={AMBER} />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#78350f", margin: 0 }}>Ipakilala sa Kaibigan</p>
      </div>
      <p style={{ fontSize: 14, color: "#78350f", margin: "0 0 12px", lineHeight: 1.5 }}>
        May kaibigan ka bang may pananakit ng katawan? Ipakilala mo ang EaseBrew sa kanila.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={copyReferral} style={{ background: AMBER, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
          {copied ? "Na-copy na ✓" : "I-copy ang mensahe"}
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button onClick={shareNative} style={{ background: G, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
            I-share sa Messenger o iba pang app
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FAMILY SHARE CARD — generate read-only weekly report link
// ============================================================
function FamilyShareCard() {
  const [generating, setGenerating] = useState(false);
  const [link, setLink] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generateLink() {
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/family/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || "Failed."); return; }
      const url = `${window.location.origin}/family/${data.token}`;
      setLink(url);
      // Server returns the effective expiry (min of 7-day token TTL and
      // the customer's pack expiry) so the displayed date matches when
      // the link actually stops working.
      if (typeof data.expiresAt === "string") {
        setExpiresAt(new Date(data.expiresAt));
      } else {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 7);
        setExpiresAt(fallback);
      }
    } catch { setError("Network error."); }
    finally { setGenerating(false); }
  }

  function copyLink() {
    if (!link) return;
    const msg = `Kumusta! Ito ang wellness update ko sa EaseBrew, para makita mo ang progress ko:\n\n${link}\n\n(7 araw na valid ang link)`;
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareNative() {
    if (!link || typeof navigator === "undefined" || !("share" in navigator)) return;
    (navigator as unknown as { share: (data: { title: string; text: string; url: string }) => Promise<void> })
      .share({ title: "EaseBrew Wellness Update", text: "Tingnan ang wellness progress ko sa EaseBrew:", url: link })
      .catch(() => {});
  }

  return (
    <div style={{ background: "#f0f9ff", border: `2px solid #0ea5e9`, borderRadius: 20, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Share2 size={20} color="#0369a1" />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0c4a6e", margin: 0 }}>Ipakita sa Pamilya</p>
      </div>
      <p style={{ fontSize: 14, color: "#164e63", margin: "0 0 12px", lineHeight: 1.5 }}>
        Gumawa ng link para sa anak o asawa mo — makikita lang nila ang lingguhang wellness progress mo, hindi maba-baguhan.
      </p>
      {!link ? (
        <button onClick={generateLink} disabled={generating} style={{ width: "100%", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", minHeight: 52, fontFamily: "Georgia, serif" }}>
          {generating ? "Ginagawa..." : "Gumawa ng Family Link"}
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#fff", border: "1.5px solid #7dd3fc", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#0c4a6e", wordBreak: "break-all", fontFamily: "monospace" }}>
            {link}
          </div>
          {expiresAt && (
            <p style={{ fontSize: 12, color: "#0c4a6e", margin: 0, fontWeight: 600 }}>
              Valid hanggang {expiresAt.toLocaleDateString("fil-PH", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
          <button onClick={copyLink} style={{ background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
            {copied ? "Na-copy na ✓" : "I-copy ang mensahe"}
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={shareNative} style={{ background: G, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 48, fontFamily: "Georgia, serif" }}>
              I-share sa Messenger o iba pang app
            </button>
          )}
          <button onClick={generateLink} disabled={generating} style={{ background: "transparent", color: "#0369a1", border: "none", padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif", textDecoration: "underline" }}>
            {generating ? "Ginagawa..." : "Gumawa ng bagong link"}
          </button>
        </div>
      )}
      {error && <p style={{ fontSize: 13, color: "#dc2626", margin: "8px 0 0" }}>{error}</p>}
    </div>
  );
}

// ============================================================
// QUICK CHECK-IN (1-tap log from home page)
// ============================================================
type QuickEntry = { date: string; painScore: number; painLocation: string; easebrewUmaga: boolean; easebrewGabi: boolean; mood: number; notes: string };

function QuickCheckIn({ storageKey }: { storageKey: string }) {
  const today = localDateStr();
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
  const btn = (period: "umaga" | "gabi", icon: React.ReactNode, label: string, done: boolean) => (
    <button
      onClick={() => !done && logIntake(period)}
      style={{ flex: 1, background: done ? G : "white", color: done ? "white" : DARK, border: `2.5px solid ${done ? G : "#D9D0C0"}`, borderRadius: 20, padding: "22px 10px", cursor: done ? "default" : "pointer", transition: "all 0.2s", textAlign: "center" as const }}
    >
      <div style={{ marginBottom: 6 }}>{done ? <CircleCheck size={36} /> : icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, opacity: 0.7, marginTop: 3 }}>{done ? "Tapos na!" : "I-tap para i-log"}</div>
    </button>
  );

  return (
    <div style={{ background: both ? "#E8F5E0" : "white", border: `2px solid ${both ? G : "#D9D0C0"}`, borderRadius: 22, padding: "18px", marginBottom: 24 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: both ? G : MID, margin: "0 0 12px", textAlign: "center" as const }}>
        {both ? "Tapos na ngayon!" : "Nainom mo na ba ng EaseBrew ngayon?"}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        {btn("umaga", <Sun size={36} color="#C0863B" />, "Umaga", umaga)}
        {btn("gabi",  <Moon size={36} color="#2980B9" />, "Gabi",  gabi)}
      </div>
    </div>
  );
}

// ============================================================
// NEXT EXERCISE PREVIEW — small "Bukas: Day X — [title]" card so
// the customer can see what's ahead without opening the exercise
// tool, and tap it if they want to start now.
// ============================================================
function NextExercisePreview({ tier }: { tier: number }) {
  const [nextDay, setNextDay] = useState<{ day: number; title: string } | null>(null);
  useEffect(() => {
    if (tier < 2998) return;
    let mounted = true;
    fetch("/api/progress?type=exercise").then(r => r.json()).then(res => {
      if (!mounted) return;
      const completed: number[] = Array.isArray(res?.data?.days) ? res.data.days : [];
      const done = new Set(completed);
      const allDays = EXERCISE_PROGRAM.flatMap(p => p.days);
      const next = allDays.find(d => !done.has(d.day));
      if (next) setNextDay({ day: next.day, title: next.title });
    }).catch(() => {});
    return () => { mounted = false; };
  }, [tier]);
  if (!nextDay) return null;
  return (
    <Link href="/exercise" style={{
      display: "block", background: "#F3F8EE", border: "2px solid #C5D9AF",
      borderRadius: 18, padding: "14px 18px", marginBottom: 24, textDecoration: "none",
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: G, margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
        <Dumbbell size={14} /> Kasunod sa exercise mo
      </p>
      <p style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 2px" }}>Araw {nextDay.day} — {nextDay.title}</p>
      <p style={{ fontSize: 13, color: G, margin: 0, fontWeight: 600 }}>I-tap para simulan →</p>
    </Link>
  );
}

// ============================================================
// UNUSED FEATURE NUDGE — remind about paid features they haven't
// opened in 7+ days so they get value from what they already own.
// ============================================================
function UnusedFeatureNudge({ unlockedProducts, onDismiss }: { unlockedProducts: Product[]; onDismiss: () => void }) {
  const [suggestion, setSuggestion] = useState<Product | null>(null);
  useEffect(() => {
    const typeMap: Record<string, string> = {
      "/meal-plan": "mealplan",
      "/exercise": "exercise",
      "/recipes": "recipe_favorites",
      "/bagong-katawan": "bagong_katawan",
    };
    async function check() {
      for (const p of unlockedProducts) {
        const t = typeMap[p.appUrl];
        if (!t) continue;
        try {
          const r = await fetch(`/api/progress?type=${t}`).then(r => r.json());
          const updatedAt = r?.updated_at;
          const stale = !updatedAt || (Date.now() - new Date(updatedAt).getTime()) > 7 * 86400_000;
          if (stale) { setSuggestion(p); return; }
        } catch { /* ignore */ }
      }
    }
    if (unlockedProducts.length > 0) check();
  }, [unlockedProducts]);
  if (!suggestion) return null;
  return (
    <div style={{ background: "#E8F5E0", border: "2px solid #39613B", borderRadius: 18, padding: "16px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 28, flexShrink: 0 }} aria-hidden="true">🎁</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1B201A", margin: "0 0 3px" }}>May regalo ka na hindi pa nabu-buksan!</p>
        <p style={{ fontSize: 14, color: "#4E504F", margin: 0, lineHeight: 1.5 }}>Subukan mo yung <strong>{suggestion.name}</strong> — kasama na sa order mo.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <Link href={suggestion.appUrl} style={{ background: "#39613B", color: "white", textDecoration: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, textAlign: "center" as const }}>
          Buksan
        </Link>
        <button onClick={onDismiss} style={{ background: "transparent", border: "none", fontSize: 11, color: "#9E9E9E", cursor: "pointer" }}>Mamaya</button>
      </div>
    </div>
  );
}

// ============================================================
// MOOD QUICK-TAP — one-tap emoji check-in on home
// Seniors don't need to navigate to the tracker for a mood log:
// a single tap here writes it to the same tracker entry for today.
// ============================================================
function MoodQuickTap({ storageKey }: { storageKey: string }) {
  const today = localDateStr();
  const [mood, setMood] = useState(0);
  const [justTapped, setJustTapped] = useState(false);

  useEffect(() => {
    const entries = readProgressCache<QuickEntry[]>(storageKey, []);
    const t = entries.find(e => e.date === today);
    if (t?.mood) setMood(t.mood);
  }, [storageKey, today]);

  function logMood(value: number) {
    const entries = readProgressCache<QuickEntry[]>(storageKey, []);
    const idx = entries.findIndex(e => e.date === today);
    const base: QuickEntry = idx >= 0 ? entries[idx] : { date: today, painScore: 0, painLocation: "", easebrewUmaga: false, easebrewGabi: false, mood: 0, notes: "" };
    const updated = { ...base, mood: value };
    const next = idx >= 0 ? entries.map((e, i) => i === idx ? updated : e) : [...entries, updated];
    writeProgressCache(storageKey, next);
    fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "tracker", data: { entries: next } }) }).catch(() => {});
    setMood(value);
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 1600);
    playChime("check");
  }

  const options: { emoji: string; label: string; value: number }[] = [
    { emoji: "😢", label: "Masama", value: 2 },
    { emoji: "😔", label: "Hindi masyado", value: 4 },
    { emoji: "😐", label: "Ok lang", value: 6 },
    { emoji: "🙂", label: "Maayos", value: 8 },
    { emoji: "😄", label: "Maganda", value: 10 },
  ];

  return (
    <div style={{ background: "white", border: "2px solid #D9D0C0", borderRadius: 22, padding: "18px", marginBottom: 24 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: MID, margin: "0 0 12px", textAlign: "center" as const }}>
        {justTapped ? "Salamat sa pag-log!" : mood > 0 ? "Kamusta pa ngayon?" : "Kamusta ka ngayon?"}
      </p>
      <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
        {options.map(o => {
          const active = mood === o.value;
          return (
            <button
              key={o.value}
              onClick={() => logMood(o.value)}
              aria-label={o.label}
              style={{
                flex: 1, background: active ? "#FFF7DB" : "transparent",
                border: `2.5px solid ${active ? "#FED255" : "transparent"}`,
                borderRadius: 16, padding: "10px 4px", cursor: "pointer",
                fontSize: 32, lineHeight: 1, transition: "all 0.15s",
                display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4,
              }}
            >
              <span aria-hidden="true">{o.emoji}</span>
              <span style={{ fontSize: 10, color: MID, fontWeight: 600 }}>{o.label}</span>
            </button>
          );
        })}
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

    if (isIOS && isSafari) { setTimeout(() => setShowIOS(true), 20000); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowAndroid(true), 20000);
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
        <span style={{ flexShrink: 0 }}><Smartphone size={40} color="#fff" /></span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>I-install ang R&M EaseBrew App!</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>I-save sa phone mo — madaling i-access anytime!</p>
        </div>
        <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "4px", flexShrink: 0 }}><X size={24} /></button>
      </div>
      <button onClick={handleAndroidInstall} style={{ marginTop: 14, width: "100%", background: GOLD, color: G, border: "none", borderRadius: 14, padding: "16px", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CircleCheck size={20} /> Yes! I-install sa Aking Phone →</button>
    </div>
  );

  if (showIOS) return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, zIndex: 9998, background: WHITE, padding: "24px 24px 32px", boxShadow: "0 -4px 24px rgba(0,0,0,0.2)", borderTop: `4px solid ${GOLD}`, borderRadius: "20px 20px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span><Smartphone size={32} color={DARK} /></span>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>I-save sa iPhone mo!</p>
            <p style={{ fontSize: 13, color: MID, margin: 0 }}>Para madaling ma-access anytime</p>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: "#f0f0f0", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {[
          { step: "1", icon: <Globe size={20} color={G} />, label: "Buksan sa", highlight: "Safari" },
          { step: "2", icon: <Share2 size={20} color={G} />, label: "I-tap ang", highlight: "Share button sa baba" },
          { step: "3", icon: <Plus size={20} color={G} />, label: "Piliin ang", highlight: '"Add to Home Screen"' },
          { step: "4", icon: <CircleCheck size={20} color={G} />, label: "I-tap ang", highlight: '"Add" — tapos na!' },
        ].map((s, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F4FAF0", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #C5D9BC" }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: G, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
            <span style={{ flexShrink: 0 }}>{s.icon}</span>
            <p style={{ fontSize: 15, margin: 0, color: DARK, lineHeight: 1.4 }}>{s.label} <strong style={{ color: G }}>{s.highlight}</strong></p>
          </div>
        ))}
      </div>
      <div style={{ background: "#FEF9E7", borderRadius: 10, padding: "10px 14px", border: `1px solid ${GOLD}` }}>
        <p style={{ fontSize: 13, color: AMBER, margin: 0, textAlign: "center", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><AlertTriangle size={14} /> Gamitin ang Safari — hindi Chrome sa iPhone</p>
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
          <p style={{ fontSize: 18, fontWeight: 700, color: "#1B201A", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}><Package size={18} /> Pack {currentPack} ng {packs}</p>
          <p style={{ fontSize: 17, color: "#4E504F", margin: 0 }}>{daysLeft} araw • ~{daysLeft * 2} sachets natitira</p>
        </div>
        {daysLeft <= 14 && (
          <button onClick={onReorder} style={{ background: "#39613B", color: "white", border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
            <ShoppingCart size={16} /> I-order
          </button>
        )}
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 999, height: 13, overflow: "hidden" }}>
        <div style={{ width: `${progressPct}%`, height: "100%", background: barColor, borderRadius: 999 }} />
      </div>
      <p style={{ fontSize: 16, color: "#9E9E9E", margin: "6px 0 0", textAlign: "right" as const }}>{progressPct}% nagamit</p>
    </div>
  );
}

// ============================================================
// ENGAGEMENT NUDGE (Feature 2)
// ============================================================
function EngagementNudge({ days, onDismiss }: { days: number; onDismiss: () => void }) {
  function scrollToMood() {
    // Auto-scroll to the mood picker further down on the page — the
    // one-tap flow the customer just needs to tap ONE emoji to satisfy.
    const buttons = document.querySelectorAll('button[aria-label="Ok lang"]');
    const target = buttons[0];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return (
    <div style={{ background: "#FEF9E7", border: "2px solid #FED255", borderRadius: 18, padding: "18px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ flexShrink: 0, fontSize: 36 }} aria-hidden="true">👋</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#1B201A", margin: "0 0 4px" }}>Miss ka namin!</p>
        <p style={{ fontSize: 15, color: "#4E504F", margin: 0, lineHeight: 1.5 }}>{days} araw na. Sandali lang — i-tap ang emoji sa baba para mag-check-in.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        <button onClick={scrollToMood} style={{ background: "#39613B", color: "white", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Simulan
        </button>
        <button onClick={onDismiss} style={{ background: "transparent", border: "none", fontSize: 12, color: "#9E9E9E", cursor: "pointer", padding: "4px" }}>
          Mamaya
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
    { label: "Araw na Na-log", value: `${data.entries}/7`, Icon: Calendar },
    { label: "Tuloy-tuloy",     value: `${data.consistency}%`, Icon: Target },
    { label: "Ave. Sakit",       value: `${data.avgPain}/10`, Icon: Pill },
  ];
  return (
    <div style={{ background: isGood ? "#E8F5E0" : "#FEF9E7", border: `2px solid ${isGood ? "#39613B" : "#FED255"}`, borderRadius: 18, padding: "20px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: isGood ? "#39613B" : "#b45309", margin: "0 0 3px", textTransform: "uppercase" as const, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}><BarChart3 size={16} /> Buod ng Linggo</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1B201A", margin: 0, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 6 }}>
            {isGood ? <>Magaling! Consistent ka ngayong linggo! <Star size={16} color="#F39C12" /></> : <>Kaya mo yan! Subukan mong maabot ang 7/7 ngayong linggo! <Dumbbell size={16} color="#b45309" /></>}
          </p>
        </div>
        <button onClick={onDismiss} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9E9E9E", padding: "0 0 0 10px", flexShrink: 0 }}><X size={20} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "13px 10px", textAlign: "center" as const, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ margin: "0 0 4px" }}><s.Icon size={22} color={isGood ? "#39613B" : "#b45309"} /></div>
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
  const [amHour, setAmHour] = useState<number>(7);
  const [pmHour, setPmHour] = useState<number>(19);
  useEffect(() => {
    if ("Notification" in window) setPerm(Notification.permission);
    const savedAm = Number(localStorage.getItem("eb_reminder_am_hour"));
    const savedPm = Number(localStorage.getItem("eb_reminder_pm_hour"));
    if (savedAm >= 5 && savedAm <= 11) setAmHour(savedAm);
    if (savedPm >= 15 && savedPm <= 22) setPmHour(savedPm);
  }, []);

  function saveHour(period: "am" | "pm", h: number) {
    if (period === "am") { setAmHour(h); localStorage.setItem("eb_reminder_am_hour", String(h)); }
    else                 { setPmHour(h); localStorage.setItem("eb_reminder_pm_hour", String(h)); }
    navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage({
      type: "SET_REMINDER",
      enabled,
      amHour: period === "am" ? h : amHour,
      pmHour: period === "pm" ? h : pmHour,
    }));
  }

  async function handleEnable() {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") {
      onToggle();
      new Notification("EaseBrew Paalala", { body: `Na-set na ang paalala mo! Aalerto ka namin ng ${amHour} AM at ${pmHour - 12} PM araw-araw.`, icon: "/icon-192.png" });
    }
  }

  if (perm === "denied") return null;

  const fmtAm = (h: number) => `${h} AM`;
  const fmtPm = (h: number) => `${h > 12 ? h - 12 : h} PM`;
  const amOptions = [5, 6, 7, 8, 9, 10, 11];
  const pmOptions = [15, 16, 17, 18, 19, 20, 21, 22];

  return (
    <div style={{ background: enabled ? "#E8F5E0" : "#FEF9E7", border: `2px solid ${enabled ? "#39613B" : "#FED255"}`, borderRadius: 18, padding: "20px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <span><Bell size={36} color="#C0863B" /></span>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#1B201A", margin: 0 }}>Paalala Araw-araw</p>
          <p style={{ fontSize: 15, color: "#4E504F", margin: "3px 0 0 0", lineHeight: 1.5 }}>I-remind ka namin tuwing {amHour} AM at {pmHour - 12} PM para hindi ka makalimot uminom!</p>
        </div>
      </div>
      {enabled && (
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <label style={{ flex: 1, fontSize: 13, color: MID, fontWeight: 600 }}>
            Umaga
            <select value={amHour} onChange={e => saveHour("am", Number(e.target.value))} style={{ width: "100%", marginTop: 4, padding: "10px 12px", borderRadius: 10, border: "2px solid #C5B99A", fontSize: 15, background: "white" }}>
              {amOptions.map(h => <option key={h} value={h}>{fmtAm(h)}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, fontSize: 13, color: MID, fontWeight: 600 }}>
            Gabi
            <select value={pmHour} onChange={e => saveHour("pm", Number(e.target.value))} style={{ width: "100%", marginTop: 4, padding: "10px 12px", borderRadius: 10, border: "2px solid #C5B99A", fontSize: 15, background: "white" }}>
              {pmOptions.map(h => <option key={h} value={h}>{fmtPm(h)}</option>)}
            </select>
          </label>
        </div>
      )}
      {enabled ? (
        <button onClick={onToggle} style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          <CircleCheck size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Paalala ON — I-tap para i-off
        </button>
      ) : (
        <button onClick={handleEnable} style={{ width: "100%", background: "#FED255", color: "#39613B", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          <Bell size={16} style={{ display: "inline", verticalAlign: "middle" }} /> I-on ang Paalala
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
      Icon: Coffee, iconBg: "#39613B",
      title: "Maligayang Pagdating!",
      body: "Ito ang personal mong EaseBrew Wellness Hub. Nandito kami para gabayan ka sa wellness journey mo!",
    },
    {
      Icon: Pill, iconBg: "#E67E22",
      title: "Inumin 2x Araw-araw",
      body: "Para sa best results — inumin ang EaseBrew tuwing umaga at gabi. Huwag mag-skip ng araw!",
    },
    {
      Icon: BarChart3, iconBg: "#2980B9",
      title: "I-track ang Progress Mo",
      body: "Gamitin ang Pain Tracker araw-araw para makita ang trend ng pain mo — magiging mas malinaw ang usapan mo sa doktor.",
    },
  ];
  const s = steps[step];
  const SIcon = s.Icon;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 28, padding: "40px 28px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 4px 16px ${s.iconBg}60` }}><SIcon size={40} color="#fff" strokeWidth={2} /></div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1B201A", margin: "0 0 14px", lineHeight: 1.3, fontFamily: "Georgia, serif" }}>{s.title}</h2>
        <p style={{ fontSize: 17, color: "#4E504F", margin: "0 0 28px", lineHeight: 1.7, fontFamily: "Georgia, serif" }}>{s.body}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#39613B" : "#E0D8CC", transition: "all 0.3s" }} />
          ))}
        </div>
        {step < steps.length - 1 ? (
          <>
            <button
              onClick={() => setStep(s => s + 1)}
              style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              Susunod →
            </button>
            <button
              onClick={onClose}
              style={{ width: "100%", background: "transparent", color: "#4E504F", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 8 }}
            >
              Laktawan (Skip)
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            style={{ width: "100%", background: "#39613B", color: "white", border: "none", borderRadius: 16, padding: "20px", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
          >
            <CircleCheck size={20} style={{ display: "inline", verticalAlign: "middle" }} /> Simulan Na!
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
  // FIXED — gumagamit na ng shared useSessionGuard (may server-side
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

  // Sync session expiry to service worker so it can fire expiry notifications
  // at 7/3/1 days left even if the user hasn't opened the app that day.
  useEffect(() => {
    if (!session?.code || !session?.expires_at) return;
    navigator.serviceWorker?.ready.then(reg =>
      reg.active?.postMessage({ type: "SET_EXPIRY", code: session.code, expiresAt: session.expires_at })
    );
  }, [session?.code, session?.expires_at]);

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
  useEffect(() => {
    if (typeof window === "undefined") return;
    setLargeFont(localStorage.getItem("eb_large_font") === "1");
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("eb_large_font", largeFont ? "1" : "0");
    if (largeFont) document.documentElement.setAttribute("data-customer-text", "large");
    else document.documentElement.removeAttribute("data-customer-text");
  }, [largeFont]);
  const [reminderOn, setReminderOn] = useState(false);
  const [expiryDismissed, setExpiryDismissed] = useState(false);
  const [daysSinceLog, setDaysSinceLog]     = useState<number | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [weeklyData, setWeeklyData]         = useState<{ avgPain: number; consistency: number; entries: number } | null>(null);
  const [weeklyDismissed, setWeeklyDismissed] = useState(false);
  const [unusedFeatureDismissed, setUnusedFeatureDismissed] = useState(false);
  const [products, setProducts]             = useState(DEFAULT_PRODUCTS);
  const [coaches, setCoaches]               = useState<Coach[]>(DEFAULT_COACHES);
  const [heroTitle, setHeroTitle]           = useState("Kamusta, Nanay at Tatay!");
  const [heroSubtitle, setHeroSubtitle]     = useState("Kasama mo araw-araw para sa mas malusog na katawan.");
  const [wellnessTips, setWellnessTips]     = useState(DEFAULT_WELLNESS_TIPS);
  const [faqs, setFaqs]                     = useState(DEFAULT_FAQS);
  const [testimonials, setTestimonials]     = useState(DEFAULT_TESTIMONIALS);
  const [videos, setVideos]                 = useState(DEFAULT_VIDEOS);
  const DEFAULT_REORDER_TEMPLATE = "Hi po! Gusto ko po mag-order ulit ng EaseBrew.\n\nPackage: {{package}}{{expiry_line}}\n\nAvailable po ba? Salamat po!";
  const DEFAULT_COACH_MODAL_TITLE = "Pumili ng Coach";
  const DEFAULT_COACH_SUBTITLE_REORDER = "I-copy ang mensahe sa taas, tapos i-send sa coach mo!";
  const DEFAULT_COACH_SUBTITLE_DEFAULT = "Tumawag o mag-message para mag-order";
  const [reorderTemplate, setReorderTemplate]         = useState(DEFAULT_REORDER_TEMPLATE);
  const [coachModalTitle, setCoachModalTitle]         = useState(DEFAULT_COACH_MODAL_TITLE);
  const [coachSubtitleReorder, setCoachSubtitleReorder] = useState(DEFAULT_COACH_SUBTITLE_REORDER);
  const [coachSubtitleDefault, setCoachSubtitleDefault] = useState(DEFAULT_COACH_SUBTITLE_DEFAULT);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── ONBOARDING — show once per customer (not once per device) ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!session?.code) return;
    const key = `eb_onboarded_${session.code}`;
    // Backfill: if the legacy per-device flag is set, treat this session
    // as already onboarded to avoid re-showing to existing customers.
    if (localStorage.getItem("eb_onboarded_v1") === "1" && !localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
    }
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [session?.code]);

  // Show through the very last day so the customer sees the reminder
  // even on expiration day itself (daysLeft === 0 during that day).
  const showExpiryBanner = daysLeft !== null && daysLeft <= 14 && daysLeft >= 0 && !expiryDismissed;

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

        if (c.reorder_message_template?.trim())      setReorderTemplate(c.reorder_message_template.trim());
        if (c.coach_modal_title?.trim())             setCoachModalTitle(c.coach_modal_title.trim());
        if (c.coach_modal_subtitle_reorder?.trim())  setCoachSubtitleReorder(c.coach_modal_subtitle_reorder.trim());
        if (c.coach_modal_subtitle_default?.trim())  setCoachSubtitleDefault(c.coach_modal_subtitle_default.trim());
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

    const todayStr = localDateStr();
    const sevenAgo = localDateStrOffset(-7);
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
      const today = localDateStr();
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

  // Reminders are handled by the service worker (SET_REMINDER + TICK).
  // The old in-page fallback that fired only while the hub was open led
  // to missed reminders if the customer wasn't on this exact page during
  // the 7-9AM or 7-9PM window — the SW schedule is the source of truth.

  const { unlocked: unlockedProducts, locked: lockedProducts } = splitByTier(products, customerTier);

  function buildReorderMessage() {
    const pkgLabel = getTierLabel(customerTier);
    const expiryStr = session?.expires_at
      ? new Date(session.expires_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
      : "";
    const expiryLine = expiryStr ? `\nExpires: ${expiryStr}` : "";
    return reorderTemplate
      .replace(/\{\{\s*package\s*\}\}/g, pkgLabel)
      .replace(/\{\{\s*expiry_line\s*\}\}/g, expiryLine)
      .replace(/\{\{\s*expiry\s*\}\}/g, expiryStr);
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p className="c-body" style={{ color: G, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Coffee size={20} /> Sandali lang...</p>
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
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh" }}>
      <InstallBanner />
      {showOnboarding && (
        <OnboardingModal onClose={() => {
          if (session?.code) localStorage.setItem(`eb_onboarded_${session.code}`, "1");
          localStorage.setItem("eb_onboarded_v1", "1"); // legacy fallback
          setShowOnboarding(false);
        }} />
      )}
      {showCoachModal && <CoachModal coaches={coaches} onClose={() => { setShowCoachModal(false); setReorderMessage(undefined); }} reorderMessage={reorderMessage} modalTitle={coachModalTitle} subtitleReorder={coachSubtitleReorder} subtitleDefault={coachSubtitleDefault} />}

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
            <p style={{ color: GOLD, fontSize: 18, fontWeight: 900, margin: 0, letterSpacing: 0.5 }}>R&amp;M EaseBrew</p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "3px 0 0 0", fontWeight: 500 }}>
              {getTierLabel(customerTier)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setLargeFont(v => !v)}
              aria-label={largeFont ? "Gawing maliit ang text" : "Palakihin ang text"}
              style={{ background: largeFont ? GOLD : "rgba(254,210,85,0.15)", border: "1.5px solid rgba(254,210,85,0.4)", borderRadius: 12, padding: "8px 12px", cursor: "pointer", color: largeFont ? G : GOLD, fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", gap: 4, fontFamily: "Georgia, serif" }}
            >
              <span style={{ fontSize: 13 }}>A</span><span style={{ fontSize: 18 }}>A</span>
            </button>
            <div style={{ background: "rgba(254,210,85,0.15)", border: "1.5px solid rgba(254,210,85,0.4)", borderRadius: 14, padding: "8px 14px", textAlign: "center" as const }}>
              <p style={{ color: GOLD, fontSize: 20, fontWeight: 900, margin: 0, lineHeight: 1 }}>{unlockedProducts.length}</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: "2px 0 0 0", fontWeight: 600 }}>Regalo</p>
            </div>
          </div>
        </div>
        <nav className="customer-home-nav" aria-label="Main menu" style={{ display: "flex", marginTop: 8 }}>
          {tabBtn("home",    "Home",     HomeIcon)}
          {tabBtn("gifts",   "Regalo",   Gift)}
          {tabBtn("tips",    "Tips",     Lightbulb)}
          {tabBtn("coaches", "Coach",    Users)}
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
                <p style={{ fontSize: 14, color: GOLD, fontWeight: 700, margin: "0 0 8px", letterSpacing: 0.5, textTransform: "uppercase" }}>{getTimeGreeting()}</p>
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

            {session && <TodaysSummaryCard sessionCode={session.code} />}
            {session && (
              <QuickCheckIn storageKey={progressStorageKey("easebrew-tracker-v2", session.code)} />
            )}
            {session && (
              <MoodQuickTap storageKey={progressStorageKey("easebrew-tracker-v2", session.code)} />
            )}
            {session && !unusedFeatureDismissed && (
              <UnusedFeatureNudge unlockedProducts={unlockedProducts} onDismiss={() => setUnusedFeatureDismissed(true)} />
            )}
            {session && <NextExercisePreview tier={customerTier} />}
            {session && <ReferralCard coaches={coaches} />}
            {session && <TestimonialSubmissionCard />}
            {session && <FamilyShareCard />}

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
              <h2 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 12px 0" }}>Libreng Health Tools</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { href: "/blood-pressure", icon: Activity, bg: "#8E44AD", label: "Blood Pressure Log" },
                  { href: "/medication",     icon: Pill,     bg: "#E67E22", label: "Gamot Log" },
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
                  <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0, textAlign: "center", lineHeight: 1.3 }}>Lingguhang Report ng Wellness</p>
                </Link>
              </div>
            </div>

            {/* ── Daily Wellness Tip ── */}
            <div style={{ background: "#FFFBF0", border: `2px solid ${GOLD}`, borderRadius: 18, padding: "20px 22px", marginBottom: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: AMBER, margin: "0 0 10px 0", textTransform: "uppercase" as const, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={16} /> Tip para sa Araw</p>
              <p style={{ fontSize: 18, color: DARK, margin: "0 0 16px 0", lineHeight: 1.75, display: "flex", alignItems: "flex-start", gap: 8 }}><Leaf size={18} color="#39613B" style={{ flexShrink: 0, marginTop: 4 }} /> {wellnessTips[tipIndex % wellnessTips.length]}</p>
              <button
                onClick={() => setTipIndex(i => (i + 1) % wellnessTips.length)}
                className="c-btn c-btn-gold"
                style={{ width: "100%" }}
              >
                Susunod na Tip →
              </button>
            </div>

            <div style={{ background: "#FEF9E7", border: `2.5px solid ${GOLD}`, borderRadius: 18, padding: "18px 20px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: AMBER, margin: "0 0 6px 0" }}>Inumin 2x sa isang araw</p>
              <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}><strong style={{ color: G }}>Umaga</strong> at <strong style={{ color: G }}>Gabi</strong> — para sa pinakamagandang resulta!</p>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>Routine Mo Araw-araw <Sun size={24} color="#C0863B" /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Sundin ito araw-araw para sa pinakamagandang resulta.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {REMINDERS.map((r, i) => {
                const RIcon = r.Icon;
                return (
                <div key={i} style={{ background: r.bg, border: `2px solid ${r.border}`, borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: r.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${r.iconBg}40` }}>
                    <RIcon size={22} color="#fff" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: r.textColor, margin: "0 0 4px 0", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>{r.time}</p>
                    <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{r.text}</p>
                  </div>
                </div>
                );
              })}
            </div>

            <DailyReminderCard
              enabled={reminderOn}
              onToggle={() => setReminderOn(v => {
                const n = !v;
                localStorage.setItem("eb_reminder_on", n ? "1" : "0");
                if (n && typeof Notification !== "undefined" && Notification.permission === "default") {
                  Notification.requestPermission();
                }
                const amHour = Number(localStorage.getItem("eb_reminder_am_hour")) || 7;
                const pmHour = Number(localStorage.getItem("eb_reminder_pm_hour")) || 19;
                navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage({ type: "SET_REMINDER", enabled: n, amHour, pmHour }));
                return n;
              })}
            />

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>90-Araw na Journey Mo <Calendar size={24} color={G} /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Ito ang aasahan mo sa bawat yugto.</p>
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: GOLD, color: G, borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}><Sparkles size={14} /> ESPESYAL NA OFFER</div>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "#F39C12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 16px rgba(243,156,18,0.5)" }}><Trophy size={32} color="#fff" /></div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3 }}>Complete Wellness Program</h2>
              <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 20px 0", lineHeight: 1.7 }}>Ang pinaka-complete na wellness program — 90-araw na master plan, exercise program, lingguhang check-ins, at lahat ng digital products!</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" as const }}>
                {["90-Araw na Master Plan na may araw-araw na schedule", "3 Yugto ng wellness program", "Exercise library para sa seniors", "Lingguhang milestone check-ins", "Lahat ng digital products kasama"].map((item, i) => (
                  <p key={i} style={{ fontSize: 16, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><CircleCheck size={16} color="#FED255" style={{ flexShrink: 0 }} /> {item}</p>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {customerTier >= 4497 ? (
                  <Link href="/bagong-katawan" style={{ background: GOLD, color: G, borderRadius: 14, padding: "18px 28px", fontSize: 18, fontWeight: 700, width: "100%", textAlign: "center" as const, textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
                    <Trophy size={18} style={{ display: "inline", verticalAlign: "middle" }} /> I-start ang Complete Wellness Program →
                  </Link>
                ) : (
                  <button onClick={() => setShowCoachModal(true)} style={{ background: GOLD, color: G, border: "none", borderRadius: 14, padding: "18px 28px", fontSize: 18, fontWeight: 700, width: "100%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <ShoppingCart size={18} /> I-order ang Complete Wellness Program
                  </button>
                )}
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, margin: "14px 0 0 0" }}>COD • Libreng Shipping • Buong Pilipinas</p>
            </div>
          </div>
        )}

        {/* ═══ GIFTS TAB ════════════════════════════════════════ */}
        {tab === "gifts" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>Mga Libreng Regalo Mo</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>Lahat ng regalo na ito ay <strong style={{ color: G }}>LIBRE</strong> — kasama na sa order mo!</p>

            {unlockedProducts.length === 0 && (
              <div style={{ background: "#FEF9E7", border: `1.5px solid ${GOLD}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
                <p style={{ fontSize: 16, color: AMBER, margin: 0, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8 }}><Info size={18} style={{ flexShrink: 0, marginTop: 2 }} /> Basic access lang ang order mo. Mag-order ng 3 packs (₱999) para ma-unlock ang unang libreng regalo!</p>
              </div>
            )}

            {unlockedProducts.map(p => {
              const meta = PRODUCT_ICONS[p.id];
              const Icon = meta?.icon;
              return (
              <div key={p.id} style={{ background: WHITE, border: `2.5px solid ${G}`, borderRadius: 20, marginBottom: 14, overflow: "hidden", boxShadow: "0 6px 20px rgba(24,59,40,0.12)" }}>
                <div style={{ background: `linear-gradient(135deg, ${G} 0%, #2d6e40 100%)`, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ background: GOLD, color: G, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 900 }}>LIBRENG REGALO</span>
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
                    <Lock size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Mag-order pa para ma-unlock ang {lockedProducts.length} pang libreng {lockedProducts.length === 1 ? "regalo" : "regalo"}!
                  </p>
                </div>
                {lockedProducts.map(p => {
                  const meta = PRODUCT_ICONS[p.id];
                  const Icon = meta?.icon;
                  const deltaPeso = p.tier - customerTier;
                  const packsNeeded = PRICE_CONFIG[p.tier]?.packs ?? null;
                  const currentPacks = session?.packs ?? 0;
                  const extraPacks = packsNeeded !== null ? Math.max(0, packsNeeded - currentPacks) : null;
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
                      <span style={{ background: "#E8E0D0", color: "#8A7D6A", borderRadius: 8, padding: "7px 14px", fontSize: 15, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}><Lock size={14} /> Ma-unlock sa {p.tierLabel}</span>
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, color: "#8A7D6A", margin: "0 0 6px 0" }}>{p.name}</h3>
                    <p style={{ fontSize: 16, color: "#A89880", margin: "0 0 18px 0", lineHeight: 1.65 }}>{p.desc}</p>
                    {deltaPeso > 0 && (
                      <div style={{ background: "#fff", border: "1.5px solid #FED255", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 15, color: "#78350f", fontWeight: 600 }}>
                        Kulang ka pa ng <strong>₱{deltaPeso.toLocaleString()}</strong>
                        {extraPacks !== null && extraPacks > 0 ? ` (${extraPacks} pang pack)` : ""} para ma-unlock ito.
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setReorderMessage(`Kumusta! Gusto ko po sanang i-upgrade ang order ko para ma-unlock ang "${p.name}" (${p.tierLabel}).\n\nCurrent tier ko: ${getTierLabel(customerTier)}\nGusto ko: ${p.tierLabel}\n\nSalamat po!`);
                        setShowCoachModal(true);
                      }}
                      className="c-btn c-btn-outline"
                      style={{ width: "100%" }}
                    >
                      Mag-order pa para ma-unlock ito →
                    </button>
                  </div>
                  );
                })}
              </>
            )}

            {/* Videos */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>Mga Video para sa Iyo <Video size={24} color={G} /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Panoorin ito para matutunan kung paano gamitin ang mga products mo.</p>
            {videos.map((v, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <YouTubeEmbed url={v.url} title={v.title} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "12px 0 5px 0" }}>{v.title}</h3>
                <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}

            {/* Recipe Preview */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>Mga Recipe <CookingPot size={24} color={G} /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>3 recipes mula sa libreng Recipe Book.</p>
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
                  {(() => { const rm = RECIPE_ICONS[r.iconId]; const RIcon = rm?.icon; return rm && RIcon ? (
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: rm.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${rm.bg}40` }}>
                      <RIcon size={20} color="#fff" strokeWidth={2.2} />
                    </div>
                  ) : null; })()}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{r.name}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 15, color: MID, margin: 0, lineHeight: 1.6 }}><strong>Sangkap:</strong> {r.ingredients}</p>
                </div>
              </div>
              );
            })}
            <div style={{ background: G, borderRadius: 18, padding: "22px", textAlign: "center" as const }}>
              <p style={{ fontSize: 16, color: GOLD, fontWeight: 700, margin: "0 0 12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><BookOpen size={16} /> 27 pang recipes sa full Recipe Book!</p>
              <Link href="/recipes" style={{ background: GOLD, color: G, borderRadius: 12, padding: "15px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box" as const }}>
                <BookOpen size={16} /> Buksan ang Full Recipe Book →
              </Link>
            </div>
          </div>
        )}

        {/* ═══ TIPS TAB ═════════════════════════════════════════ */}
        {tab === "tips" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 18px 0", display: "flex", alignItems: "center", gap: 8 }}>Tip para sa Araw <Lightbulb size={24} color="#C0863B" /></h2>
            <div style={{ background: WHITE, borderLeft: `6px solid ${AMBER}`, borderRadius: 14, padding: "22px", marginBottom: 14 }}>
              <p style={{ fontSize: 18, color: DARK, margin: 0, lineHeight: 1.75, display: "flex", alignItems: "flex-start", gap: 8 }}><Leaf size={18} color="#39613B" style={{ flexShrink: 0, marginTop: 4 }} /> {wellnessTips[tipIndex % wellnessTips.length]}</p>
            </div>
            <button
              onClick={() => setTipIndex(i => (i + 1) % wellnessTips.length)}
              className="c-btn c-btn-outline"
              style={{ width: "100%", marginBottom: 32 }}
            >
              Susunod na Tip →
            </button>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>Mga Kwento ng Customer <MessageCircle size={24} color={G} /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Totoong kwento mula sa mga katulad mo.</p>
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
                      <span style={{ fontSize: 14, color: G, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><CircleCheck size={14} /> Malaking pagbabago!</span>
                    </div>
                  )}
                </div>
              );
            })}

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>Mga Tanong <HelpCircle size={24} color={G} /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 8px 0", lineHeight: 1.6 }}>I-tap ang tanong para makita ang sagot.</p>
            <div style={{ background: WHITE, border: "1.5px solid #C5B99A", borderRadius: 18, padding: "8px 22px" }}>
              {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        )}

        {/* ═══ COACHES TAB ══════════════════════════════════════ */}
        {tab === "coaches" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>Mga Coach Namin <Users size={24} color={G} /></h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>Kailangan ng tulong? Nandito kami para sa iyo!</p>

            {/* Self-serve FAQ before phoning a coach — saves both sides time */}
            {faqs.length > 0 && (
              <div style={{ background: "#F3F8EE", border: "2px solid #C5D9AF", borderRadius: 18, padding: "16px 18px", marginBottom: 20 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
                  <HelpCircle size={18} /> Baka may sagot na dito
                </p>
                <p style={{ fontSize: 13, color: MID, margin: "0 0 10px", lineHeight: 1.5 }}>Basahin muna bago mag-message — baka mabilis na masagot ang tanong mo.</p>
                <div style={{ background: WHITE, borderRadius: 12, padding: "4px 14px" }}>
                  {faqs.slice(0, 5).map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {coaches.map((c, i) => (
                <div key={i} style={{ background: WHITE, border: "2px solid #C5B99A", borderRadius: 18, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <Image src={c.photo} alt={c.name} width={60} height={60} style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover", border: `2.5px solid ${G}`, flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: 0 }}>{c.name}</h3>
                      <p style={{ fontSize: 14, color: G, margin: "3px 0 0 0", fontWeight: 600 }}>EaseBrew Wellness Guide</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={`tel:${c.number}`} className="c-btn c-btn-green" style={{ flex: 1, textDecoration: "none", gap: 6, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={16} /> {c.display}</a>
                    <a href={c.facebook} target="_blank" rel="noopener noreferrer" className="c-btn c-btn-fb" style={{ flex: 1, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><BookOpen size={16} /> Facebook</a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, background: "#FEF9E7", borderRadius: 16, padding: "18px 20px", border: `2px solid ${GOLD}`, textAlign: "center" as const }}>
              <p style={{ fontSize: 17, color: AMBER, fontWeight: 700, margin: "0 0 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><MessageCircle size={18} /> Huwag mag-atubili!</p>
              <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}>Lagi kaming nandito para sa iyo. Ang kalusugan mo ang priority namin. <Heart size={16} color="#E74C3C" style={{ display: "inline", verticalAlign: "middle" }} /></p>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: `3px solid ${G}`, textAlign: "center" as const }}>
              <div style={{ display: "inline-block", background: G, color: GOLD, borderRadius: 14, padding: "10px 22px", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>R&M EaseBrew</div>
              <p style={{ fontSize: 13, color: G, fontWeight: 700, margin: "0 0 5px 0", letterSpacing: 1, textTransform: "uppercase" as const }}>Araw-araw, Alaga Namin</p>
              <p style={{ fontSize: 15, color: MID, margin: "0 0 20px 0", lineHeight: 1.65 }}>Natural na solusyon sa sakit ng katawan at pamamaga.</p>
              <button onClick={() => setShowCoachModal(true)} className="c-btn c-btn-gold" style={{ width: "100%" }}>
                <ShoppingCart size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Mag-order Ulit
              </button>
              <p style={{ fontSize: 13, color: MID, marginTop: 24, lineHeight: 1.7 }}>
                COD | Libreng Shipping | Buong Pilipinas<br />
                © 2025 EaseBrew Herbal Coffee.
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
