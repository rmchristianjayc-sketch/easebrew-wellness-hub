"use client";

import { useState } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { ChevronLeft, Scale, RefreshCcw, AlertTriangle, CircleCheck, AlertCircle, Lightbulb, Ruler, Weight, Cake, UtensilsCrossed, Dumbbell } from "lucide-react";

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
  Icon: typeof AlertTriangle;
};

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return {
    label: "Underweight",
    color: "#0284c7", bg: "#e0f2fe", border: "#7dd3fc",
    Icon: AlertTriangle,
    advice: "Kailangan mo ng mas maraming sustansya. Kumain ng masusustansyang pagkain at magpakonsulta sa doctor. Ang EaseBrew ay tumutulong sa digestion para mas maraming nutrients ang ma-absorb ng katawan.",
  };
  if (bmi < 23) return {
    label: "Normal (Ideal)",
    color: "#166534", bg: "#dcfce7", border: "#86efac",
    Icon: CircleCheck,
    advice: "Maganda! Normal ang timbang mo para sa height mo. Ituloy ang malusog na pamumuhay at regular na pag-inom ng EaseBrew.",
  };
  if (bmi < 27.5) return {
    label: "Overweight",
    color: "#92400e", bg: "#fef9e7", border: "#fcd34d",
    Icon: AlertTriangle,
    advice: "Medyo mataas ang timbang. Subukan ang light exercise araw-araw at iwasan ang matamis. Ang EaseBrew at regular na pag-inom ng tubig ay tumutulong sa metabolism.",
  };
  return {
    label: "Obese",
    color: "#991b1b", bg: "#fef2f2", border: "#fca5a5",
    Icon: AlertCircle,
    advice: "Magpakonsulta sa doctor para sa tamang plano. Magsimula sa light walking at sundin ang anti-inflammation meal plan. Ang EaseBrew ay may natural ingredients na tumutulong sa joint pain at metabolism.",
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
      <p className="c-body" style={{ color: G, fontWeight: 600 }}>Loading...</p>
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
            <div style={{ fontSize: 11, color: "rgba(196,181,253,0.8)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Libreng Tool</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>BMI Calculator</h1>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 20px" }}>

        {/* Input Card */}
        <div style={{ background: WHITE, borderRadius: 24, padding: "28px 24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "2px solid #D8CDBA" }}>
          <h2 className="c-heading" style={{ color: DARK, marginBottom: 24 }}>Ilagay ang iyong detalye</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Height */}
            <div>
              <label className="c-label" style={{ display: "block", marginBottom: 8, alignItems: "center", gap: 6 }}><Ruler size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Taas (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={e => { setHeightCm(e.target.value); setResult(null); }}
                placeholder="Example: 158"
                inputMode="decimal"
                className="c-input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 13, color: MID, marginTop: 5 }}>Gabay: 5 feet = 152cm, 5&apos;4&quot; = 163cm, 5&apos;7&quot; = 170cm</p>
            </div>

            {/* Weight */}
            <div>
              <label className="c-label" style={{ display: "block", marginBottom: 8 }}><Weight size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Timbang (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={e => { setWeightKg(e.target.value); setResult(null); }}
                placeholder="Example: 65"
                inputMode="decimal"
                className="c-input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            {/* Age (optional) */}
            <div>
              <label className="c-label" style={{ display: "block", marginBottom: 8 }}><Cake size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Edad (opsyonal)</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Example: 55"
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
              <div style={{ width: 56, height: 56, borderRadius: 16, background: result.category.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}><result.category.Icon size={28} color="#fff" /></div>
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
                <span>Under</span>
                <span>Normal</span>
                <span>Over</span>
                <span>Obese</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ fontSize: 16, color: DARK, margin: 0, lineHeight: 1.75 }}>
                <Lightbulb size={16} style={{ display: "inline", verticalAlign: "middle", flexShrink: 0 }} /> {result.category.advice}
              </p>
            </div>
          </div>
        )}

        {/* BMI Chart Reference */}
        <div style={{ background: WHITE, borderRadius: 20, padding: "20px 22px", marginBottom: 24, border: "1.5px solid #D8CDBA" }}>
          <h2 className="c-heading" style={{ color: DARK, marginBottom: 16 }}>BMI Reference (Asian/Filipino)</h2>
          <p style={{ fontSize: 14, color: MID, margin: "0 0 14px" }}>May espesyal na BMI chart ang WHO para sa Asian/Filipino body types.</p>
          {[
            { range: "Below 18.5", label: "Underweight", color: "#0284c7", bg: "#e0f2fe" },
            { range: "18.5 – 22.9",   label: "Normal / Ideal", color: "#166534", bg: "#dcfce7" },
            { range: "23.0 – 27.4",   label: "Overweight",  color: "#92400e", bg: "#fef9e7" },
            { range: "27.5 pataas", label: "Obese",       color: "#991b1b", bg: "#fef2f2" },
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
          <p style={{ color: GOLD, fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>Dagdag sa wellness mo!</p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, margin: "0 0 16px", lineHeight: 1.7 }}>
            Ang EaseBrew ay tumutulong sa anti-inflammation, digestion, at joint health — mahalaga para sa malusog na timbang.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/meal-plan" style={{ background: GOLD, color: G, borderRadius: 12, padding: "14px 24px", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <UtensilsCrossed size={18} /> Tingnan ang Meal Plan →
            </Link>
            <Link href="/exercise" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1.5px solid rgba(255,255,255,0.3)" }}>
              <Dumbbell size={18} /> Tingnan ang Exercises →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
