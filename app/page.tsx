"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ✅ 1.2 — Imported from single source of truth (no more duplicate definitions)
import { Coach, DEFAULT_COACHES, buildCoaches } from "@/lib/coaches";

// ============================================================
// ⚙️ CONFIG — FALLBACK DEFAULTS (used kung walang value sa DB)
// ============================================================
const DEFAULT_VIDEOS = [
  { title: "Paano I-prepare ang Easebrew",        desc: "Ang tamang paraan para ma-maximize ang herbal benefits ng Easebrew.", url: "" },
  { title: "Paano Mag-massage ng Avocado Oil",     desc: "Step-by-step massage technique para sa joint pain relief.",           url: "" },
  { title: "Simple Exercises para sa Joint Pain",  desc: "Low-impact exercises na safe para sa matatanda at may arthritis.",     url: "" },
];

const DEFAULT_PRODUCTS = [
  { id: 1, icon: "📊", name: "Body Pain Tracker + Journal",           desc: "I-track ang inyong pain levels, tulog, mood, at Easebrew intake araw-araw.",                                                                          tier: 999,  tierLabel: "3 Packs (₱999)",     appUrl: "/tracker" },
  { id: 2, icon: "🥗", name: "50-Day Anti-Inflammation Meal Plan",    desc: "50 days ng Pinoy-friendly na pagkain para sa rayuma, joint pain, at pagod.",                                                                           tier: 1499, tierLabel: "5 Packs (₱1,499)",  appUrl: "/meal-plan" },
  { id: 3, icon: "💪", name: "30-Day Home Exercise Guide",            desc: "Low-impact exercises para sa may joint pain. Walang gym equipment needed.",                                                                            tier: 1499, tierLabel: "5 Packs (₱1,499)",  appUrl: "/exercise" },
  { id: 4, icon: "📖", name: "Pinoy Anti-Inflammation Recipe Book",   desc: "30 healthy Pinoy recipes na anti-inflammatory.",                                                                                                        tier: 2998, tierLabel: "10 Packs (₱2,998)", appUrl: "/recipes" },
  { id: 5, icon: "🏆", name: "Bagong Katawan 90-Day Program",         desc: "Ang pinaka-complete na wellness program. 90-day master plan, full exercise program, weekly check-in guide — lahat kasama!",                           tier: 4497, tierLabel: "15 Packs (₱4,497)", appUrl: "/bagong-katawan" },
  { id: 6, icon: "🌿", name: "VIP Wellness Bundle",                   desc: "Lahat ng digital products + priority coach support + exclusive wellness tips para sa mga serious sa kanilang health journey.",                        tier: 5996, tierLabel: "20 Packs (₱5,996)", appUrl: "/bagong-katawan" },
];

const APP_LABELS: Record<number, string> = {
  1: "📊 Open ang Tracker",
  2: "🥗 Open ang Meal Plan",
  3: "💪 Open ang Exercises",
  4: "📖 Open ang Recipe Book",
  5: "🏆 Open ang 90-Day Program",
  6: "🌿 Open ang VIP Bundle",
};

const DEFAULT_WELLNESS_TIPS = [
  "Inumin ang Easebrew 30 mins bago kumain para sa best effect.",
  "Uminom ng 8 glasses ng tubig araw-araw — ang dehydration ay nagpapalala ng joint pain.",
  "I-massage ang Avocado Miracle Oil sa affected joints bago matulog gabi-gabi.",
  "Maglakad ng 15 mins pagkatapos kumain para sa mas magandang digestion.",
  "Kumain ng isda (salmon o bangus) tatlong beses sa isang linggo para sa omega-3.",
  "Ang turmeric at luya ay natural anti-inflammatory — dagdag sa ulam araw-araw.",
  "Matulog ng 7-8 hours — dito nagri-repair ang joints at muscles ng katawan.",
  "Ang malunggay ay superfood — dagdag sa sinigang, tinola, o lugaw.",
];

const DEFAULT_RECIPES = [
  { name: "Sinigang na Salmon",            benefit: "Omega-3 Anti-Inflammation",    ingredients: "Salmon, kamatis, kangkong, labanos, sampalok", icon: "🐟" },
  { name: "Tinolang Manok with Malunggay", benefit: "Immune Boost + Joint Support", ingredients: "Manok, malunggay, sayote, luya, bawang",        icon: "🍗" },
  { name: "Ginger-Turmeric Lugaw",         benefit: "Powerful Anti-Inflammation",   ingredients: "Bigas, luya, turmeric, bawang, sibuyas",         icon: "🍚" },
];

const DEFAULT_FAQS = [
  { q: "Kailan ko dapat inumin ang Easebrew?",                   a: "Umaga at gabi — 2 sachets bawat araw para sa pinakamabilis na resulta. Inumin 30 mins bago kumain para sa best effect." },
  { q: "Pwede ba ang may ulcer?",                                a: "Oo, pero uminom pagkatapos kumain ng konti. Huwag inumin nang empty stomach." },
  { q: "Kailan ko mararamdaman ang effect?",                     a: "Karamihan sa mga customers ay nakakaramdam ng change sa loob ng 7-14 days ng consistent na pag-inom. Para sa mas malalim na effect — 30-90 days." },
  { q: "Paano gamitin ang Avocado Miracle Oil?",                 a: "I-massage ng 5-10 mins bawat gabi sa masakit na parte. Best pagkatapos ng mainit na shower — mas bukas ang pores, mas mabilis masipsip." },
  { q: "Ilang sachet bawat araw?",                               a: "2 sachets bawat araw — isa sa umaga at isa sa gabi. Ito ang recommended para sa pinakamabuting resulta." },
  { q: "Paano ko ma-access ang aking libreng digital products?", a: "I-tap ang button sa bawat product card. Automatic na ma-a-access ang lahat ng products na kasama sa inyong order!" },
  { q: "May side effects ba ang Easebrew?",                      a: "Ang Easebrew ay gawa sa natural na herbs. Walang known side effects para sa karamihan. Kung may allergy o maintenance medicine — kumonsulta muna sa doktor." },
];

const DEFAULT_TESTIMONIALS = [
  { name: "Nena R.",   age: 58, location: "Quezon City", quote: "Pagkatapos ng 3 weeks, mas gaan na ang pakiramdam ng aking tuhod. Hindi ko na kailangang uminom ng gamot araw-araw.", stars: 5, painBefore: 8, painAfter: 3 },
  { name: "Mang Tony", age: 64, location: "Cebu City",   quote: "Hindi ako naniniwala noong una pero subukan ko nga. Ngayon — hindi ko na naiisip ang umaga nang walang Easebrew.",    stars: 5, painBefore: 7, painAfter: 2 },
  { name: "Ate Susan", age: 52, location: "Davao",       quote: "Ang libreng meal plan at recipe book — sobrang helpful! Alam ko na ngayon kung anong pagkain ang nagpapalala ng arthritis ko.", stars: 5, painBefore: 6, painAfter: 3 },
];

const REMINDERS = [
  { time: "Umaga",    icon: "☕", text: "Inumin ang Easebrew — 1st sachet ng araw",               bg: "#E8F5E0", border: "#39613B", textColor: "#39613B" },
  { time: "Tanghali", icon: "🚶", text: "Maglakad ng 15 mins pagkatapos kumain",                  bg: "#FEF9E7", border: "#C0863B", textColor: "#C0863B" },
  { time: "Hapon",    icon: "💧", text: "Uminom ng 8 glasses ng tubig ngayon",                    bg: "#FFFBF0", border: "#FED255", textColor: "#8B6914" },
  { time: "Gabi",     icon: "☕", text: "Inumin ang Easebrew — 2nd sachet + Avocado Oil massage",  bg: "#F4F8F0", border: "#7DAE2F", textColor: "#39613B" },
];

const PROGRESS_GUIDE = [
  { period: "Week 1–2", title: "Simula ng Pagbabago",          desc: "Mararamdaman mo ang unang effect — mas gaan ang pakiramdam sa umaga, mas okay ang energy.",        bg: "#E8F5E0", border: "#39613B", color: "#39613B" },
  { period: "Week 3–4", title: "Makikita na ang Change",       desc: "Ang mga taong malapit sa iyo ay mag-no-notice. Mas magaan na ang galaw, mas baba na ang pain score.", bg: "#FEF9E7", border: "#C0863B", color: "#C0863B" },
  { period: "Month 2",  title: "Tuloy-tuloy na Progress",      desc: "Ang anti-inflammation routine ay nagiging natural na habit. Hindi mo na kailangan ng reminder.",     bg: "#FFFBF0", border: "#FED255", color: "#8B6914" },
  { period: "Month 3",  title: "Bagong Katawan, Bagong Buhay", desc: "50%+ reduction ng pain score. Mas aktibo, mas masaya, mas malusog. Ito ang Bagong Katawan.",          bg: "#F4F8F0", border: "#7DAE2F", color: "#39613B" },
];

const G = "#39613B", GOLD = "#FED255", AMBER = "#C0863B", CREAM = "#EEE5D4", DARK = "#1B201A", MID = "#4E504F", WHITE = "#FFFFFB";

// ============================================================
// SESSION HELPERS
// ============================================================
function getSession(): { tier: number; expires_at: string; code: string; device_id: string } | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split(";").find(c => c.trim().startsWith("eb_session="));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const s = JSON.parse(raw);
    if (!s.expires_at || new Date(s.expires_at) < new Date()) return null;
    return s;
  } catch { return null; }
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
// PROMO BANNER
// ============================================================
function PromoBanner({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  return (
    <div style={{ background: GOLD, borderBottom: `3px solid ${AMBER}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <p style={{ flex: 1, fontSize: 16, fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.5 }}>{text}</p>
      <button onClick={onDismiss} aria-label="Isara ang promo" style={{ background: "rgba(0,0,0,0.12)", border: "none", borderRadius: 999, width: 34, height: 34, fontSize: 18, cursor: "pointer", color: DARK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ============================================================
// COACH PICKER MODAL
// ============================================================
function CoachModal({ coaches, onClose }: { coaches: Coach[]; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto", padding: "0 0 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div style={{ width: 48, height: 5, borderRadius: 999, background: "#D9D0C0" }} />
        </div>
        <div style={{ padding: "12px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: G, margin: "0 0 4px 0" }}>👥 Piliin ang Inyong Coach</h2>
              <p style={{ fontSize: 15, color: MID, margin: 0 }}>Tumawag o mag-message para mag-order</p>
            </div>
            <button onClick={onClose} style={{ background: "#F0EDE6", border: "none", borderRadius: 999, width: 40, height: 40, fontSize: 20, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {coaches.map((c, i) => (
            <div key={i} style={{ background: "#FAFAF5", border: "2px solid #D9D0C0", borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <img src={c.photo} alt={c.name} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", border: `2px solid ${G}`, flexShrink: 0 }} />
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
          <p style={{ fontSize: 15, color: AMBER, fontWeight: 700, margin: "0 0 4px 0" }}>💬 Huwag mag-atubili!</p>
          <p style={{ fontSize: 14, color: MID, margin: 0, lineHeight: 1.6 }}>Lagi kaming nandito para sa inyo. I-tap ang 📞 para direktang tumawag!</p>
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
        <p style={{ fontSize: 13, opacity: 0.55, margin: 0 }}>I-paste ang YouTube link sa Admin → Content → Videos</p>
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

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) { setInstalled(true); return; }
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) return;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIOS && isSafari) { setTimeout(() => setShowIOS(true), 2000); return; }
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShowAndroid(true); };
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
  const handleDismiss = () => { setShowAndroid(false); setShowIOS(false); setDismissed(true); localStorage.setItem("pwa-banner-dismissed", "true"); };

  if (installed || dismissed) return null;

  if (showAndroid) return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, zIndex: 9998, background: G, padding: "20px 24px", boxShadow: "0 -4px 24px rgba(0,0,0,0.25)", borderTop: `4px solid ${GOLD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 40, flexShrink: 0 }}>📲</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>I-install ang R&M EaseBrew App!</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>I-save sa inyong phone — madaling buksan anytime!</p>
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
            <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>I-save sa iyong iPhone!</p>
            <p style={{ fontSize: 13, color: MID, margin: 0 }}>Para madaling buksan anytime</p>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: "#f0f0f0", border: "none", borderRadius: 999, width: 32, height: 32, fontSize: 18, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {[
          { step: "1", icon: "🌐", label: "Open sa", highlight: "Safari" },
          { step: "2", icon: "⬆️", label: "I-tap ang", highlight: "Share button (⬆️) sa ibaba ng screen" },
          { step: "3", icon: "➕", label: "Piliin ang", highlight: '"Add to Home Screen"' },
          { step: "4", icon: "✅", label: "I-tap ang", highlight: '"Add" — done na!' },
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
// MAIN PAGE
// ============================================================
export default function Home() {
  const router = useRouter();
  const [customerTier, setCustomerTier] = useState<number>(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [showCoachModal, setShowCoachModal] = useState(false);

  // ── DYNAMIC STATE ────────────────────────────────────────────
  const [promoText, setPromoText]           = useState("");
  const [promoEnabled, setPromoEnabled]     = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [products, setProducts]             = useState(DEFAULT_PRODUCTS);
  const [coaches, setCoaches]               = useState<Coach[]>(DEFAULT_COACHES);
  const [heroTitle, setHeroTitle]           = useState("Kamusta, Nanay at Tatay! 👋");
  const [heroSubtitle, setHeroSubtitle]     = useState("Salamat sa inyong tiwala sa EaseBrew. Nandito na ang lahat ng kailangan ninyo para sa mas malusog na katawan.");
  const [wellnessTips, setWellnessTips]     = useState(DEFAULT_WELLNESS_TIPS);
  const [faqs, setFaqs]                     = useState(DEFAULT_FAQS);
  const [testimonials, setTestimonials]     = useState(DEFAULT_TESTIMONIALS);
  const [videos, setVideos]                 = useState(DEFAULT_VIDEOS);

  // ── FETCH PUBLIC CONTENT ─────────────────────────────────────
  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(data => {
        if (!data?.content) return;
        const c = data.content as Record<string, string>;

        if (c.promo_enabled === "true" && c.promo_text?.trim()) {
          setPromoEnabled(true);
          setPromoText(c.promo_text.trim());
        }

        if (c.hero_title?.trim())    setHeroTitle(c.hero_title.trim());
        if (c.hero_subtitle?.trim()) setHeroSubtitle(c.hero_subtitle.trim());

        setProducts(prev => prev.map(p => ({
          ...p,
          name: c[`product_${p.id}_name`]?.trim() || p.name,
          desc: c[`product_${p.id}_desc`]?.trim()  || p.desc,
        })));

        setCoaches(buildCoaches(c, DEFAULT_COACHES));
        setWellnessTips(buildTips(c, DEFAULT_WELLNESS_TIPS));
        setFaqs(buildFaqs(c, DEFAULT_FAQS));
        setTestimonials(buildTestimonials(c, DEFAULT_TESTIMONIALS));
        setVideos(buildVideos(c, DEFAULT_VIDEOS));
      })
      .catch(() => {});
  }, []);

  // ── SESSION CHECK ─────────────────────────────────────────────
  useEffect(() => {
    const session = getSession();
    if (!session) { router.push("/verify"); return; }
    setCustomerTier(session.tier ?? 0);
    setLoading(false);
  }, [router]);

  const unlockedProducts = products.filter(p => p.tier <= customerTier);
  const lockedProducts   = products.filter(p => p.tier > customerTier);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G, fontSize: 18, fontWeight: 600 }}>☕ Loading...</p>
    </div>
  );

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => { setTab(t); window.scrollTo({ top: 0 }); }}
      style={{
        flex: 1, padding: "14px 4px", fontSize: "15px", fontWeight: "bold",
        border: "none", borderBottom: tab === t ? `4px solid ${GOLD}` : "4px solid transparent",
        background: "transparent", color: tab === t ? GOLD : "rgba(255,255,255,0.6)",
        cursor: "pointer", transition: "all 0.2s", fontFamily: "Georgia, serif", lineHeight: 1.2,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh" }}>
      <InstallBanner />
      {showCoachModal && <CoachModal coaches={coaches} onClose={() => setShowCoachModal(false)} />}

      {/* ── STICKY HEADER + TABS ─────────────────────────────── */}
      <div style={{ background: G, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        {promoEnabled && !promoDismissed && (
          <PromoBanner text={promoText} onDismiss={() => setPromoDismissed(true)} />
        )}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 12, padding: "3px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>☕ EVERYDAY WE CARE</div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, margin: "4px 0 0 0", fontWeight: 500 }}>
              📦 {getTierLabel(customerTier)} — {unlockedProducts.length} {unlockedProducts.length === 1 ? "Gift" : "Gifts"} Unlocked
            </p>
          </div>
          <div style={{ fontSize: 32 }}>☕</div>
        </div>
        <div style={{ display: "flex", marginTop: 8 }}>
          {tabBtn("home",    "🏠 Home")}
          {tabBtn("gifts",   "🎁 Gifts")}
          {tabBtn("tips",    "💡 Tips")}
          {tabBtn("coaches", "👥 Coaches")}
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────── */}
      <div style={{ padding: "28px 20px 80px" }}>

        {/* ═══ HOME TAB ═════════════════════════════════════════ */}
        {tab === "home" && (
          <div>
            <div style={{ background: G, borderRadius: 22, padding: "32px 24px", color: "#fff", textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, background: "rgba(125,174,47,0.2)", borderRadius: "50%" }} />
              <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3, color: "#fff" }}>{heroTitle}</h1>
              <p style={{ fontSize: 17, opacity: 0.9, lineHeight: 1.65, margin: 0 }}>{heroSubtitle}</p>
            </div>

            <div style={{ background: "#FEF9E7", border: `2.5px solid ${GOLD}`, borderRadius: 18, padding: "18px 20px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: AMBER, margin: "0 0 6px 0" }}>☕ Inumin 2x sa isang araw</p>
              <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}><strong style={{ color: G }}>Umaga</strong> at <strong style={{ color: G }}>Gabi</strong> — para sa pinakamabilis na resulta!</p>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Inyong Daily Routine ☀️</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Sundin ito every day para sa pinakamabilis na results.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {REMINDERS.map((r, i) => (
                <div key={i} style={{ background: r.bg, border: `2px solid ${r.border}`, borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 36, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: r.textColor, margin: "0 0 4px 0", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>{r.time}</p>
                    <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Ang Inyong 90-Day Journey 📅</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Ito ang mararamdaman ninyo sa bawat phase.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {PROGRESS_GUIDE.map((p, i) => (
                <div key={i} style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 18, padding: "22px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: p.color, margin: "0 0 5px 0", textTransform: "uppercase" as const, letterSpacing: 1.2 }}>{p.period}</p>
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
              <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 20px 0", lineHeight: 1.7 }}>Ang pinaka-complete na wellness program — 90-day master plan, full exercise program, weekly check-ins, at lahat ng digital products!</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" as const }}>
                {["✅ 90-Day Master Plan na may daily schedule", "✅ 3 Phases ng progressive wellness program", "✅ Full exercise library para sa joint pain", "✅ Weekly milestone check-ins", "✅ Lahat ng digital products kasama na"].map((item, i) => (
                  <p key={i} style={{ fontSize: 16, margin: 0 }}>{item}</p>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/bagong-katawan" style={{ background: GOLD, color: G, borderRadius: 14, padding: "18px 28px", fontSize: 18, fontWeight: 700, width: "100%", textAlign: "center" as const, textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
                  🏆 I-start ang 90-Day Program →
                </Link>
                <button onClick={() => setShowCoachModal(true)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 600, width: "100%", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  🛒 Mag-order ng 90-Day Program
                </button>
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, margin: "14px 0 0 0" }}>COD available • Free shipping • Nationwide</p>
            </div>
          </div>
        )}

        {/* ═══ GIFTS TAB ════════════════════════════════════════ */}
        {tab === "gifts" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>Inyong Free Gifts 🎁</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>Lahat ng gifts na ito ay <strong style={{ color: G }}>LIBRE</strong> — kasama na sa inyong order!</p>

            {unlockedProducts.length === 0 && (
              <div style={{ background: "#FEF9E7", border: `1.5px solid ${GOLD}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
                <p style={{ fontSize: 16, color: AMBER, margin: 0, fontWeight: 600 }}>ℹ️ Ang inyong order ay para sa basic access lang. Mag-order ng 3 packs (₱999) para ma-unlock ang unang free gift!</p>
              </div>
            )}

            {unlockedProducts.map(p => (
              <div key={p.id} style={{ background: WHITE, border: `2.5px solid ${G}`, borderRadius: 18, padding: "22px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 40 }}>{p.icon}</span>
                  <span style={{ background: "#E8F5E0", color: G, borderRadius: 8, padding: "5px 12px", fontSize: 14, fontWeight: 800 }}>🎁 FREE!</span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: G, margin: "0 0 6px 0" }}>{p.name}</h3>
                <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.65 }}>{p.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: G, fontWeight: 600 }}>✅ Unlocked na!</span>
                  <Link href={p.appUrl} style={{ background: G, color: "#fff", borderRadius: 12, padding: "13px 22px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                    {APP_LABELS[p.id]}
                  </Link>
                </div>
              </div>
            ))}

            {lockedProducts.length > 0 && (
              <>
                <div style={{ background: "#FEF9E7", border: `1.5px solid ${GOLD}`, borderRadius: 14, padding: "14px 18px", margin: "20px 0 12px 0" }}>
                  <p style={{ fontSize: 15, color: AMBER, margin: 0, fontWeight: 700, textAlign: "center" as const }}>
                    🔒 Mag-order pa para ma-unlock ang {lockedProducts.length} pang libreng {lockedProducts.length === 1 ? "gift" : "gifts"}!
                  </p>
                </div>
                {lockedProducts.map(p => (
                  <div key={p.id} style={{ background: "#F5F0E8", border: "2px solid #C5B99A", borderRadius: 18, padding: "22px", marginBottom: 14, opacity: 0.85 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: 40, filter: "grayscale(1)" }}>{p.icon}</span>
                      <span style={{ background: "#E8E0D0", color: "#8A7D6A", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700 }}>🔒 I-unlock sa {p.tierLabel}</span>
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, color: "#8A7D6A", margin: "0 0 6px 0" }}>{p.name}</h3>
                    <p style={{ fontSize: 16, color: "#A89880", margin: "0 0 18px 0", lineHeight: 1.65 }}>{p.desc}</p>
                    <button onClick={() => setShowCoachModal(true)} style={{ display: "block", background: WHITE, color: G, border: `2px solid ${G}`, borderRadius: 12, padding: "13px 20px", fontSize: 15, fontWeight: 700, width: "100%", cursor: "pointer", fontFamily: "Georgia, serif", boxSizing: "border-box" as const }}>
                      Mag-order pa para ma-unlock ito →
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Videos */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0" }}>Videos para sa Inyo 🎬</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Panoorin ito para malaman kung paano gamitin ang inyong products nang tama.</p>
            {videos.map((v, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <YouTubeEmbed url={v.url} title={v.title} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "12px 0 5px 0" }}>{v.title}</h3>
                <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}

            {/* Recipe Preview */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0" }}>Recipe Preview 🍲</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>3 recipes mula sa aming libreng Recipe Book.</p>
            {DEFAULT_RECIPES.map((r, i) => (
              <div key={i} style={{ background: WHITE, border: "1.5px solid #C5B99A", borderRadius: 16, padding: "18px 20px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 34 }}>{r.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 3px 0" }}>{r.name}</h3>
                    <span style={{ fontSize: 12, background: "#E8F5E0", color: G, borderRadius: 6, padding: "3px 9px", fontWeight: 700 }}>{r.benefit}</span>
                  </div>
                </div>
                <p style={{ fontSize: 15, color: MID, margin: 0, lineHeight: 1.6 }}><strong>Ingredients:</strong> {r.ingredients}</p>
              </div>
            ))}
            <div style={{ background: G, borderRadius: 18, padding: "22px", textAlign: "center" as const }}>
              <p style={{ fontSize: 16, color: GOLD, fontWeight: 700, margin: "0 0 12px 0" }}>📖 May 27 pang recipes sa buong Recipe Book!</p>
              <Link href="/recipes" style={{ background: GOLD, color: G, borderRadius: 12, padding: "15px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
                📖 Open ang Buong Recipe Book →
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
              style={{ background: WHITE, border: `2px solid ${G}`, borderRadius: 12, padding: "15px 24px", fontSize: 17, fontWeight: 600, color: G, cursor: "pointer", width: "100%", marginBottom: 32, fontFamily: "Georgia, serif" }}
            >
              Susunod na Tip →
            </button>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Sinasabi ng mga Customers 💬</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 18px 0", lineHeight: 1.6 }}>Real stories mula sa mga katulad ninyo.</p>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: WHITE, border: "1.5px solid #C5B99A", borderRadius: 18, padding: "22px", marginBottom: 14 }}>
                <StarRating count={t.stars} />
                <p style={{ fontSize: 17, color: DARK, margin: "12px 0 16px 0", lineHeight: 1.75, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0 }}>{t.name}{t.age > 0 ? `, ${t.age}` : ""}</p>
                    <p style={{ fontSize: 14, color: MID, margin: 0 }}>{t.location}</p>
                  </div>
                  {t.painBefore > 0 && t.painAfter > 0 && (
                    <div style={{ textAlign: "right" as const }}>
                      <p style={{ fontSize: 12, color: MID, margin: "0 0 2px 0" }}>Pain Score</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: G, margin: 0 }}>{t.painBefore} → {t.painAfter} ✅</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "32px 0 8px 0" }}>Mga Tanong ❓</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 8px 0", lineHeight: 1.6 }}>I-tap ang tanong para makita ang sagot.</p>
            <div style={{ background: WHITE, border: "1.5px solid #C5B99A", borderRadius: 18, padding: "8px 22px" }}>
              {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        )}

        {/* ═══ COACHES TAB ══════════════════════════════════════ */}
        {tab === "coaches" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>Ang Aming mga Coach 👥</h2>
            <p style={{ fontSize: 16, color: MID, margin: "0 0 20px 0", lineHeight: 1.6 }}>May katanungan? Handa kaming tumulong sa inyo, Nanay at Tatay!</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {coaches.map((c, i) => (
                <div key={i} style={{ background: WHITE, border: "2px solid #C5B99A", borderRadius: 18, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <img src={c.photo} alt={c.name} style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover", border: `2.5px solid ${G}`, flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: 0 }}>{c.name}</h3>
                      <p style={{ fontSize: 14, color: G, margin: "3px 0 0 0", fontWeight: 600 }}>R&M EaseBrew Wellness Coach</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={`tel:${c.number}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: G, color: "#fff", borderRadius: 12, padding: "14px 8px", fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center" as const }}>📞 {c.display}</a>
                    <a href={c.facebook} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#1877F2", color: "#fff", borderRadius: 12, padding: "14px 8px", fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center" as const }}>📘 Facebook</a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, background: "#FEF9E7", borderRadius: 16, padding: "18px 20px", border: `2px solid ${GOLD}`, textAlign: "center" as const }}>
              <p style={{ fontSize: 17, color: AMBER, fontWeight: 700, margin: "0 0 6px 0" }}>💬 Huwag mag-atubili!</p>
              <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}>Lagi kaming nandito para sa inyo. Ang inyong kalusugan ang aming prayoridad. ❤️</p>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: `3px solid ${G}`, textAlign: "center" as const }}>
              <div style={{ display: "inline-block", background: G, color: GOLD, borderRadius: 14, padding: "10px 22px", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>R&M EaseBrew</div>
              <p style={{ fontSize: 13, color: G, fontWeight: 700, margin: "0 0 5px 0", letterSpacing: 1, textTransform: "uppercase" as const }}>Everyday We Care</p>
              <p style={{ fontSize: 15, color: MID, margin: "0 0 20px 0", lineHeight: 1.65 }}>Para sa mga Pilipinong naghahanap ng natural na lunas sa body pain at inflammation.</p>
              <button onClick={() => setShowCoachModal(true)} style={{ background: GOLD, color: G, border: "none", borderRadius: 12, padding: "16px 28px", fontSize: 17, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "Georgia, serif", boxSizing: "border-box" as const }}>
                🛒 Mag-order Ulit
              </button>
              <p style={{ fontSize: 13, color: MID, marginTop: 24, lineHeight: 1.7 }}>
                COD | Free Shipping | Nationwide Delivery<br />
                © 2025 EaseBrew Herbal Coffee. All rights reserved.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}