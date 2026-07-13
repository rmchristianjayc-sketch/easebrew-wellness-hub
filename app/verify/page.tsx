"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buildCoaches, DEFAULT_COACHES, type Coach } from "@/lib/coaches";
import { G, GOLD, WHITE, DARK, MID, AMBER } from "@/lib/colors";
import { getDeviceId } from "@/lib/device";
import { PRICE_CONFIG } from "@/lib/price-config";
import { DEFAULT_PRODUCTS } from "@/lib/products";
import { Gift, KeyRound, Phone, HeartPulse, UtensilsCrossed, Dumbbell, Crown, Activity, Pill, IdCard, Coffee, MessageCircle, Lock, CircleCheck, Leaf } from "lucide-react";

type ErrorType = "invalid" | "expired" | "other_device" | "incomplete" | "server" | null;
type View = "verify" | "gifts" | "coaches";

const TIER_KEYS = Object.keys(PRICE_CONFIG).map(Number).sort((a, b) => a - b);

function getErrorType(errorMsg: string): ErrorType {
  const msg = errorMsg.toLowerCase();
  if (msg.includes("expired")) return "expired";
  if (msg.includes("another device") || msg.includes("other device")) return "other_device";
  if (msg.includes("invalid") || msg.includes("not found") || msg.includes("404")) return "invalid";
  return "server";
}

const ERROR_COPY: Record<Exclude<ErrorType, null>, { title: string; message: string; color: string }> = {
  invalid: {
    title: "Hindi nakita ang code",
    message: "Tignan kung tama ang 12 letters/numbers. Kung wala ka pang code, tawagan o i-message ang coach mo.",
    color: "#dc2626",
  },
  expired: {
    title: "Expired na ang code",
    message: "I-contact ang coach mo para ma-renew ang access at makakuha ng bagong code.",
    color: AMBER,
  },
  other_device: {
    title: "Ginamit na sa ibang phone",
    message: "Para sa security, isang phone lang ang pwede sa bawat code. I-contact ang coach mo kung kailangan mo ng tulong.",
    color: "#185FA5",
  },
  incomplete: {
    title: "Hindi kumpleto ang code",
    message: "Ilagay ang buong format: EASE-XXXX-XXXX.",
    color: AMBER,
  },
  server: {
    title: "May problema sa verification",
    message: "Subukan ulit. Kung paulit-ulit, i-contact ang coach mo.",
    color: AMBER,
  },
};

function formatCode(value: string) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (clean.length <= 4) return clean;
  if (clean.length <= 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
}

function getReturnPath() {
  if (typeof window === "undefined") return "/";
  const path = new URLSearchParams(window.location.search).get("from");
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/";
}

const PRODUCT_ICONS: Record<number, { icon: typeof HeartPulse; bg: string }> = {
  1: { icon: HeartPulse,       bg: "#E74C3C" },
  2: { icon: UtensilsCrossed,  bg: "#27AE60" },
  3: { icon: Dumbbell,         bg: "#2980B9" },
  4: { icon: Crown,            bg: "#F39C12" },
};

const FREE_TOOLS = [
  { name: "Blood Pressure Log",    icon: Activity, bg: "#8E44AD" },
  { name: "Gamot Log",             icon: Pill,     bg: "#E67E22" },
  { name: "Medical Info Card",     icon: IdCard,   bg: "#16A085" },
];

function buildPerks(content: Record<string, string>) {
  const BASE = 399;
  return TIER_KEYS.map((tier) => {
    const cfg = PRICE_CONFIG[tier];
    const perPack = Math.round(tier / cfg.packs);
    const saved = cfg.packs * BASE - tier;
    const pct = Math.round((saved / (cfg.packs * BASE)) * 100);
    const unlocked = DEFAULT_PRODUCTS.filter(p => p.tier <= tier && p.tier > 0);
    return {
      tier,
      label: cfg.label,
      note: `${cfg.validityDays} araw na access sa Wellness Hub`,
      products: unlocked.map(p => {
        const tagalogNames: Record<number, string> = {
          1: "Daily Health Tracker",
          2: "Meal Plan + Recipe Book",
          3: "Home Exercise Guide",
          4: "Complete Wellness Program",
        };
        return {
          id: p.id,
          name: content[`product_${p.id}_name`]?.trim() || tagalogNames[p.id] || p.name,
        };
      }),
      highlight: tier === 5996,
      badge: cfg.packs >= 30 ? "Premium Member" : cfg.packs >= 20 ? "VIP Member" : null,
      perPack,
      saved,
      savePct: pct,
    };
  });
}

function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className="c-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <Image
          src={coach.photo}
          alt={coach.name}
          width={80}
          height={80}
          style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: `3px solid ${G}`, flexShrink: 0 }}
        />
        <div>
          <p style={{ fontSize: 22, fontWeight: 900, color: DARK, margin: 0, fontFamily: "Georgia, serif" }}>{coach.name}</p>
          <p style={{ fontSize: 16, color: G, margin: "4px 0 0", fontWeight: 700, fontFamily: "Georgia, serif" }}>EaseBrew Wellness Guide</p>
          <p className="c-body" style={{ margin: "3px 0 0" }}>{coach.display}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <a href={`tel:${coach.number}`} className="c-btn c-btn-green" style={{ textDecoration: "none" }}>
          <Phone size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Call
        </a>
        <a href={coach.facebook} target="_blank" rel="noopener noreferrer" className="c-btn c-btn-fb" style={{ textDecoration: "none" }}>
          <MessageCircle size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Facebook
        </a>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [view, setView]         = useState<View>("verify");
  const [content, setContent]   = useState<Record<string, string>>({});
  const [coaches, setCoaches]   = useState<Coach[]>(DEFAULT_COACHES);
  const [imgError, setImgError] = useState(false);

  const isComplete    = code.replace(/-/g, "").length === 12;
  const perks         = useMemo(() => buildPerks(content), [content]);
  const visibleError  = errorType ? ERROR_COPY[errorType] : null;

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(data => {
      const map = (data?.content ?? {}) as Record<string, string>;
      setContent(map);
      setCoaches(buildCoaches(map, DEFAULT_COACHES));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then(r => { if (r.ok) router.replace(getReturnPath()); })
      .catch(() => {});
  }, [router]);

  // ── AUTO-FILL FROM ?code= QUERY PARAM ──
  // Admin/coach shares a link like /verify?code=EASE-A3F2-9K1X and the
  // customer just taps Continue — no manual typing of the 12-char code.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("code");
    if (q) {
      const formatted = formatCode(q);
      if (formatted) setCode(formatted);
    }
  }, []);

  async function handleVerify() {
    if (!isComplete) { setErrorType("incomplete"); return; }
    const stripped  = code.replace(/[-\s]/g, "").toUpperCase().slice(0, 12);
    const cleanCode = `${stripped.slice(0, 4)}-${stripped.slice(4, 8)}-${stripped.slice(8, 12)}`;
    setLoading(true);
    setErrorType(null);
    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, device_id: getDeviceId() }),
      });
      const data = await response.json();
      if (!response.ok) { setErrorType(getErrorType(data.error || "")); return; }
      setSuccess(true);
      setTimeout(() => router.replace(getReturnPath()), 1000);
    } catch {
      setErrorType("server");
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="customer-shell" style={{ background: G, display: "grid", placeItems: "center", padding: 24 }}>
        <section style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: 22, background: "rgba(254,210,85,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><Coffee size={48} color={GOLD} /></div>
          <h1 className="c-heading" style={{ color: GOLD, margin: "0 0 18px" }}>
            Bukas na ang Hub mo!
          </h1>
          <p className="c-body" style={{ color: "rgba(255,255,255,0.88)", textAlign: "center" }}>
            Sandali lang. Ini-prepare na ang wellness guide mo.
          </p>
          <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 10 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: GOLD, opacity: 0.4 }} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <main className="customer-shell" style={{ position: "relative" }}>
      {/* Faint background image */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <Image src="/images/verify-bg.jpg" alt="" fill style={{ objectFit: "cover", opacity: 0.07 }} priority />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>

          {/* ── Hero Banner ── */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden", background: G }}>
            {!imgError ? (
              <Image src="/images/hero-product.jpg" alt="EaseBrew Herbal Coffee" fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                onError={() => setImgError(true)} priority
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div><Coffee size={64} color={GOLD} /></div>
                <div style={{ color: GOLD, fontWeight: 900, fontSize: 24, letterSpacing: 1, fontFamily: "Georgia, serif" }}>EaseBrew</div>
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(24,59,40,0.25) 0%, rgba(24,59,40,0.72) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "22px 22px" }}>
              <p style={{ fontSize: 14, color: GOLD, fontWeight: 800, margin: "0 0 6px", fontFamily: "Georgia, serif", letterSpacing: "0.5px", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                R&amp;M EaseBrew Wellness Hub
              </p>
              <h1 className="c-heading" style={{ color: "#fff", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                Buksan ang Wellness Hub Mo
              </h1>
            </div>
          </div>

          <div style={{ padding: "0 18px", paddingBottom: 90 }}>
            <p className="c-body" style={{ textAlign: "center", padding: "18px 0", margin: 0 }}>
              Ilagay ang code mula sa coach mo para ma-access ang wellness guide mo.
            </p>

            {/* ── Verify View ── */}
            {view === "verify" && (
              <section className="c-card">
                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: G, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 16, flexShrink: 0, fontFamily: "Georgia, serif" }}>1</div>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: isComplete ? G : "#E0D8C8" }} />
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: isComplete ? G : "#E0D8C8", color: isComplete ? "#fff" : MID, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 16, flexShrink: 0, fontFamily: "Georgia, serif" }}>2</div>
                </div>

                <label htmlFor="access-code" className="c-label" style={{ fontSize: 22 }}>
                  Ilagay ang Access Code
                </label>

                <input
                  id="access-code"
                  type="text"
                  value={code}
                  onChange={e => { setCode(formatCode(e.target.value)); if (errorType) setErrorType(null); }}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  placeholder="EASE-ABCD-1234"
                  maxLength={14}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="one-time-code"
                  style={{
                    width: "100%", minHeight: 64, padding: "14px 8px",
                    borderRadius: 20,
                    border: `3px solid ${isComplete ? G : errorType ? "#dc2626" : "#D8CDBA"}`,
                    background: isComplete ? "#F0F8F0" : WHITE,
                    color: G, fontFamily: "monospace", fontSize: "clamp(18px, 5.5vw, 26px)", fontWeight: 900,
                    letterSpacing: "clamp(1px, 0.8vw, 4px)", textAlign: "center", outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: isComplete
                      ? `0 0 0 4px ${G}18, 0 4px 16px rgba(57,97,59,0.15)`
                      : errorType
                        ? "0 0 0 4px rgba(220,38,38,0.12)"
                        : "0 2px 10px rgba(0,0,0,0.06)",
                  }}
                />
                <p className="c-body" style={{ textAlign: "center", margin: "10px 0 0" }}>
                  Halimbawa: <strong style={{ fontFamily: "monospace", letterSpacing: 3 }}>EASE-ABCD-1234</strong>
                </p>

                {visibleError && (
                  <div role="alert" style={{ marginTop: 18, border: `2.5px solid ${visibleError.color}`, background: "#fff8f4", borderRadius: 16, padding: "16px 18px" }}>
                    <p className="c-label" style={{ color: visibleError.color, margin: "0 0 6px" }}>{visibleError.title}</p>
                    <p className="c-body" style={{ margin: 0 }}>{visibleError.message}</p>
                  </div>
                )}

                <button type="button" onClick={handleVerify} disabled={loading || !isComplete}
                  className={`c-btn ${isComplete ? "c-btn-green" : ""}`}
                  style={{ marginTop: 20, opacity: isComplete ? 1 : 0.55, background: isComplete ? G : "#BFAF8F" }}>
                  {loading ? "Sandali lang..." : "Buksan ang Hub Ko"}
                </button>

                {/* Wala pang code */}
                <div style={{ marginTop: 22, background: "#FEF9EE", border: `2px solid ${GOLD}`, borderRadius: 18, padding: "18px 20px" }}>
                  <p className="c-label" style={{ margin: "0 0 8px" }}>Wala ka pang code?</p>
                  <p className="c-body" style={{ margin: "0 0 14px" }}>
                    Mag-order ng EaseBrew, tapos i-contact ang coach mo para makuha ang access code.
                  </p>
                  <button type="button" onClick={() => setView("coaches")} className="c-btn c-btn-outline">
                    <Phone size={16} style={{ display: "inline", verticalAlign: "middle" }} /> I-contact ang Coach
                  </button>
                </div>

                {/* Trust badges */}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { icon: <Lock size={14} />, label: "Ligtas" },
                    { icon: <CircleCheck size={14} />, label: "Halal" },
                    { icon: <Leaf size={14} />, label: "100% Natural" },
                  ].map(badge => (
                    <span key={badge.label} className="c-caption" style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>{badge.icon} {badge.label}</span>
                  ))}
                </div>
              </section>
            )}

            {/* ── Gifts View ── */}
            {view === "gifts" && (
              <section>
                <h2 className="c-title" style={{ margin: "18px 0 8px" }}>Mga Package at Libreng Regalo</h2>
                <p className="c-body" style={{ margin: "0 0 18px" }}>Mas mataas na package, mas maraming wellness tools para sayo.</p>
                <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
                  {perks.map(perk => {
                    return (
                      <div key={perk.tier} style={{
                        background: perk.highlight ? G : WHITE,
                        color: perk.highlight ? "#fff" : DARK,
                        border: `2px solid ${perk.highlight ? GOLD : "#D9D0C0"}`,
                        borderRadius: 20, padding: 22,
                        boxShadow: perk.highlight ? "0 8px 24px rgba(24,59,40,0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <h3 style={{ fontSize: 22, margin: 0, fontWeight: 900, color: perk.highlight ? GOLD : DARK, fontFamily: "Georgia, serif" }}>{perk.label}</h3>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {perk.badge && <span style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", color: "#1a1a1a", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}><Crown size={12} /> {perk.badge}</span>}
                            {perk.highlight && <span style={{ background: GOLD, color: G, borderRadius: 999, padding: "5px 12px", fontSize: 13, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 4 }}><Crown size={13} /> BEST</span>}
                          </div>
                        </div>
                        <p style={{ fontSize: 16, opacity: 0.78, margin: "0 0 4px", fontFamily: "Georgia, serif", lineHeight: 1.6 }}>{perk.note}</p>
                        {perk.saved > 0 && (
                          <p style={{ fontSize: 14, margin: "0 0 12px", fontFamily: "Georgia, serif", color: perk.highlight ? "#90EE90" : "#2E8B57", fontWeight: 700 }}>
                            ₱{perk.perPack}/pack · Save ₱{perk.saved.toLocaleString()} ({perk.savePct}% off)
                          </p>
                        )}
                        {perk.saved === 0 && <div style={{ marginBottom: 12 }} />}
                        {/* Paid products unlocked */}
                        {perk.products.length > 0 && (
                          <div style={{ display: "grid", gap: 8, margin: "0 0 12px" }}>
                            {perk.products.map(p => {
                              const meta = PRODUCT_ICONS[p.id];
                              if (!meta) return null;
                              const Icon = meta.icon;
                              return (
                                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={18} color="#fff" />
                                  </div>
                                  <span style={{ fontSize: 16, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>{p.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Free tools — included in every package */}
                        <p style={{ fontSize: 13, fontWeight: 700, margin: perk.products.length > 0 ? "4px 0 6px" : "0 0 6px", opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>Libreng Health Tools</p>
                        <div style={{ display: "grid", gap: 6, margin: "0 0 16px" }}>
                          {FREE_TOOLS.map(tool => {
                            const FIcon = tool.icon;
                            return (
                              <div key={tool.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 7, background: tool.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.85 }}>
                                  <FIcon size={15} color="#fff" />
                                </div>
                                <span style={{ fontSize: 14, fontFamily: "Georgia, serif", lineHeight: 1.3, opacity: 0.85 }}>{tool.name}</span>
                              </div>
                            );
                          })}
                        </div>
                        <button type="button" onClick={() => setView("coaches")} className="c-btn c-btn-gold">
                          <Phone size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Mag-order sa Coach
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Coaches View ── */}
            {view === "coaches" && (
              <section>
                <h2 className="c-title" style={{ margin: "18px 0 8px" }}>Kausapin ang Coach</h2>
                <p className="c-body" style={{ margin: "0 0 18px" }}>Para sa orders, codes, renewal, o tulong sa hub. Lagi kaming nandito para sayo.</p>
                {coaches.map(coach => <CoachCard key={coach.name} coach={coach} />)}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="customer-home-nav" style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
        background: "#183b28", borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "6px 8px max(6px, env(safe-area-inset-bottom))",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4,
      }}>
        {([
          ["verify",  KeyRound, "Code"],
          ["gifts",   Gift,     "Packages"],
          ["coaches", Phone,    "Coach"],
        ] as const).map(([v, Icon, label]) => {
          const active = view === v;
          return (
            <button key={v} type="button" onClick={() => setView(v)} style={{
              minHeight: 60, border: 0, borderRadius: 12,
              background: active ? "rgba(254,210,85,0.15)" : "transparent",
              color: active ? GOLD : "rgba(255,255,255,0.72)",
              fontFamily: "Georgia, serif", fontSize: "clamp(11px, 3.5vw, 14px)", fontWeight: 700, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
            }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}
