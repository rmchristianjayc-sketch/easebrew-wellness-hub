"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const G       = "#39613B";
const LIGHT_G = "#7DAE2F";
const GOLD    = "#FED255";
const AMBER   = "#C08038";
const CREAM   = "#EEE5D4";
const DARK    = "#1B201A";
const MID     = "#4E504F";
const WHITE   = "#FFFFFB";

// ── DEFAULT PERKS — overridden by /api/content if available ──
const DEFAULT_PERKS = [
  { tier: 399,  packs: 1,  label: "1 Pack — ₱399",     gifts: [],                                                                                                                                                 note: "10 araw na access sa Wellness Hub",  highlight: false },
  { tier: 699,  packs: 2,  label: "2 Packs — ₱699",    gifts: [],                                                                                                                                                 note: "20 araw na access sa Wellness Hub",  highlight: false },
  { tier: 999,  packs: 3,  label: "3 Packs — ₱999",    gifts: ["📊 Body Pain Tracker + Journal"],                                                                                                                 note: "30 araw na access",                  highlight: false },
  { tier: 1499, packs: 5,  label: "5 Packs — ₱1,499",  gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide"],                                                             note: "45 araw na access",                  highlight: false },
  { tier: 2998, packs: 10, label: "10 Packs — ₱2,998", gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book"],                                     note: "75 araw na access",                  highlight: false },
  { tier: 4497, packs: 15, label: "15 Packs — ₱4,497", gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Bagong Katawan Program"], note: "105 araw na access",                 highlight: false },
  { tier: 5996, packs: 20, label: "20 Packs — ₱5,996", gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Program", "🌿 VIP Wellness Bundle"], note: "135 araw na access",          highlight: true  },
];

// Product index map: tier → product ids
const TIER_TO_PRODUCT_IDS: Record<number, number[]> = {
  399:  [],
  699:  [],
  999:  [1],
  1499: [1, 2, 3],
  2998: [1, 2, 3, 4],
  4497: [1, 2, 3, 4, 5],
  5996: [1, 2, 3, 4, 5, 6],
};

// ── DEFAULT COACHES — overridden by /api/content if available ──
type Coach = { name: string; number: string; display: string; facebook: string; photo: string };

const DEFAULT_COACHES: Coach[] = [
  { name: "Coach Josephine", number: "09177011252", display: "0917 701 1252", facebook: "https://www.facebook.com/josephine.easebrew.main",         photo: "/coaches/josephine.jpg" },
  { name: "Coach Niña",      number: "09688804440", display: "0968 880 4440", facebook: "https://www.facebook.com/easebrew.nina",                   photo: "/coaches/niña.jpg"      },
  { name: "Coach Mark",      number: "09171178216", display: "0917 117 8216", facebook: "https://www.facebook.com/profile.php?id=61577427472374",    photo: "/coaches/mark.jpg"      },
  { name: "Coach Rai",       number: "09709689164", display: "0970 968 9164", facebook: "https://www.facebook.com/profile.php?id=61579641330542",    photo: "/coaches/rai.jpg"       },
  { name: "Coach Jo Ann",    number: "09516851019", display: "0951 685 1019", facebook: "https://www.facebook.com/profile.php?id=61590474596913",    photo: "/coaches/joann.jpg"     },
  { name: "Coach Mike",      number: "09515986840", display: "0951 598 6840", facebook: "https://www.facebook.com/profile.php?id=61576324811239",    photo: "/coaches/mike.jpg"      },
];

// Build coaches array from content API response
function buildCoaches(c: Record<string, string>, defaults: Coach[]): Coach[] {
  return defaults.map((def, i) => {
    const n = i + 1;
    return {
      name:     c[`coach_${n}_name`]?.trim()     || def.name,
      number:   c[`coach_${n}_number`]?.trim()   || def.number,
      display:  c[`coach_${n}_display`]?.trim()  || def.display,
      facebook: c[`coach_${n}_facebook`]?.trim() || def.facebook,
      photo:    c[`coach_${n}_photo`]?.trim()    || def.photo,
    };
  });
}

type ErrorType = "invalid" | "expired" | "other_device" | "generic" | null;

function getErrorType(errorMsg: string): ErrorType {
  if (!errorMsg) return null;
  const msg = errorMsg.toLowerCase();
  if (msg.includes("expired")) return "expired";
  if (msg.includes("another device") || msg.includes("other device")) return "other_device";
  if (msg.includes("invalid") || msg.includes("not found") || msg.includes("404")) return "invalid";
  return "generic";
}

const ERROR_CONFIG = {
  invalid:      { icon: "❓", title: "Hindi Nahanap ang Code",         message: "Baka may typo — i-check ulit ang code na ibinigay ng inyong coach. O baka hindi pa kayo nag-order?",                                                  showCoaches: true, ctaLabel: "Wala pang code? Makipag-ugnayan sa Coach →" },
  expired:      { icon: "⏰", title: "Expired na ang Code",             message: "Ang inyong access ay nag-expire na. Mag-order ulit para ma-renew ang access ninyo at makuha ang mga wellness gifts!",                                   showCoaches: true, ctaLabel: "Mag-order Ulit para Ma-renew →"             },
  other_device: { icon: "📱", title: "Ginamit na sa Ibang Device",      message: "Ang code na ito ay naka-activate na sa ibang phone. Kung ikaw ang may-ari nito, makipag-ugnayan sa inyong coach para sa bagong code.",                  showCoaches: true, ctaLabel: "Makipag-ugnayan sa Coach →"                 },
  generic:      { icon: "⚠️", title: "May Problema",                    message: "May nangyaring mali. Pakisubukan ulit o makipag-ugnayan sa inyong coach para sa tulong.",                                                               showCoaches: true, ctaLabel: "Makipag-ugnayan sa Coach →"                 },
};

function CoachList({ title, coaches }: { title: string; coaches: Coach[] }) {
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: G, margin: "0 0 14px 0", textAlign: "center" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {coaches.map((c, i) => (
          <div key={i} style={{ background: WHITE, border: "2px solid #D9D0C0", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <img src={c.photo} alt={c.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", border: `2px solid ${G}`, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: G, margin: "2px 0 0 0", fontWeight: 600 }}>R&M EaseBrew Wellness Coach</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${c.number}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: G, color: "#fff", borderRadius: 12, padding: "13px 8px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>📞 Tumawag</a>
              <a href={c.facebook} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#1877F2", color: "#fff", borderRadius: 12, padding: "13px 8px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>📘 Facebook</a>
            </div>
            <p style={{ fontSize: 13, color: MID, margin: "8px 0 0 0", textAlign: "center" }}>📱 {c.display}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("eb_device_id");
  if (!id) {
    id = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("eb_device_id", id);
  }
  return id;
}

function formatCode(val: string) {
  const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (clean.length <= 4) return clean;
  if (clean.length <= 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
}

function setSessionCookie(session: object, expiresAt: string) {
  const expires = new Date(expiresAt);
  document.cookie = `eb_session=${encodeURIComponent(JSON.stringify(session))}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

function hasValidSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.split(";").find(c => c.trim().startsWith("eb_session="));
  if (!match) return false;
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const s = JSON.parse(raw);
    return s.expires_at && new Date(s.expires_at) > new Date();
  } catch { return false; }
}

type Tab = "verify" | "gifts" | "coaches";

// Build gift label from content or fallback to default string
function buildGifts(
  productIds: number[],
  contentMap: Record<string, string>,
  defaultGifts: string[]
): string[] {
  if (!productIds.length) return [];
  const hasContent = productIds.some(id => !!contentMap[`product_${id}_name`]?.trim());
  if (!hasContent) return defaultGifts;
  const ICONS: Record<number, string> = { 1: "📊", 2: "🥗", 3: "💪", 4: "📖", 5: "🏆", 6: "🌿" };
  return productIds.map(id => {
    const name = contentMap[`product_${id}_name`]?.trim();
    return name ? `${ICONS[id] ?? "🎁"} ${name}` : defaultGifts[productIds.indexOf(id)] ?? "";
  });
}

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<Tab>("verify");
  const [showCoachesInError, setShowCoachesInError] = useState(false);

  // ── Dynamic content state ────────────────────────────────────
  const [perks, setPerks] = useState(DEFAULT_PERKS);
  const [orderUrls, setOrderUrls] = useState<Record<string, string>>({});
  const [coaches, setCoaches] = useState<Coach[]>(DEFAULT_COACHES);

  // ── Fetch public content ─────────────────────────────────────
  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(data => {
        if (!data?.content) return;
        const c = data.content as Record<string, string>;

        // Collect order URLs (tier-based keys)
        const urls: Record<string, string> = {};
        const tierKeys = ["399","699","999","1499","2998","4497","5996","7499","8994","11992","14990"];
        tierKeys.forEach(t => {
          const u = c[`order_url_${t}`]?.trim();
          if (u) urls[`order_url_${t}`] = u;
        });
        setOrderUrls(urls);

        // Override gift names per tier if content has product names
        setPerks(prev => prev.map(p => {
          const ids = TIER_TO_PRODUCT_IDS[p.tier] ?? [];
          const updatedGifts = buildGifts(ids, c, p.gifts);
          return { ...p, gifts: updatedGifts };
        }));

        // Dynamic coaches
        setCoaches(buildCoaches(c, DEFAULT_COACHES));
      })
      .catch(() => {
        // Silent fail — use defaults
      });
  }, []);

  useEffect(() => {
    if (hasValidSessionCookie()) router.push("/");
  }, [router]);

  const isComplete = code.replace(/-/g, "").length === 12;

  async function handleVerify() {
    const stripped = code.replace(/[-\s]/g, "").toUpperCase().slice(0, 12);
    const cleanCode = `${stripped.slice(0,4)}-${stripped.slice(4,8)}-${stripped.slice(8,12)}`;
    if (!isComplete) { setError("Pakiusap, i-type ang buong access code (EASE-XXXX-XXXX)."); setErrorType("generic"); return; }
    setLoading(true);
    setError("");
    setErrorType(null);
    setShowCoachesInError(false);
    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, device_id: deviceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const eType = getErrorType(data.error || "");
        setErrorType(eType);
        setError(data.error || "Hindi tama ang code. Pakisubukan ulit.");
        if (eType === "invalid" || eType === "expired") setShowCoachesInError(true);
        return;
      }
      localStorage.setItem("eb_session", JSON.stringify(data.session));
      setSessionCookie(data.session, data.session.expires_at);
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("May problema sa koneksyon. Pakisubukan ulit.");
      setErrorType("generic");
    } finally {
      setLoading(false);
    }
  }

  // ── Order button — uses tier-based URL or falls back to coaches tab ──
  function OrderButton({ perk }: { perk: typeof DEFAULT_PERKS[0] }) {
    const url = orderUrls[`order_url_${perk.tier}`];
    const btnStyle: React.CSSProperties = {
      display: "block", width: "100%", textAlign: "center",
      background: GOLD, color: G, border: "none", borderRadius: 12,
      padding: "14px 20px", fontSize: 16, fontWeight: 700,
      cursor: "pointer", fontFamily: "Georgia, serif",
      textDecoration: "none", boxSizing: "border-box",
      marginTop: 12,
    };
    if (url) {
      return <a href={url} target="_blank" rel="noopener noreferrer" style={btnStyle}>🛒 Mag-order ng {perk.label} →</a>;
    }
    return (
      <button onClick={() => setTab("coaches")} style={btnStyle}>
        🛒 Mag-order ng {perk.label} →
      </button>
    );
  }

  // ── SUCCESS SCREEN ───────────────────────────────────────────
  if (success) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>☕</div>
        <div style={{ background: G, borderRadius: "20px", padding: "32px 28px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ color: GOLD, fontSize: "28px", fontWeight: "bold", margin: "0 0 12px 0", lineHeight: 1.3 }}>Maligayang Pagdating, Nanay at Tatay!</h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", margin: "0 0 8px 0", lineHeight: 1.6 }}>Naka-unlock na ang inyong EaseBrew Wellness Hub!</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", margin: 0 }}>Sandali lang, inihahanda na namin ang lahat para sa inyo... ☕</p>
        </div>
      </div>
    </div>
  );

  const tabBtn = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      flex: 1, padding: "14px 4px", fontSize: "14px", fontWeight: "bold",
      border: "none", borderBottom: tab === t ? `4px solid ${GOLD}` : "4px solid transparent",
      background: "transparent", color: tab === t ? GOLD : "rgba(255,255,255,0.65)",
      cursor: "pointer", transition: "all 0.2s", fontFamily: "Georgia, serif",
      whiteSpace: "nowrap", overflow: "hidden",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {/* ── HERO ──────────────────────────────────────────── */}
        <div style={{ background: G, padding: "36px 28px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(125,174,47,0.2)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: 20, left: -20, width: 100, height: 100, background: "rgba(254,210,85,0.1)", borderRadius: "50%" }} />
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>☕</div>
          <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: "20px", padding: "5px 16px", fontSize: "12px", fontWeight: "bold", marginBottom: "12px", letterSpacing: 1 }}>EVERYDAY WE CARE</div>
          <h1 style={{ color: WHITE, fontSize: "26px", fontWeight: "bold", margin: "0 0 24px 0", lineHeight: 1.3 }}>Kamusta, Nanay at Tatay! 👋</h1>
          <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: "4px" }}>
            {tabBtn("verify",  "☕ I-Verify")}
            {tabBtn("gifts",   "🎁 Mga Gifts")}
            {tabBtn("coaches", "👥 Coaches")}
          </div>
        </div>

        <div style={{ padding: "28px 20px 60px" }}>

          {/* ═══ VERIFY TAB ═══════════════════════════════════ */}
          {tab === "verify" && (
            <div>
              {!errorType && (
                <div style={{ background: WHITE, borderRadius: "24px", padding: "32px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}>
                  <p style={{ fontSize: "17px", color: MID, margin: "0 0 24px 0", lineHeight: 1.65, textAlign: "center" }}>
                    I-type ang access code na ibinigay ng inyong coach.
                  </p>
                  <label style={{ fontSize: "17px", color: DARK, fontWeight: "bold", display: "block", marginBottom: "10px" }}>🔑 Access Code</label>
                  <input
                    type="text" value={code}
                    onChange={e => setCode(formatCode(e.target.value))}
                    placeholder="EASE-XXXX-XXXX" maxLength={14}
                    onKeyDown={e => e.key === "Enter" && handleVerify()}
                    style={{
                      width: "100%", padding: "18px 16px", borderRadius: "16px",
                      border: `3px solid ${isComplete ? G : "#D9D0C0"}`,
                      fontSize: "28px", fontWeight: "bold", letterSpacing: "4px",
                      textAlign: "center", outline: "none", boxSizing: "border-box",
                      color: G, fontFamily: "monospace",
                      background: isComplete ? "#F0F8F0" : WHITE, transition: "all 0.2s",
                    }}
                  />
                  <p style={{ color: "#aaa", fontSize: "15px", marginTop: "8px", textAlign: "center" }}>Format: EASE-XXXX-XXXX</p>
                  <button onClick={handleVerify} disabled={loading || !isComplete} style={{
                    width: "100%", background: isComplete ? G : "#C5B99A",
                    color: "white", border: "none", borderRadius: "16px",
                    padding: "22px", fontSize: "21px", fontWeight: "bold",
                    cursor: isComplete ? "pointer" : "not-allowed",
                    transition: "all 0.2s", marginTop: "8px",
                  }}>
                    {loading ? "Sandali lang... ☕" : "Buksan ang Aking Hub ☕"}
                  </button>
                  <div style={{ marginTop: "24px", padding: "18px 20px", background: "#F4FAF0", borderRadius: "16px", border: `2px solid ${LIGHT_G}` }}>
                    <p style={{ fontSize: "17px", fontWeight: "bold", color: G, margin: "0 0 8px 0" }}>📦 Paano makuha ang code?</p>
                    <p style={{ fontSize: "16px", color: MID, margin: 0, lineHeight: 1.7 }}>Mag-order ng EaseBrew, tapos i-message ang inyong coach. Ibibigay nila ang inyong access code.</p>
                  </div>
                  <p style={{ color: "#bbb", fontSize: "13px", textAlign: "center", marginTop: "20px" }}>
                    Walang code pa?{" "}
                    <button onClick={() => setTab("coaches")} style={{ background: "none", border: "none", color: G, fontSize: "13px", fontWeight: "bold", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "Georgia, serif" }}>
                      Makipag-ugnayan sa Coach →
                    </button>
                  </p>
                </div>
              )}

              {errorType && (() => {
                const cfg = ERROR_CONFIG[errorType] || ERROR_CONFIG.generic;
                return (
                  <div>
                    <div style={{
                      background: WHITE, borderRadius: "24px", padding: "28px 24px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                      border: `2.5px solid ${errorType === "expired" ? AMBER : errorType === "other_device" ? "#185FA5" : "#dc2626"}`,
                    }}>
                      <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <div style={{ fontSize: 52, marginBottom: 10 }}>{cfg.icon}</div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: DARK, margin: "0 0 10px 0" }}>{cfg.title}</h2>
                        <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.7 }}>{cfg.message}</p>
                      </div>
                      <div style={{ background: "#F4FAF0", borderRadius: 16, padding: "18px 20px", marginBottom: 16, border: `1.5px solid ${LIGHT_G}` }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: "0 0 10px 0" }}>🔑 Subukan ulit</p>
                        <input
                          type="text" value={code}
                          onChange={e => { setCode(formatCode(e.target.value)); setErrorType(null); setError(""); setShowCoachesInError(false); }}
                          placeholder="EASE-XXXX-XXXX" maxLength={14}
                          onKeyDown={e => e.key === "Enter" && handleVerify()}
                          style={{
                            width: "100%", padding: "14px 16px", borderRadius: "12px",
                            border: `2px solid #D9D0C0`, fontSize: "22px", fontWeight: "bold",
                            letterSpacing: "3px", textAlign: "center", outline: "none",
                            boxSizing: "border-box", color: G, fontFamily: "monospace", background: WHITE,
                          }}
                        />
                        <button onClick={handleVerify} disabled={loading || !isComplete} style={{
                          width: "100%", background: isComplete ? G : "#C5B99A",
                          color: "white", border: "none", borderRadius: "12px",
                          padding: "16px", fontSize: "17px", fontWeight: "bold",
                          cursor: isComplete ? "pointer" : "not-allowed", marginTop: 10,
                        }}>
                          {loading ? "Sandali lang... ☕" : "I-try Ulit →"}
                        </button>
                      </div>
                      {!showCoachesInError && (
                        <button
                          onClick={() => setShowCoachesInError(true)}
                          style={{ width: "100%", background: GOLD, color: G, border: "none", borderRadius: "14px", padding: "18px", fontSize: "17px", fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
                        >
                          {cfg.ctaLabel}
                        </button>
                      )}
                    </div>
                    {showCoachesInError && (
                      <CoachList
                        coaches={coaches}
                        title={errorType === "expired" ? "📞 Makipag-ugnayan sa Coach para mag-renew:" : "📞 Makipag-ugnayan sa Coach para makuha ang code:"}
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ═══ GIFTS TAB ════════════════════════════════════ */}
          {tab === "gifts" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>🎁</div>
                <h2 style={{ color: G, fontSize: "22px", fontWeight: "bold", margin: "0 0 8px 0" }}>Libreng Gifts sa Bawat Order!</h2>
                <p style={{ color: MID, fontSize: "17px", margin: 0, lineHeight: 1.6 }}>
                  Mas malaking order = mas maraming <strong style={{ color: G }}>LIBRENG</strong> gifts!
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {perks.map((p, i) => (
                  <div key={i} style={{
                    borderRadius: "16px", padding: "18px 20px",
                    background: p.highlight ? G : WHITE,
                    border: p.highlight ? `2.5px solid ${GOLD}` : `1.5px solid #D9D0C0`,
                    boxShadow: p.highlight ? "0 4px 16px rgba(57,97,59,0.2)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: p.gifts.length > 0 ? "10px" : "0" }}>
                      <span style={{ fontWeight: "bold", fontSize: "17px", color: p.highlight ? GOLD : DARK }}>{p.label}</span>
                      {p.highlight && <span style={{ background: GOLD, color: G, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "bold" }}>BEST VALUE ⭐</span>}
                    </div>

                    {p.gifts.length === 0 ? (
                      <p style={{ color: p.highlight ? "rgba(255,255,255,0.6)" : "#aaa", fontSize: "15px", margin: 0 }}>✅ {p.note}</p>
                    ) : (
                      <>
                        {p.gifts.map((g, j) => (
                          <p key={j} style={{ color: p.highlight ? "rgba(255,255,255,0.92)" : MID, fontSize: "15px", margin: "4px 0", lineHeight: 1.5 }}>
                            ✅ {g} — <strong style={{ color: p.highlight ? GOLD : G }}>LIBRE!</strong>
                          </p>
                        ))}
                        <p style={{ color: p.highlight ? "rgba(255,255,255,0.5)" : "#aaa", fontSize: "13px", margin: "8px 0 0 0" }}>{p.note}</p>
                      </>
                    )}

                    <OrderButton perk={p} />
                  </div>
                ))}
              </div>

              <button onClick={() => setTab("verify")} style={{
                marginTop: "24px", width: "100%", background: G, color: WHITE,
                border: "none", borderRadius: "16px", padding: "20px", fontSize: "19px",
                fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif",
              }}>
                ☕ I-Verify na ang Code Ko →
              </button>
            </div>
          )}

          {/* ═══ COACHES TAB ══════════════════════════════════ */}
          {tab === "coaches" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>👥</div>
                <h2 style={{ color: G, fontSize: "22px", fontWeight: "bold", margin: "0 0 8px 0" }}>Ang Aming mga Coach</h2>
                <p style={{ color: MID, fontSize: "17px", margin: 0, lineHeight: 1.6 }}>I-message o tawagan sila para mag-order o para sa mga katanungan!</p>
              </div>
              <CoachList coaches={coaches} title="Piliin ang coach na gusto ninyong kausapin:" />
              <div style={{ marginTop: "20px", background: "#FEF9E7", borderRadius: "16px", padding: "18px 20px", border: `2px solid ${GOLD}`, textAlign: "center" }}>
                <p style={{ fontSize: "17px", color: AMBER, fontWeight: "bold", margin: "0 0 6px 0" }}>💬 Huwag mag-atubili!</p>
                <p style={{ fontSize: "16px", color: MID, margin: 0, lineHeight: 1.6 }}>Lagi kaming nandito para sa inyo. Ang inyong kalusugan ang aming prayoridad. ❤️</p>
              </div>
              <button onClick={() => setTab("verify")} style={{
                marginTop: "20px", width: "100%", background: G, color: WHITE,
                border: "none", borderRadius: "16px", padding: "20px", fontSize: "19px",
                fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif",
              }}>
                ☕ I-Verify na ang Code Ko →
              </button>
              <p style={{ color: "#bbb", fontSize: "13px", textAlign: "center", marginTop: "16px" }}>R&M EaseBrew Wellness Hub © 2025</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}