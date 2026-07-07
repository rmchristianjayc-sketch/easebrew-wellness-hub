"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSessionGuard } from "@/lib/useSessionGuard";
import { progressStorageKey, readProgressCache, writeProgressCache } from "@/lib/progressStorage";
import { IdCard, ChevronLeft, Save, Eye, Pencil, AlertTriangle, Stethoscope, Pill, Phone, Smartphone, UserRound, CircleCheck, Lightbulb } from "lucide-react";

const G     = "#39613B";
const GOLD  = "#FED255";
const CREAM = "#EEE5D4";
const DARK  = "#1B201A";
const MID   = "#4E504F";
const WHITE = "#FFFFFB";

type EmergencyContact = { name: string; relationship: string; phone: string };
type Doctor = { name: string; phone: string; clinic: string };

type MedicalCard = {
  fullName: string;
  bloodType: string;
  dateOfBirth: string;
  allergies: string;         // comma-separated for simple editing
  conditions: string;        // comma-separated
  currentMedications: string; // comma-separated
  emergencyContacts: EmergencyContact[];
  primaryDoctor: Doctor;
};

const EMPTY_CARD: MedicalCard = {
  fullName: "",
  bloodType: "",
  dateOfBirth: "",
  allergies: "",
  conditions: "",
  currentMedications: "",
  emergencyContacts: [{ name: "", relationship: "", phone: "" }],
  primaryDoctor: { name: "", phone: "", clinic: "" },
};

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"];

function splitList(s: string): string[] {
  return s.split(",").map(x => x.trim()).filter(Boolean);
}

export default function MedicalCardPage() {
  const { checking, session } = useSessionGuard();
  const [card, setCard] = useState<MedicalCard>(EMPTY_CARD);
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [saved, setSaved] = useState(false);

  const storageKey = session ? progressStorageKey("easebrew-medical-card-v1", session.code) : "";

  useEffect(() => {
    if (!session || !storageKey) return;
    const loaded = readProgressCache<MedicalCard>(storageKey, EMPTY_CARD);
    setCard(loaded);
    // If already filled, default to view mode
    if (loaded.fullName.trim()) setMode("view");
  }, [session, storageKey]);

  function persist(next: MedicalCard) {
    setCard(next);
    if (!storageKey) return;
    writeProgressCache(storageKey, next);
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "medical_card", data: next }),
    }).catch(() => {});
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!card.fullName.trim()) return;
    persist(card);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setMode("view");
  }

  function updateContact(idx: number, field: keyof EmergencyContact, value: string) {
    setCard(c => ({
      ...c,
      emergencyContacts: c.emergencyContacts.map((ec, i) => i === idx ? { ...ec, [field]: value } : ec),
    }));
  }

  function addContact() {
    setCard(c => ({
      ...c,
      emergencyContacts: [...c.emergencyContacts, { name: "", relationship: "", phone: "" }],
    }));
  }

  function removeContact(idx: number) {
    setCard(c => ({
      ...c,
      emergencyContacts: c.emergencyContacts.filter((_, i) => i !== idx),
    }));
  }

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: G, fontWeight: 600, fontFamily: "Georgia, serif", fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)`, padding: "20px 24px 28px", color: "#fff" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 600, marginBottom: 18, fontFamily: "Georgia, serif" }}>
          <ChevronLeft size={20} /> Bumalik sa Hub
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center" }}>
            <IdCard size={28} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Libreng Tool</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Medical Info Card</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "Georgia, serif" }}>Ipakita sa doctor kung may emergency</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Mode toggle */}
        {card.fullName.trim() && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button onClick={() => setMode("view")} style={{
              flex: 1, background: mode === "view" ? G : "#fff", color: mode === "view" ? "#fff" : DARK,
              border: `2px solid ${G}`, borderRadius: 12, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Eye size={16} /> Tingnan
            </button>
            <button onClick={() => setMode("edit")} style={{
              flex: 1, background: mode === "edit" ? G : "#fff", color: mode === "edit" ? "#fff" : DARK,
              border: `2px solid ${G}`, borderRadius: 12, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Pencil size={16} /> I-edit
            </button>
          </div>
        )}

        {/* VIEW MODE — screenshot-ready card */}
        {mode === "view" && card.fullName.trim() && (
          <div style={{ background: WHITE, borderRadius: 20, padding: "24px", border: `3px solid ${G}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ borderBottom: `2px solid ${GOLD}`, paddingBottom: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: MID, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 4px" }}>Medical Info Card</p>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: DARK, margin: 0 }}>{card.fullName}</h2>
              {(card.dateOfBirth || card.bloodType) && (
                <p style={{ fontSize: 14, color: MID, margin: "6px 0 0" }}>
                  {card.dateOfBirth && `Petsa ng Kapanganakan: ${card.dateOfBirth}`}
                  {card.dateOfBirth && card.bloodType && "  ·  "}
                  {card.bloodType && `Blood Type: `}
                  {card.bloodType && <strong style={{ color: "#dc2626" }}>{card.bloodType}</strong>}
                </p>
              )}
            </div>

            {splitList(card.allergies).length > 0 && (
              <ViewSection title="Mga Allergy" color="#dc2626" items={splitList(card.allergies)} icon={<AlertTriangle size={14} />} />
            )}
            {splitList(card.conditions).length > 0 && (
              <ViewSection title="Mga Kondisyon" color="#7c3aed" items={splitList(card.conditions)} icon={<Stethoscope size={14} />} />
            )}
            {splitList(card.currentMedications).length > 0 && (
              <ViewSection title="Mga Gamot Ngayon" color="#4f46e5" items={splitList(card.currentMedications)} icon={<Pill size={14} />} />
            )}

            {card.emergencyContacts.some(c => c.name.trim()) && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}><Phone size={14} /> Emergency Contacts</p>
                {card.emergencyContacts.filter(c => c.name.trim()).map((c, i) => (
                  <div key={i} style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1.5px solid #86efac" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>{c.name} {c.relationship && <span style={{ fontSize: 13, color: MID, fontWeight: 500 }}>({c.relationship})</span>}</p>
                    {c.phone && <p style={{ fontSize: 14, color: G, margin: "2px 0 0", fontWeight: 600 }}><Smartphone size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {c.phone}</p>}
                  </div>
                ))}
              </div>
            )}

            {(card.primaryDoctor.name || card.primaryDoctor.phone) && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}><UserRound size={14} /> Primary Doctor</p>
                <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "10px 12px", border: "1.5px solid #7dd3fc" }}>
                  {card.primaryDoctor.name && <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>{card.primaryDoctor.name}</p>}
                  {card.primaryDoctor.clinic && <p style={{ fontSize: 13, color: MID, margin: "2px 0 0" }}>{card.primaryDoctor.clinic}</p>}
                  {card.primaryDoctor.phone && <p style={{ fontSize: 14, color: "#0284c7", margin: "2px 0 0", fontWeight: 600 }}><Smartphone size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {card.primaryDoctor.phone}</p>}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1.5px dashed #D8CDBA", marginTop: 16, paddingTop: 12, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: MID, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Lightbulb size={12} /> I-screenshot ito para ipakita sa doctor kung may emergency</p>
            </div>
          </div>
        )}

        {/* EDIT MODE — form */}
        {mode === "edit" && (
          <form onSubmit={handleSave} style={{ background: WHITE, borderRadius: 20, padding: "22px", border: "1.5px solid #D8CDBA" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 6px" }}>Personal Info</h2>
            <p style={{ fontSize: 13, color: MID, margin: "0 0 16px" }}>Pangalan lang ang kailangan. Lahat ng iba ay opsyonal.</p>

            <Field label="Buong Pangalan *">
              <input type="text" required maxLength={80} value={card.fullName} onChange={e => setCard({ ...card, fullName: e.target.value })} style={inputStyle} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Petsa ng Kapanganakan">
                <input type="date" value={card.dateOfBirth} onChange={e => setCard({ ...card, dateOfBirth: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Blood Type">
                <select value={card.bloodType} onChange={e => setCard({ ...card, bloodType: e.target.value })} style={inputStyle}>
                  <option value="">— Select —</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </Field>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "20px 0 12px" }}>Medical History</h2>
            <Field label="Mga Allergy (ihiwalay ng comma)">
              <input type="text" value={card.allergies} onChange={e => setCard({ ...card, allergies: e.target.value })} placeholder="hal. Penicillin, Mani, Seafood" style={inputStyle} maxLength={300} />
            </Field>
            <Field label="Mga Kondisyon (ihiwalay ng comma)">
              <input type="text" value={card.conditions} onChange={e => setCard({ ...card, conditions: e.target.value })} placeholder="hal. Hypertension, Diabetes Type 2, Arthritis" style={inputStyle} maxLength={300} />
            </Field>
            <Field label="Mga Gamot Ngayon (ihiwalay ng comma)">
              <input type="text" value={card.currentMedications} onChange={e => setCard({ ...card, currentMedications: e.target.value })} placeholder="hal. Losartan 50mg, Metformin 500mg, EaseBrew" style={inputStyle} maxLength={500} />
            </Field>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "20px 0 12px" }}>Emergency Contacts</h2>
            {card.emergencyContacts.map((c, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 12, padding: "14px", marginBottom: 10, border: "1.5px solid #e5e7eb" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input type="text" placeholder="Name" value={c.name} onChange={e => updateContact(i, "name", e.target.value)} style={inputStyle} maxLength={80} />
                  <input type="text" placeholder="Relasyon (Asawa, Anak, atbp.)" value={c.relationship} onChange={e => updateContact(i, "relationship", e.target.value)} style={inputStyle} maxLength={40} />
                </div>
                <input type="tel" placeholder="Phone Number" value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} style={inputStyle} maxLength={30} inputMode="tel" />
                {card.emergencyContacts.length > 1 && (
                  <button type="button" onClick={() => removeContact(i)} style={{ background: "none", border: "none", color: "#991b1b", fontSize: 13, cursor: "pointer", marginTop: 8, fontWeight: 600 }}>
                    Tanggalin
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addContact} style={{ background: "#f3f4f6", border: "none", color: DARK, borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginBottom: 16 }}>
              + Magdagdag ng contact
            </button>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "20px 0 12px" }}>Primary Doctor</h2>
            <Field label="Pangalan ng Doctor">
              <input type="text" value={card.primaryDoctor.name} onChange={e => setCard({ ...card, primaryDoctor: { ...card.primaryDoctor, name: e.target.value } })} style={inputStyle} maxLength={80} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Clinic / Hospital">
                <input type="text" value={card.primaryDoctor.clinic} onChange={e => setCard({ ...card, primaryDoctor: { ...card.primaryDoctor, clinic: e.target.value } })} style={inputStyle} maxLength={80} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={card.primaryDoctor.phone} onChange={e => setCard({ ...card, primaryDoctor: { ...card.primaryDoctor, phone: e.target.value } })} style={inputStyle} maxLength={30} />
              </Field>
            </div>

            <button type="submit" style={{ marginTop: 20, width: "100%", background: G, color: "#fff", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Save size={18} /> I-save ang Info Card
            </button>
          </form>
        )}

        {saved && (
          <div style={{ background: "#dcfce7", color: "#166534", borderRadius: 12, padding: "12px 16px", marginTop: 16, fontSize: 14, fontWeight: 600, textAlign: "center" }}>
            <CircleCheck size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Na-save na! I-screenshot para lagi mong dala.
          </div>
        )}

        <div style={{ background: `${GOLD}22`, borderRadius: 12, padding: "14px 16px", marginTop: 16, border: `1.5px solid ${GOLD}` }}>
          <p style={{ fontSize: 13, color: DARK, margin: 0, lineHeight: 1.5 }}>
            <Lightbulb size={14} style={{ display: "inline", verticalAlign: "middle" }} /> <strong>Tip:</strong> I-screenshot ang &quot;Tingnan&quot; mode at i-save sa phone photos. Mabilis itong makikita ng doctor kung may emergency.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, color: MID, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function ViewSection({ title, color, items, icon }: { title: string; color: string; items: string[]; icon?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 12, color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>{icon} {title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 14, background: `${color}15`, color, borderRadius: 8, padding: "6px 12px", fontWeight: 600 }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: 16,
  border: "1.5px solid #D8CDBA",
  borderRadius: 10,
  background: "#fff",
  color: DARK,
  fontFamily: "inherit",
};
