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

const PERKS = [
  { tier: 399,   packs: 1,  label: "1 Pack — ₱399",      gifts: [],                                                                                                                                            note: "15 araw na access sa Wellness Hub",       highlight: false },
  { tier: 699,   packs: 2,  label: "2 Packs — ₱699",     gifts: [],                                                                                                                                            note: "25 araw na access sa Wellness Hub",       highlight: false },
  { tier: 999,   packs: 3,  label: "3 Packs — ₱999",     gifts: ["📊 Body Pain Tracker + Journal"],                                                                                                            note: "35 araw na access",                       highlight: false },
  { tier: 1499,  packs: 5,  label: "5 Packs — ₱1,499",   gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide"],                                                        note: "55 araw na access",                       highlight: false },
  { tier: 2998,  packs: 10, label: "10 Packs — ₱2,998",  gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book"],                                note: "105 araw na access",                      highlight: false },
  { tier: 4497,  packs: 15, label: "15 Packs — ₱4,497",  gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Bagong Katawan Program"], note: "155 araw na access",                  highlight: false },
  { tier: 5996,  packs: 20, label: "20 Packs — ₱5,996",  gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Program", "🌿 VIP Wellness Bundle"], note: "205 araw na access",             highlight: false },
  { tier: 7499,  packs: 25, label: "25 Packs — ₱7,499",  gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Program", "🌿 VIP Wellness Bundle"], note: "255 araw na access",             highlight: false },
  { tier: 8994,  packs: 30, label: "30 Packs — ₱8,994",  gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Program", "🌿 VIP Wellness Bundle"], note: "305 araw na access",             highlight: false },
  { tier: 11992, packs: 40, label: "40 Packs — ₱11,992", gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Program", "🌿 VIP Wellness Bundle"], note: "405 araw na access",             highlight: false },
  { tier: 14990, packs: 50, label: "50 Packs — ₱14,990", gifts: ["📊 Body Pain Tracker + Journal", "🥗 50-Day Meal Plan", "💪 30-Day Exercise Guide", "📖 Pinoy Recipe Book", "🏆 90-Day Program", "🌿 VIP Wellness Bundle"], note: "505 araw na access — LAHAT UNLOCKED! 🎉", highlight: true },
];

const COACHES = [
  { name: "Coach Josephine", number: "0917 701 1252", facebook: "https://www.facebook.com/josephine.easebrew.main", photo: "/coaches/josephine.jpg" },
  { name: "Coach Niña",      number: "0968 880 4440", facebook: "https://www.facebook.com/easebrew.nina",           photo: "/coaches/niña.jpg" },
  { name: "Coach Mark",      number: "0917 117 8216", facebook: "https://www.facebook.com/profile.php?id=61577427472374", photo: "/coaches/mark.jpg" },
  { name: "Coach Rai",       number: "0970 968 9164", facebook: "https://www.facebook.com/profile.php?id=61579641330542", photo: "/coaches/rai.jpg" },
  { name: "Coach Jo Ann",    number: "0951 685 1019", facebook: "https://www.facebook.com/profile.php?id=61590474596913", photo: "/coaches/joann.jpg" },
  { name: "Coach Mike",      number: "0951 598 6840", facebook: "https://www.facebook.com/profile.php?id=61576324811239", photo: "/coaches/mike.jpg" },
];

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
    const session = JSON.parse(raw);
    return session.expires_at && new Date(session.expires_at) > new Date();
  } catch { return false; }
}

type Tab = "verify" | "gifts" | "coaches";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<Tab>("verify");

  useEffect(() => {
    if (hasValidSessionCookie()) router.push("/");
  }, [router]);

  const isComplete = code.replace(/-/g, "").length === 12;

  async function handleVerify() {
    const stripped = code.replace(/[-\s]/g, "").toUpperCase().slice(0, 12);
    const cleanCode = `${stripped.slice(0,4)}-${stripped.slice(4,8)}-${stripped.slice(8,12)}`;
    if (!isComplete) { setError("Pakiusap, i-type ang buong access code (EASE-XXXX-XXXX)."); return; }
    setLoading(true);
    setError("");
    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, device_id: deviceId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Hindi tama ang code. Pakisubukan ulit."); return; }
      localStorage.setItem("eb_session", JSON.stringify(data.session));
      setSessionCookie(data.session, data.session.expires_at);
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("May problema sa koneksyon. Pakisubukan ulit.");
    } finally {
      setLoading(false);
    }
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────────
  if (success) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>☕</div>
        <div style={{ background: G, borderRadius: "20px", padding: "32px 28px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ color: GOLD, fontSize: "28px", fontWeight: "bold", margin: "0 0 12px 0", lineHeight: 1.3 }}>
            Maligayang Pagdating, Nanay at Tatay!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", margin: "0 0 8px 0", lineHeight: 1.6 }}>
            Naka-unlock na ang inyong EaseBrew Wellness Hub!
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", margin: 0 }}>
            Sandali lang, inihahanda na namin ang lahat para sa inyo... ☕
          </p>
        </div>
      </div>
    </div>
  );

  // ── TAB BUTTON STYLE ─────────────────────────────────────────
  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        flex: 1,
        padding: "16px 8px",
        fontSize: "17px",
        fontWeight: "bold",
        border: "none",
        borderBottom: tab === t ? `4px solid ${GOLD}` : "4px solid transparent",
        background: "transparent",
        color: tab === t ? GOLD : "rgba(255,255,255,0.65)",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "Georgia, serif",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div style={{ background: G, padding: "36px 28px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(125,174,47,0.2)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: 20, left: -20, width: 100, height: 100, background: "rgba(254,210,85,0.1)", borderRadius: "50%" }} />
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>☕</div>
          <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: "20px", padding: "5px 16px", fontSize: "12px", fontWeight: "bold", marginBottom: "12px", letterSpacing: 1 }}>
            EVERYDAY WE CARE
          </div>
          <h1 style={{ color: WHITE, fontSize: "26px", fontWeight: "bold", margin: "0 0 24px 0", lineHeight: 1.3 }}>
            Kamusta, Nanay at Tatay! 👋
          </h1>

          {/* ── TABS ───────────────────────────────────────────── */}
          <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: "4px" }}>
            {tabBtn("verify",  "☕ I-Verify")}
            {tabBtn("gifts",   "🎁 Mga Gifts")}
            {tabBtn("coaches", "👥 Coaches")}
          </div>
        </div>

        {/* ── TAB CONTENT ──────────────────────────────────────── */}
        <div style={{ padding: "28px 20px 60px" }}>

          {/* ═══ VERIFY TAB ═══════════════════════════════════════ */}
          {tab === "verify" && (
            <div style={{ background: WHITE, borderRadius: "24px", padding: "32px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}>
              <p style={{ fontSize: "17px", color: MID, margin: "0 0 24px 0", lineHeight: 1.65, textAlign: "center" }}>
                I-type ang access code na ibinigay ng inyong coach.
              </p>

              <label style={{ fontSize: "17px", color: DARK, fontWeight: "bold", display: "block", marginBottom: "10px" }}>
                🔑 Access Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(formatCode(e.target.value))}
                placeholder="EASE-XXXX-XXXX"
                maxLength={14}
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
              <p style={{ color: "#aaa", fontSize: "15px", marginTop: "8px", textAlign: "center" }}>
                Format: EASE-XXXX-XXXX
              </p>

              {error && (
                <div style={{ background: "#fff0f0", border: "2px solid #ffcccc", borderRadius: "12px", padding: "14px 18px", color: "#cc0000", fontSize: "17px", margin: "16px 0", lineHeight: 1.5 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || !isComplete}
                style={{
                  width: "100%", background: isComplete ? G : "#C5B99A",
                  color: "white", border: "none", borderRadius: "16px",
                  padding: "22px", fontSize: "21px", fontWeight: "bold",
                  cursor: isComplete ? "pointer" : "not-allowed",
                  transition: "all 0.2s", marginTop: "8px",
                }}
              >
                {loading ? "Sandali lang... ☕" : "Buksan ang Aking Hub ☕"}
              </button>

              <div style={{ marginTop: "24px", padding: "18px 20px", background: "#F4FAF0", borderRadius: "16px", border: `2px solid ${LIGHT_G}` }}>
                <p style={{ fontSize: "17px", fontWeight: "bold", color: G, margin: "0 0 8px 0" }}>
                  📦 Paano makuha ang code?
                </p>
                <p style={{ fontSize: "16px", color: MID, margin: 0, lineHeight: 1.7 }}>
                  Mag-order ng EaseBrew, tapos i-message ang inyong coach. Ibibigay nila ang inyong access code.
                </p>
              </div>

              <p style={{ color: "#bbb", fontSize: "13px", textAlign: "center", marginTop: "20px" }}>
                Walang code pa?{" "}
                <button onClick={() => setTab("coaches")} style={{ background: "none", border: "none", color: G, fontSize: "13px", fontWeight: "bold", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "Georgia, serif" }}>
                  Makipag-ugnayan sa Coach →
                </button>
              </p>
            </div>
          )}

          {/* ═══ GIFTS TAB ════════════════════════════════════════ */}
          {tab === "gifts" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>🎁</div>
                <h2 style={{ color: G, fontSize: "22px", fontWeight: "bold", margin: "0 0 8px 0" }}>
                  Libreng Gifts sa Bawat Order!
                </h2>
                <p style={{ color: MID, fontSize: "17px", margin: 0, lineHeight: 1.6 }}>
                  Mas malaking order = mas maraming <strong style={{ color: G }}>LIBRENG</strong> gifts!
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {PERKS.map((p, i) => (
                  <div key={i} style={{
                    borderRadius: "16px", padding: "18px 20px",
                    background: p.highlight ? G : WHITE,
                    border: p.highlight ? `2.5px solid ${GOLD}` : `1.5px solid #D9D0C0`,
                    boxShadow: p.highlight ? "0 4px 16px rgba(57,97,59,0.2)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: p.gifts.length > 0 ? "10px" : "0" }}>
                      <span style={{ fontWeight: "bold", fontSize: "17px", color: p.highlight ? GOLD : DARK }}>
                        {p.label}
                      </span>
                      {p.highlight && (
                        <span style={{ background: GOLD, color: G, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "bold" }}>
                          BEST VALUE ⭐
                        </span>
                      )}
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
                        <p style={{ color: p.highlight ? "rgba(255,255,255,0.5)" : "#aaa", fontSize: "13px", margin: "8px 0 0 0" }}>
                          {p.note}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTab("verify")}
                style={{ marginTop: "24px", width: "100%", background: G, color: WHITE, border: "none", borderRadius: "16px", padding: "20px", fontSize: "19px", fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
              >
                ☕ I-Verify na ang Code Ko →
              </button>
            </div>
          )}

          {/* ═══ COACHES TAB ══════════════════════════════════════ */}
          {tab === "coaches" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>👥</div>
                <h2 style={{ color: G, fontSize: "22px", fontWeight: "bold", margin: "0 0 8px 0" }}>
                  Ang Aming mga Coach
                </h2>
                <p style={{ color: MID, fontSize: "17px", margin: 0, lineHeight: 1.6 }}>
                  I-message sila para mag-order o para sa mga katanungan!
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {COACHES.map((c, i) => (
                  <div key={i} style={{ background: WHITE, borderRadius: "18px", padding: "18px 20px", border: "1.5px solid #D9D0C0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                      <img
                        src={c.photo}
                        alt={c.name}
                        style={{ width: 60, height: 60, borderRadius: "14px", objectFit: "cover", border: `2.5px solid ${G}`, flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: "19px", fontWeight: "bold", color: DARK, margin: 0 }}>{c.name}</p>
                        <p style={{ fontSize: "14px", color: G, margin: "3px 0 0 0", fontWeight: 600 }}>R&M EaseBrew Wellness Coach</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <a
                        href={`tel:${c.number.replace(/\s/g, "")}`}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: G, color: "#fff", borderRadius: "12px", padding: "15px 8px", fontSize: "15px", fontWeight: "bold", textDecoration: "none", textAlign: "center" as const }}
                      >
                        📞 {c.number}
                      </a>
                      <a
                        href={c.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#1877F2", color: "#fff", borderRadius: "12px", padding: "15px 8px", fontSize: "15px", fontWeight: "bold", textDecoration: "none", textAlign: "center" as const }}
                      >
                        📘 Facebook
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px", background: "#FEF9E7", borderRadius: "16px", padding: "18px 20px", border: `2px solid ${GOLD}`, textAlign: "center" }}>
                <p style={{ fontSize: "17px", color: AMBER, fontWeight: "bold", margin: "0 0 6px 0" }}>
                  💬 Huwag mag-atubili!
                </p>
                <p style={{ fontSize: "16px", color: MID, margin: 0, lineHeight: 1.6 }}>
                  Lagi kaming nandito para sa inyo. Ang inyong kalusugan ang aming prayoridad. ❤️
                </p>
              </div>

              <button
                onClick={() => setTab("verify")}
                style={{ marginTop: "20px", width: "100%", background: G, color: WHITE, border: "none", borderRadius: "16px", padding: "20px", fontSize: "19px", fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
              >
                ☕ I-Verify na ang Code Ko →
              </button>

              <p style={{ color: "#bbb", fontSize: "13px", textAlign: "center", marginTop: "16px" }}>
                R&M EaseBrew Wellness Hub © 2025
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}