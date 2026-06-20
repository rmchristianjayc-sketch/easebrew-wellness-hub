"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buildCoaches, DEFAULT_COACHES, type Coach } from "@/lib/coaches";
import { G, GOLD, LIGHT_G, CREAM, WHITE, DARK, MID, AMBER } from "@/lib/colors";
import { getDeviceId } from "@/lib/device";
import { PRICE_CONFIG } from "@/lib/price-config";
import { DEFAULT_PRODUCTS, getGiftsForTier } from "@/lib/products";

type ErrorType = "invalid" | "expired" | "other_device" | "generic" | null;
type View = "verify" | "gifts" | "coaches";

const TIER_KEYS = Object.keys(PRICE_CONFIG).map(Number).sort((a, b) => a - b);

function getErrorType(errorMsg: string): ErrorType {
  const msg = errorMsg.toLowerCase();
  if (msg.includes("expired")) return "expired";
  if (msg.includes("another device") || msg.includes("other device")) return "other_device";
  if (msg.includes("invalid") || msg.includes("not found") || msg.includes("404")) return "invalid";
  return "generic";
}

const ERROR_COPY: Record<Exclude<ErrorType, null>, { title: string; message: string; color: string }> = {
  invalid: {
    title: "Hindi nahanap ang code",
    message: "I-check kung tama ang 12 letters/numbers. Kung wala ka pang code, tawagan o i-message ang coach.",
    color: "#dc2626",
  },
  expired: {
    title: "Expired na ang code",
    message: "Tawagan ang coach para ma-renew ang access at makakuha ng bagong code.",
    color: AMBER,
  },
  other_device: {
    title: "Ginamit na sa ibang phone",
    message: "Para sa seguridad, isang phone lang ang bawat code. Makipag-ugnayan sa coach kung kailangan ng tulong.",
    color: "#185FA5",
  },
  generic: {
    title: "Hindi pa kumpleto ang code",
    message: "Ilagay ang buong format: EASE-XXXX-XXXX.",
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

function buildPerks(content: Record<string, string>) {
  return TIER_KEYS.map((tier) => {
    const cfg = PRICE_CONFIG[tier];
    return {
      tier,
      label: cfg.label,
      note: `${cfg.validityDays} araw na access sa Wellness Hub`,
      gifts: getGiftsForTier(DEFAULT_PRODUCTS, tier).map((gift) => {
        const match = DEFAULT_PRODUCTS.find((product) => gift.includes(product.name));
        if (!match) return gift;
        const name = content[`product_${match.id}_name`]?.trim() || match.name;
        return `${match.icon} ${name}`;
      }),
      highlight: tier === 5996,
    };
  });
}

function CoachList({ coaches }: { coaches: Coach[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {coaches.map((coach) => (
        <div key={coach.name} style={{ background: WHITE, border: "2px solid #D9D0C0", borderRadius: 18, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Image
              src={coach.photo}
              alt={coach.name}
              width={56}
              height={56}
              style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover", border: `2px solid ${G}`, flexShrink: 0 }}
            />
            <div>
              <p style={{ fontSize: 19, fontWeight: 800, color: DARK, margin: 0 }}>{coach.name}</p>
              <p style={{ fontSize: 14, color: G, margin: "3px 0 0", fontWeight: 700 }}>EaseBrew Wellness Coach</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href={`tel:${coach.number}`} style={coachActionStyle(G, "#fff")}>Tumawag</a>
            <a href={coach.facebook} target="_blank" rel="noopener noreferrer" style={coachActionStyle("#1877F2", "#fff")}>Facebook</a>
          </div>
          <p style={{ fontSize: 15, color: MID, margin: "10px 0 0", textAlign: "center" }}>{coach.display}</p>
        </div>
      ))}
    </div>
  );
}

function coachActionStyle(background: string, color: string): React.CSSProperties {
  return {
    minHeight: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    background,
    color,
    fontSize: 17,
    fontWeight: 800,
    textDecoration: "none",
  };
}

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [view, setView] = useState<View>("verify");
  const [content, setContent] = useState<Record<string, string>>({});
  const [coaches, setCoaches] = useState<Coach[]>(DEFAULT_COACHES);
  const [orderUrls, setOrderUrls] = useState<Record<string, string>>({});

  const isComplete = code.replace(/-/g, "").length === 12;
  const perks = useMemo(() => buildPerks(content), [content]);
  const primaryCoach = coaches[0];
  const visibleError = errorType ? ERROR_COPY[errorType] : null;

  useEffect(() => {
    fetch("/api/content")
      .then((response) => response.json())
      .then((data) => {
        const map = (data?.content ?? {}) as Record<string, string>;
        setContent(map);
        setCoaches(buildCoaches(map, DEFAULT_COACHES));

        const urls: Record<string, string> = {};
        TIER_KEYS.forEach((tier) => {
          const url = map[`order_url_${tier}`]?.trim();
          if (url) urls[`order_url_${tier}`] = url;
        });
        setOrderUrls(urls);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((response) => {
        if (response.ok) router.replace(getReturnPath());
      })
      .catch(() => {});
  }, [router]);

  async function handleVerify() {
    if (!isComplete) {
      setErrorType("generic");
      return;
    }

    const stripped = code.replace(/[-\s]/g, "").toUpperCase().slice(0, 12);
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

      if (!response.ok) {
        setErrorType(getErrorType(data.error || ""));
        return;
      }

      setSuccess(true);
      setTimeout(() => router.replace(getReturnPath()), 900);
    } catch {
      setErrorType("generic");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main style={{ minHeight: "100dvh", background: CREAM, display: "grid", placeItems: "center", padding: 22, fontFamily: "Georgia, serif" }}>
        <section style={{ width: "100%", maxWidth: 420, background: G, borderRadius: 24, padding: "36px 26px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 54, marginBottom: 10 }}>☕</div>
          <h1 style={{ color: GOLD, fontSize: 30, lineHeight: 1.2, margin: "0 0 12px", fontWeight: 800 }}>Bukas na ang inyong Hub</h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, margin: 0 }}>Sandali lang po. Ihahanda namin ang wellness guide ninyo.</p>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: CREAM, fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", paddingBottom: 84 }}>
        <header style={{ background: G, color: "#fff", padding: "28px 22px 22px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 900, letterSpacing: 0.8 }}>
            R&M EaseBrew
          </div>
          <h1 style={{ fontSize: 30, lineHeight: 1.18, margin: "16px 0 8px", fontWeight: 900 }}>Buksan ang Wellness Hub</h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, margin: 0, opacity: 0.92 }}>Ilagay lang po ang code na binigay ng inyong coach.</p>
        </header>

        <div style={{ padding: 18 }}>
          {view === "verify" && (
            <section style={{ background: WHITE, borderRadius: 24, padding: "26px 20px", boxShadow: "0 10px 34px rgba(27,32,26,0.10)" }}>
              <label htmlFor="access-code" style={{ display: "block", fontSize: 19, fontWeight: 900, color: DARK, marginBottom: 10 }}>
                Access Code
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(formatCode(event.target.value));
                  if (errorType) setErrorType(null);
                }}
                onKeyDown={(event) => event.key === "Enter" && handleVerify()}
                placeholder="EASE-XXXX-XXXX"
                maxLength={14}
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="one-time-code"
                style={{
                  width: "100%",
                  minHeight: 72,
                  padding: "16px 12px",
                  borderRadius: 18,
                  border: `3px solid ${isComplete ? G : "#D8CDBA"}`,
                  background: isComplete ? "#F0F8F0" : WHITE,
                  color: G,
                  fontFamily: "monospace",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 3,
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <p style={{ color: MID, fontSize: 16, lineHeight: 1.5, textAlign: "center", margin: "10px 0 0" }}>
                Halimbawa: EASE-ABCD-1234
              </p>

              {visibleError && (
                <div role="alert" style={{ marginTop: 16, border: `2px solid ${visibleError.color}`, background: "#fff8f4", borderRadius: 16, padding: 16 }}>
                  <p style={{ color: visibleError.color, fontSize: 18, fontWeight: 900, margin: "0 0 6px" }}>{visibleError.title}</p>
                  <p style={{ color: DARK, fontSize: 16, lineHeight: 1.6, margin: 0 }}>{visibleError.message}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || !isComplete}
                style={{
                  width: "100%",
                  minHeight: 66,
                  marginTop: 18,
                  border: 0,
                  borderRadius: 18,
                  background: isComplete ? G : "#BFAF8F",
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: isComplete ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "Sandali lang..." : "Buksan ang Aking Hub"}
              </button>

              <div style={{ marginTop: 20, background: "#F4FAF0", border: `2px solid ${LIGHT_G}`, borderRadius: 18, padding: 16 }}>
                <p style={{ color: G, fontSize: 18, fontWeight: 900, margin: "0 0 8px" }}>Wala pang code?</p>
                <p style={{ color: MID, fontSize: 17, lineHeight: 1.6, margin: 0 }}>Mag-order ng EaseBrew, tapos i-message o tawagan ang coach para ibigay ang access code.</p>
                <button type="button" onClick={() => setView("coaches")} style={{ ...secondaryButtonStyle, marginTop: 14 }}>
                  Makipag-ugnayan sa Coach
                </button>
              </div>
            </section>
          )}

          {view === "gifts" && (
            <section>
              <h2 style={sectionTitleStyle}>Mga Packages at Free Gifts</h2>
              <p style={sectionLeadStyle}>Piliin ang package. Mas mataas na package, mas maraming unlocked wellness tools.</p>
              <div style={{ display: "grid", gap: 12 }}>
                {perks.map((perk) => {
                  const url = orderUrls[`order_url_${perk.tier}`];
                  return (
                    <div key={perk.tier} style={{ background: perk.highlight ? G : WHITE, color: perk.highlight ? "#fff" : DARK, border: `2px solid ${perk.highlight ? GOLD : "#D9D0C0"}`, borderRadius: 18, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <h3 style={{ fontSize: 19, margin: 0, color: perk.highlight ? GOLD : DARK }}>{perk.label}</h3>
                        {perk.highlight && <span style={{ background: GOLD, color: G, borderRadius: 999, padding: "4px 9px", fontSize: 12, fontWeight: 900 }}>BEST</span>}
                      </div>
                      <p style={{ fontSize: 15, opacity: 0.78, margin: "6px 0 10px" }}>{perk.note}</p>
                      {perk.gifts.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 5, fontSize: 16, lineHeight: 1.5 }}>
                          {perk.gifts.map((gift) => <li key={gift}>{gift}</li>)}
                        </ul>
                      ) : (
                        <p style={{ color: perk.highlight ? "rgba(255,255,255,0.78)" : MID, fontSize: 16, margin: 0 }}>Basic hub access</p>
                      )}
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ ...primaryLinkStyle, marginTop: 14 }}>Mag-order nito</a>
                      ) : (
                        <button type="button" onClick={() => setView("coaches")} style={{ ...primaryButtonStyle, marginTop: 14 }}>Mag-order sa Coach</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {view === "coaches" && (
            <section>
              <h2 style={sectionTitleStyle}>Kausapin ang Coach</h2>
              <p style={sectionLeadStyle}>Para sa order, code, renewal, o tulong sa paggamit ng hub.</p>
              <CoachList coaches={coaches} />
            </section>
          )}
        </div>
      </div>

      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, background: "#244d32", borderTop: "1px solid rgba(255,255,255,0.12)", padding: "6px 8px max(6px, env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {navButton("verify", "Code", view, setView)}
        {navButton("gifts", "Gifts", view, setView)}
        {navButton("coaches", "Coach", view, setView)}
      </nav>

      {primaryCoach && view !== "coaches" && (
        <button
          type="button"
          onClick={() => setView("coaches")}
          style={{ position: "fixed", right: 14, bottom: 86, zIndex: 31, border: 0, background: GOLD, color: G, borderRadius: 999, padding: "12px 16px", boxShadow: "0 8px 24px rgba(27,32,26,0.22)", fontSize: 15, fontWeight: 900, cursor: "pointer" }}
        >
          Coaches
        </button>
      )}
    </main>
  );
}

function navButton(viewName: View, label: string, active: View, setView: (view: View) => void) {
  const selected = active === viewName;
  return (
    <button
      type="button"
      onClick={() => setView(viewName)}
      style={{
        minHeight: 56,
        border: 0,
        borderRadius: 12,
        background: selected ? "rgba(254,210,85,0.14)" : "transparent",
        color: selected ? GOLD : "rgba(255,255,255,0.82)",
        fontSize: 16,
        fontWeight: 900,
      }}
    >
      {label}
    </button>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  color: G,
  fontSize: 26,
  lineHeight: 1.2,
  margin: "0 0 8px",
  fontWeight: 900,
};

const sectionLeadStyle: React.CSSProperties = {
  color: MID,
  fontSize: 17,
  lineHeight: 1.6,
  margin: "0 0 18px",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 54,
  border: 0,
  borderRadius: 14,
  background: GOLD,
  color: G,
  fontSize: 17,
  fontWeight: 900,
  cursor: "pointer",
};

const primaryLinkStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
};

const secondaryButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 54,
  border: `2px solid ${G}`,
  borderRadius: 14,
  background: WHITE,
  color: G,
  fontSize: 17,
  fontWeight: 900,
  cursor: "pointer",
};
