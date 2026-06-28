"use client";

import { useState } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { ChevronLeft, Scale, RefreshCcw } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

type BmiCategory = {
  label: string;
  color: string;
  bg: string;
  border: string;
  advice: string;
  emoji: string;
};

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return {
    label: "Underweight (Payat)",
    color: "#0284c7", bg: "#e0f2fe", border: "#7dd3fc",
    emoji: "⚠️",
    advice: "Kailangan mo ng mas maraming sustansya. Kumain ng nutritious na pagkain at kumonsulta sa doktor. Ang EaseBrew ay makakatulong sa iyong digestion para mas masipsip ang nutrients.",
  };
  if (bmi < 23) return {
    label: "Normal Weight (Ideal)",
    color: "#166534", bg: "#dcfce7", border: "#86efac",
    emoji: "✅",
    advice: "Magaling! Normal ang iyong timbang para sa iyong taas. Ituloy ang healthy lifestyle at regular na pag-inom ng EaseBrew para mapanatili ito.",
  };
  if (bmi < 27.5) return {
    label: "Overweight (Sobrang Timbang)",
    color: "#92400e", bg: "#fef9e7", border: "#fcd34d",
    emoji: "⚠️",
    advice: "Medyo mataas ang timbang. Subukan ang light exercise araw-araw at iwasan ang matamis na pagkain. Ang EaseBrew at regular na tubig ay nakakatulong sa metabolism.",
  };
  return {
    label: "Obese (Labis na Sobrang Timbang)",
    color: "#991b1b", bg: "#fef2f2", border: "#fca5a5",
    emoji: "❗",
    advice: "Kumonsulta sa doktor para sa tamang plano. Magsimula ng light walking exercise at sundin ang anti-inflammation meal plan. Ang EaseBrew ay may natural na ingredients na nakakatulong sa joint pain at metabolism.",
  };
}

export default function BmiPage() {
  const { checking } = useSessionGuard();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age,      setAge]      = useState("");
  const [result,   setResult]   = useState<{ bmi: number; category: BmiCategory } | null>(null);

  function calculate() {
    const h = parseFloat(heightCm) / 100;
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return;
    const bmi = w / (h * h);
    setResult({ bmi: Math.round(bmi * 10) / 10, category: getBmiCategory(bmi) });
  }

  function reset() {
    setHeightCm("");
    setWeightKg("");
    setAge("");
    setResult(null);
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p className="c-body" style={{ color: G, fontWeight: 600 }}>☕ Loading...</p>
    </div>
  );

  const bmiPct = result ? Math.min(Math.max(((result.bmi - 10) / (40 - 10)) * 100, 0), 100) : 0;

  return (
    <div className="customer-shell" style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #3b1f6e 0%, #5b2d8e 100%)`, padding: "20px 24px 28px", color: "#fff" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 600, marginBottom: 18, fontFamily: "Georgia, serif" }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(167,139,250,0.25)", border: "1.5px solid rgba(167,139,250,0.4)", display: "grid", placeItems: "center" }}>
            <Scale size={28} color="#c4b5fd" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(196,181,253,0.8)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Health Tool</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>BMI Calculator</h1>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 20px" }}>

        {/* Input Card */}
        <div style={{ background: WHITE, borderRadius: 24, padding: "28px 24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "2px solid #D8CDBA" }}>
          <h2 className="c-heading" style={{ color: DARK, marginBottom: 24 }}>Ilagay ang inyong detalye</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Height */}
            <div>
              <label className="c-label" style={{ display: "block", marginBottom: 8 }}>📏 Taas (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={e => { setHeightCm(e.target.value); setResult(null); }}
                placeholder="Halimbawa: 158"
                inputMode="decimal"
                className="c-input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 13, color: MID, marginTop: 5 }}>Tip: 5 talampakan = 152cm, 5'4" = 163cm, 5'7" = 170cm</p>
            </div>

            {/* Weight */}
            <div>
              <label className="c-label" style={{ display: "block", marginBottom: 8 }}>⚖️ Timbang (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={e => { setWeightKg(e.target.value); setResult(null); }}
                placeholder="Halimbawa: 65"
                inputMode="decimal"
                className="c-input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            {/* Age (optional) */}
            <div>
              <label className="c-label" style={{ display: "block", marginBottom: 8 }}>🎂 Edad (opsyonal)</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Halimbawa: 55"
                inputMode="numeric"
                className="c-input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={calculate} className="c-btn c-btn-green" style={{ flex: 1 }}>
              Kalkulahin ang BMI
            </button>
            <button onClick={reset} style={{
              width: 62, height: 62, borderRadius: 16, border: "2px solid #D8CDBA",
              background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <RefreshCcw size={20} color={MID} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            background: result.category.bg,
            border: `2.5px solid ${result.category.border}`,
            borderRadius: 24, padding: "28px 24px", marginBottom: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{result.category.emoji}</div>
              <div style={{ fontSize: 72, fontWeight: 900, color: result.category.color, lineHeight: 1, marginBottom: 6 }}>
                {result.bmi}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: result.category.color }}>
                {result.category.label}
              </div>
              {age && (
                <div style={{ fontSize: 14, color: MID, marginTop: 4 }}>
                  Edad: {age} taong gulang
                </div>
              )}
            </div>

            {/* BMI gauge */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: "relative", height: 20, borderRadius: 999, background: "linear-gradient(90deg, #7dd3fc 0%, #86efac 25%, #fcd34d 55%, #fca5a5 80%, #f87171 100%)", overflow: "visible", marginBottom: 8 }}>
                <div style={{
                  position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
                  left: `${bmiPct}%`,
                  width: 24, height: 24, borderRadius: "50%",
                  background: result.category.color,
                  border: "3px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  transition: "left 0.5s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MID, fontWeight: 700 }}>
                <span>Payat</span>
                <span>Normal</span>
                <span>Sobra</span>
                <span>Obese</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ fontSize: 16, color: DARK, margin: 0, lineHeight: 1.75 }}>
                💡 {result.category.advice}
              </p>
            </div>
          </div>
        )}

        {/* BMI Chart Reference */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "20px 22px", marginBottom: 24, border: "1.5px solid #D8CDBA" }}>
          <h2 className="c-heading" style={{ color: DARK, marginBottom: 16 }}>📊 BMI Reference (Para sa Mga Pilipino)</h2>
          <p style={{ fontSize: 14, color: MID, margin: "0 0 14px" }}>Ang WHO ay may espesyal na BMI chart para sa mga Asian/Filipino.</p>
          {[
            { range: "Wala pang 18.5", label: "Underweight", color: "#0284c7", bg: "#e0f2fe" },
            { range: "18.5 – 22.9",   label: "Normal / Ideal ✅", color: "#166534", bg: "#dcfce7" },
            { range: "23.0 – 27.4",   label: "Overweight",  color: "#92400e", bg: "#fef9e7" },
            { range: "27.5 pataas",   label: "Obese",       color: "#991b1b", bg: "#fef2f2" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: row.bg, marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: row.color, minWidth: 100 }}>{row.range}</span>
              <span style={{ fontSize: 15, color: DARK }}>{row.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: G, borderRadius: 18, padding: "20px", textAlign: "center" }}>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>☕ I-complement ang inyong wellness!</p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, margin: "0 0 16px", lineHeight: 1.7 }}>
            Ang EaseBrew ay tumutulong sa anti-inflammation, digestion, at joint health — mahalaga para sa healthy weight management.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/meal-plan" style={{ background: GOLD, color: G, borderRadius: 12, padding: "14px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "block" }}>
              🥗 Tingnan ang Meal Plan →
            </Link>
            <Link href="/exercise" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "block", border: "1.5px solid rgba(255,255,255,0.3)" }}>
              💪 Tingnan ang Exercise Program →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
