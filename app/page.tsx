"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PRODUCTS = [
  {
    id: 1,
    icon: "📊",
    name: "Body Pain Tracker + Journal",
    desc: "I-track ang iyong pain levels, tulog, mood, at Easebrew intake araw-araw.",
    value: "₱149",
    tier: 999,
    tierLabel: "₱999+ order",
    downloadUrl: "#",
    isApp: true,
    appUrl: "/tracker",
  },
  {
    id: 2,
    icon: "🥗",
    name: "50-Day Anti-Inflammation Meal Plan",
    desc: "50 araw ng Pinoy-friendly na pagkain para sa rayuma, joint pain, at pagod.",
    value: "₱199",
    tier: 1499,
    tierLabel: "₱1,499+ order",
    downloadUrl: "#",
    isApp: true,
    appUrl: "/meal-plan",
  },
  {
    id: 3,
    icon: "💪",
    name: "30-Day Home Exercise Guide",
    desc: "Low-impact exercises para sa may joint pain. Walang gym equipment needed.",
    value: "₱199",
    tier: 1499,
    tierLabel: "₱1,499+ order",
    downloadUrl: "#",
    isApp: true,
    appUrl: "/exercise",
  },
  {
    id: 4,
    icon: "📖",
    name: "Pinoy Anti-Inflammation Recipe Book",
    desc: "30 masustansiyang Pinoy recipes na anti-inflammatory.",
    value: "₱249",
    tier: 2998,
    tierLabel: "₱2,998+ order",
    downloadUrl: "#",
    isApp: true,
    appUrl: "/recipes",
  },
];

const WELLNESS_TIPS = [
  "Inumin ang Easebrew 30 minuto bago kumain para sa pinakamabuting epekto.",
  "Uminom ng 8 glasses ng tubig araw-araw — ang dehydration ay nagpapalala ng joint pain.",
  "I-massage ang Avocado Miracle Oil sa affected joints bago matulog gabi-gabi.",
  "Maglakad ng 15 minuto pagkatapos kumain para sa mas magandang digestion.",
  "Kumain ng isda (salmon o bangus) tatlong beses sa isang linggo para sa omega-3.",
  "Ang turmeric at luya ay natural na anti-inflammatory — dagdag sa ulam araw-araw.",
  "Matulog ng 7-8 oras — dito nagri-repair ang joints at muscles ng katawan.",
  "Ang malunggay ay superfood — dagdag sa sinigang, tinola, o lugaw.",
];

const RECIPES = [
  {
    name: "Sinigang na Salmon",
    benefit: "Omega-3 Anti-Inflammation",
    ingredients: "Salmon, kamatis, kangkong, labanos, sampalok",
    icon: "🐟",
  },
  {
    name: "Tinolang Manok with Malunggay",
    benefit: "Immune Boost + Joint Support",
    ingredients: "Manok, malunggay, sayote, luya, bawang",
    icon: "🍗",
  },
  {
    name: "Ginger-Turmeric Lugaw",
    benefit: "Powerful Anti-Inflammation",
    ingredients: "Bigas, luya, turmeric, bawang, sibuyas",
    icon: "🍚",
  },
];

const FAQS = [
  {
    q: "Kailan ko dapat inumin ang Easebrew?",
    a: "Pinakamabuti sa umaga (7-9AM), 30 minuto bago kumain. Para sa mas mataas na benepisyo, pwede ring uminom ng pangalawang baso sa hapon (3-5PM).",
  },
  {
    q: "Pwede ba ang may ulcer?",
    a: "Oo, pero uminom pagkatapos kumain ng konti. Huwag inumin nang walang laman ang tiyan.",
  },
  {
    q: "Kailan ko mararamdaman ang epekto?",
    a: "Karamihan sa mga customers ay nakakaramdam ng pagbabago sa loob ng 7-14 araw ng consistent na pag-inom. Para sa mas malalim na epekto — 30-90 araw.",
  },
  {
    q: "Paano gamitin ang Avocado Miracle Oil?",
    a: "I-massage ng 5-10 minuto bawat gabi sa masakit na parte. Pinakamabuti pagkatapos ng mainit na shower — mas bukas ang pores, mas mabilis masipsip.",
  },
  {
    q: "Ilang sachet bawat araw?",
    a: "1 sachet araw-araw para sa maintenance. Para sa mas matinding joint pain, pwedeng 2 sachets — umaga at hapon.",
  },
  {
    q: "Paano ko matatanggap ang aking libreng digital products?",
    a: "I-tap ang button sa bawat product card. Para sa Body Pain Tracker, Meal Plan, Exercise Guide, at Recipe Book — may interactive app na direkta sa iyong phone!",
  },
  {
    q: "May side effects ba ang Easebrew?",
    a: "Ang Easebrew ay gawa sa natural na herbs. Walang kilalang side effects para sa karamihan. Kung may allergy o maintenance medicine — kumonsulta muna sa doktor.",
  },
  {
    q: "COD ba at free shipping?",
    a: "Oo! COD available sa buong Pilipinas. Free shipping sa qualifying orders.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nena R.",
    age: 58,
    location: "Quezon City",
    quote: "Pagkatapos ng 3 linggo, mas gaan na ang pakiramdam ng aking tuhod. Hindi ko na kailangang uminom ng gamot araw-araw.",
    stars: 5,
    painBefore: 8,
    painAfter: 3,
  },
  {
    name: "Mang Tony",
    age: 64,
    location: "Cebu City",
    quote: "Hindi ako naniniwala noong una pero subukan ko nga. Ngayon — hindi ko na naiisip ang umaga nang walang Easebrew.",
    stars: 5,
    painBefore: 7,
    painAfter: 2,
  },
  {
    name: "Ate Susan",
    age: 52,
    location: "Davao",
    quote: "Ang libreng meal plan at recipe book — sobrang helpful! Alam ko na ngayon kung anong pagkain ang nagpapalala ng arthritis ko.",
    stars: 5,
    painBefore: 6,
    painAfter: 3,
  },
];

const REMINDERS = [
  { time: "Umaga", icon: "☕", text: "Inumin ang Easebrew 30 mins bago kumain", bg: "#E8F5E0", border: "#39613B", textColor: "#39613B" },
  { time: "Tanghali", icon: "🚶", text: "Maglakad ng 15 minuto pagkatapos kumain", bg: "#FEF9E7", border: "#C0863B", textColor: "#C0863B" },
  { time: "Hapon", icon: "💧", text: "Uminom ng 8 glasses ng tubig ngayon", bg: "#FFFBF0", border: "#FED255", textColor: "#8B6914" },
  { time: "Gabi", icon: "🌿", text: "I-massage ang Avocado Oil sa masakit na parte", bg: "#F4F8F0", border: "#7DAE2F", textColor: "#39613B" },
];

const PROGRESS_GUIDE = [
  { period: "Linggo 1–2", title: "Simula ng Pagbabago", desc: "Mararamdaman mo ang unang epekto — mas gaan ang pakiramdam sa umaga, mas okay ang energy.", bg: "#E8F5E0", border: "#39613B", color: "#39613B" },
  { period: "Linggo 3–4", title: "Makikita na ang Pagbabago", desc: "Ang mga taong malapit sa iyo ay mag-no-notice ng pagbabago. Mas magaan na ang galaw, mas mababa ang pain score.", bg: "#FEF9E7", border: "#C0863B", color: "#C0863B" },
  { period: "Buwan 2", title: "Tuloy-tuloy na Progreso", desc: "Ang anti-inflammation routine ay nagiging natural na gawi. Hindi mo na kailangan ng reminder.", bg: "#FFFBF0", border: "#FED255", color: "#8B6914" },
  { period: "Buwan 3", title: "Bagong Katawan, Bagong Buhay", desc: "50%+ reduction ng pain score. Mas aktibo, mas masaya, mas malusog. Ito ang Bagong Katawan.", bg: "#F4F8F0", border: "#7DAE2F", color: "#39613B" },
];

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

const APP_LABELS: Record<number, string> = {
  1: "📊 Buksan ang Tracker",
  2: "🥗 Buksan ang Meal Plan",
  3: "💪 Buksan ang Exercises",
  4: "📖 Buksan ang Recipe Book",
};

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[...Array(count)].map((_, i) => (
        <span key={i} style={{ color: "#FED255", fontSize: 20 }}>★</span>
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ borderBottom: "1px solid #D9D0C0", padding: "20px 0", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#1B201A", margin: 0, lineHeight: 1.4 }}>{q}</p>
        <span style={{ fontSize: 26, color: "#39613B", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <p style={{ fontSize: 17, color: "#4E504F", marginTop: 12, lineHeight: 1.7, margin: "12px 0 0 0" }}>{a}</p>
      )}
    </div>
  );
}

// ✅ PWA Install Banner Component
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    // Check if already dismissed
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (installed || !showBanner || dismissed) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 680, zIndex: 9999,
      background: G, padding: "20px 24px",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
      borderTop: `4px solid ${GOLD}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 40, flexShrink: 0 }}>📲</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
            I-install ang R&M Easebrew App!
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            I-save sa inyong phone — madaling buksan anumang oras!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 24, cursor: "pointer", padding: "4px", flexShrink: 0 }}
        >✕</button>
      </div>
      <button
        onClick={handleInstall}
        style={{
          marginTop: 14, width: "100%", background: GOLD, color: G,
          border: "none", borderRadius: 14, padding: "16px",
          fontSize: 18, fontWeight: 700, cursor: "pointer",
        }}
      >
        ✅ Oo! I-install sa Aking Phone →
      </button>
    </div>
  );
}

export default function Home() {
  const [selectedTier, setSelectedTier] = useState(1499);
  const [tipIndex, setTipIndex] = useState(0);

  const unlockedProducts = PRODUCTS.filter((p) => p.tier <= selectedTier);
  const lockedProducts = PRODUCTS.filter((p) => p.tier > selectedTier);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", padding: "0 0 80px 0" }}>

      {/* ✅ PWA Install Banner */}
      <InstallBanner />

      {/* ===== HERO ===== */}
      <div style={{
        background: G,
        padding: "52px 24px 44px",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(125,174,47,0.15)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, background: "rgba(254,210,85,0.1)", borderRadius: "50%" }} />
        <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 20, letterSpacing: 1 }}>
          ☕ EVERYDAY WE CARE
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.25, color: "#fff" }}>
          Kamusta, Nanay at Tatay! 👋
        </h1>
        <p style={{ fontSize: 19, opacity: 0.9, lineHeight: 1.65, margin: "0 0 24px 0" }}>
          Salamat sa inyong tiwala sa EaseBrew. Narito ang lahat ng kailangan ninyo para sa mas malusog na katawan.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 22px", fontSize: 16, border: "1.5px solid rgba(255,255,255,0.3)" }}>
          🌿 R&M EaseBrew Wellness Hub
        </div>
      </div>

      {/* ===== DAILY REMINDERS ===== */}
      <div style={{ padding: "44px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Ang Iyong Araw-Araw na Routine</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>Sundin ito araw-araw para sa pinakamabilis na resulta.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {REMINDERS.map((r, i) => (
            <div key={i} style={{ background: r.bg, border: `2px solid ${r.border}`, borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 38, flexShrink: 0 }}>{r.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: r.textColor, margin: "0 0 5px 0", textTransform: "uppercase", letterSpacing: 1.2 }}>{r.time}</p>
                <p style={{ fontSize: 18, color: DARK, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FREE DOWNLOADS ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Ang Inyong Libreng mga Regalo 🎁</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 20, lineHeight: 1.65 }}>Piliin ang halaga ng inyong order para makita ang mga unlocked na products.</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {[999, 1499, 2998].map((t) => (
            <button key={t} onClick={() => setSelectedTier(t)} style={{ padding: "13px 20px", borderRadius: 12, border: selectedTier === t ? `2.5px solid ${G}` : "2px solid #C5B99A", background: selectedTier === t ? G : "#FFFFFB", color: selectedTier === t ? "#fff" : MID, fontSize: 16, fontWeight: selectedTier === t ? 700 : 500, cursor: "pointer" }}>
              ₱{t.toLocaleString()}+
            </button>
          ))}
        </div>

        {unlockedProducts.map((p) => (
          <div key={p.id} style={{ background: "#FFFFFB", border: `2.5px solid ${G}`, borderRadius: 18, padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 42 }}>{p.icon}</span>
              <span style={{ background: "#E8F5E0", color: G, borderRadius: 8, padding: "5px 13px", fontSize: 14, fontWeight: 700 }}>Halaga: {p.value}</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>{p.name}</h3>
            <p style={{ fontSize: 17, color: MID, margin: "0 0 20px 0", lineHeight: 1.65 }}>{p.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, color: G, fontWeight: 600 }}>✅ Unlocked na!</span>
              <Link href={p.appUrl} style={{ background: G, color: "#fff", borderRadius: 12, padding: "14px 26px", fontSize: 17, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                {APP_LABELS[p.id]}
              </Link>
            </div>
          </div>
        ))}

        {lockedProducts.length > 0 && (
          <>
            <p style={{ fontSize: 15, color: MID, margin: "24px 0 12px 0", fontWeight: 600 }}>🔒 Ma-u-unlock sa mas malaking order:</p>
            {lockedProducts.map((p) => (
              <div key={p.id} style={{ background: "#F5F0E8", border: "2px solid #C5B99A", borderRadius: 18, padding: "24px", marginBottom: 16, opacity: 0.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 42, filter: "grayscale(1)" }}>{p.icon}</span>
                  <span style={{ background: "#E8E0D0", color: "#8A7D6A", borderRadius: 8, padding: "5px 13px", fontSize: 14, fontWeight: 700 }}>🔒 {p.tierLabel}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#8A7D6A", margin: "0 0 8px 0" }}>{p.name}</h3>
                <p style={{ fontSize: 17, color: "#A89880", margin: "0 0 20px 0", lineHeight: 1.65 }}>{p.desc}</p>
                <button onClick={() => window.open("#", "_blank")} style={{ background: "#FFFFFB", color: G, border: `2px solid ${G}`, borderRadius: 12, padding: "14px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                  Mag-order pa para ma-unlock ito →
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ===== WELLNESS VIDEOS ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Mga Video para sa Inyo 🎬</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>Panoorin ito para malaman kung paano gamitin ang inyong products nang tama.</p>
        {[
          { title: "Paano Ihanda ang Easebrew", desc: "Ang tamang paraan para ma-maximize ang herbal benefits ng Easebrew.", placeholder: "VIDEO 1" },
          { title: "Paano Mag-massage ng Avocado Oil", desc: "Step-by-step na massage technique para sa joint pain relief.", placeholder: "VIDEO 2" },
          { title: "Simple Exercises para sa Joint Pain", desc: "Low-impact exercises na safe para sa matatanda at may arthritis.", placeholder: "VIDEO 3" },
        ].map((v, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <div style={{ background: "#1B201A", borderRadius: 18, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, border: `2px solid ${G}` }}>
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 60, marginBottom: 10, color: GOLD }}>▶</div>
                <p style={{ fontSize: 14, opacity: 0.55, margin: 0 }}>{v.placeholder} — I-replace ng YouTube embed</p>
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: "0 0 6px 0" }}>{v.title}</h3>
            <p style={{ fontSize: 17, color: MID, margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== RECIPE PREVIEW ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Recipe Preview 🍲</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>Tatlong recipes mula sa aming libreng Recipe Book.</p>
        {RECIPES.map((r, i) => (
          <div key={i} style={{ background: "#FFFFFB", border: "1.5px solid #C5B99A", borderRadius: 18, padding: "20px 24px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <span style={{ fontSize: 36 }}>{r.icon}</span>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: "0 0 4px 0" }}>{r.name}</h3>
                <span style={{ fontSize: 13, background: "#E8F5E0", color: G, borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>{r.benefit}</span>
              </div>
            </div>
            <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}><strong>Ingredients:</strong> {r.ingredients}</p>
          </div>
        ))}
        <div style={{ background: G, borderRadius: 18, padding: "24px", textAlign: "center" }}>
          <p style={{ fontSize: 17, color: GOLD, fontWeight: 700, margin: "0 0 14px 0" }}>📖 May 27 pang recipes sa buong Recipe Book!</p>
          <Link href="/recipes" style={{ background: GOLD, color: G, borderRadius: 12, padding: "16px 28px", fontSize: 17, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-block", width: "100%", boxSizing: "border-box" as const }}>
            📖 Buksan ang Buong Recipe Book →
          </Link>
        </div>
      </div>

      {/* ===== 90-DAY PROGRESS GUIDE ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Ang Inyong 90-Day Journey 📅</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>Ito ang mararamdaman ninyo sa bawat phase ng wellness journey.</p>
        {PROGRESS_GUIDE.map((p, i) => (
          <div key={i} style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 18, padding: "24px", marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: p.color, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: 1.2 }}>{p.period}</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: "0 0 8px 0" }}>{p.title}</h3>
            <p style={{ fontSize: 17, color: MID, margin: 0, lineHeight: 1.7 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== UPSELL ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <div style={{ background: G, borderRadius: 22, padding: "40px 24px", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(254,210,85,0.12)", borderRadius: "50%" }} />
          <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>✨ SPECIAL OFFER</div>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏆</div>
          <h2 style={{ fontSize: 27, fontWeight: 700, margin: "0 0 14px 0", lineHeight: 1.3 }}>Bagong Katawan sa 90 Days Program</h2>
          <p style={{ fontSize: 17, opacity: 0.9, margin: "0 0 24px 0", lineHeight: 1.7 }}>Ang pinaka-kompletong wellness program. 90-day master plan, full exercise program, weekly check-in guide, at lahat ng digital products — sa iisang programa.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" }}>
            {["✅ 90-Day Master Plan na may araw-araw na schedule", "✅ 3 Phases ng progressive wellness program", "✅ Full exercise library para sa joint pain", "✅ Weekly milestone check-ins", "✅ Lahat ng digital products kasama na"].map((item, i) => (
              <p key={i} style={{ fontSize: 17, margin: 0 }}>{item}</p>
            ))}
          </div>
          <div style={{ marginBottom: 22 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: GOLD }}>₱499</span>
            <span style={{ fontSize: 16, opacity: 0.8, marginLeft: 10 }}>isang beses na bayad</span>
          </div>
          <button onClick={() => window.open("#", "_blank")} style={{ background: GOLD, color: G, border: "none", borderRadius: 14, padding: "20px 32px", fontSize: 20, fontWeight: 700, cursor: "pointer", width: "100%" }}>
            Oo! Gusto ko ito! →
          </button>
          <p style={{ fontSize: 14, opacity: 0.7, margin: "16px 0 0 0" }}>COD available • Free shipping • Nationwide</p>
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Sinasabi ng mga Customers 💬</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>Tunay na kwento mula sa mga katulad ninyo.</p>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={{ background: "#FFFFFB", border: "1.5px solid #C5B99A", borderRadius: 18, padding: "24px", marginBottom: 16 }}>
            <StarRating count={t.stars} />
            <p style={{ fontSize: 18, color: DARK, margin: "14px 0 18px 0", lineHeight: 1.75, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{t.name}, {t.age}</p>
                <p style={{ fontSize: 15, color: MID, margin: 0 }}>{t.location}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, color: MID, margin: "0 0 2px 0" }}>Pain Score</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: 0 }}>{t.painBefore} → {t.painAfter} ✅</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== WELLNESS TIP ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 24 }}>Tip ng Araw 💡</h2>
        <div style={{ background: "#FFFFFB", borderLeft: `6px solid ${AMBER}`, borderRadius: 14, padding: "24px", marginBottom: 16 }}>
          <p style={{ fontSize: 19, color: DARK, margin: 0, lineHeight: 1.75 }}>🌿 {WELLNESS_TIPS[tipIndex]}</p>
        </div>
        <button onClick={() => setTipIndex((i) => (i + 1) % WELLNESS_TIPS.length)} style={{ background: "#FFFFFB", border: `2px solid ${G}`, borderRadius: 12, padding: "15px 24px", fontSize: 17, fontWeight: 600, color: G, cursor: "pointer", width: "100%" }}>
          Iba pang tip →
        </button>
      </div>

      {/* ===== FAQ ===== */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Mga Madalas na Tanong ❓</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 8, lineHeight: 1.65 }}>I-tap ang tanong para makita ang sagot.</p>
        <div style={{ background: "#FFFFFB", border: "1.5px solid #C5B99A", borderRadius: 18, padding: "8px 24px" }}>
          {FAQS.map((faq, i) => (<FAQItem key={i} q={faq.q} a={faq.a} />))}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ padding: "48px 24px 0", textAlign: "center", borderTop: `3px solid ${G}`, marginTop: 52 }}>
        <div style={{ display: "inline-block", background: G, color: GOLD, borderRadius: 16, padding: "10px 24px", fontSize: 20, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>
          R&M EaseBrew
        </div>
        <p style={{ fontSize: 14, color: G, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: 1, textTransform: "uppercase" }}>Everyday We Care</p>
        <p style={{ fontSize: 17, color: MID, margin: "0 0 24px 0", lineHeight: 1.65 }}>Para sa mga Pilipinong naghahanap ng natural na lunas sa body pain at inflammation.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button onClick={() => window.open("#", "_blank")} style={{ background: G, color: "#fff", border: "none", borderRadius: 12, padding: "18px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 340 }}>
            📘 Sundan kami sa Facebook
          </button>
          <button onClick={() => window.open("#", "_blank")} style={{ background: GOLD, color: G, border: "none", borderRadius: 12, padding: "18px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 340 }}>
            🛒 Mag-order Ulit
          </button>
        </div>
        <p style={{ fontSize: 14, color: MID, marginTop: 32, lineHeight: 1.7 }}>
          COD | Free Shipping | Nationwide Delivery<br />
          © 2025 EaseBrew Herbal Coffee. Lahat ng karapatan ay nakalaan.
        </p>
      </div>

    </div>
  );
}