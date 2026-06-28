"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAdminAuthCache } from "@/lib/useAdminGuard";
import { DEFAULT_COACHES } from "@/lib/coaches";
import { getCoachLabel, setCoachLabel, clearCoachLabel } from "@/lib/coachLabel";
import {
  BarChart3, Bell, ClipboardList, FileText, KeyRound,
  LayoutDashboard, LogOut, ShieldCheck, User, Pencil,
} from "lucide-react";

const OWNER_LINKS = [
  { href: "/admin",               icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/admin/codes",         icon: KeyRound,        label: "Access Codes" },
  { href: "/admin/analytics",     icon: BarChart3,       label: "Analytics"    },
  { href: "/admin/content",       icon: FileText,        label: "Content"      },
  { href: "/admin/notifications", icon: Bell,            label: "Messages"     },
  { href: "/admin/audit-log",     icon: ClipboardList,   label: "Audit Log"    },
];

const COACH_LINKS = [
  { href: "/admin/codes", icon: KeyRound, label: "Generate Code" },
];

interface SidebarProps {
  active: string;
  username: string;
  role?: string;
  onLogout?: () => void;
}

// ─── Coach Name Picker Modal ──────────────────────────────────────────────────
function CoachNamePicker({ onSelect }: { onSelect: (name: string) => void }) {
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)" }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "28px 24px", width: 340, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1B201A", margin: "0 0 6px", fontFamily: "Inter, system-ui, sans-serif" }}>
            Sino ka?
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0, fontFamily: "Inter, system-ui, sans-serif" }}>
            Piliin ang inyong pangalan para ma-track ang inyong codes.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {DEFAULT_COACHES.map(coach => (
            <button
              key={coach.name}
              onClick={() => onSelect(coach.name)}
              style={{
                background: "#f8faf9", border: "1.5px solid #dde4df", borderRadius: 10,
                padding: "12px 16px", textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 14, fontWeight: 600, color: "#1B201A",
                fontFamily: "Inter, system-ui, sans-serif",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#39613B"; (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#dde4df"; (e.currentTarget as HTMLButtonElement).style.background = "#f8faf9"; }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#39613B", flexShrink: 0 }} />
              {coach.name}
            </button>
          ))}
        </div>

        {showCustom ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && custom.trim()) onSelect(custom.trim()); }}
              placeholder="Itype ang pangalan..."
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid #39613B", fontSize: 13, outline: "none", fontFamily: "Inter, system-ui, sans-serif" }}
            />
            <button
              onClick={() => { if (custom.trim()) onSelect(custom.trim()); }}
              disabled={!custom.trim()}
              style={{ background: "#39613B", color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: custom.trim() ? 1 : 0.5, fontFamily: "Inter, system-ui, sans-serif" }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            style={{ width: "100%", background: "none", border: "1.5px dashed #d1d5db", borderRadius: 10, padding: "10px", fontSize: 13, color: "#6b7280", cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}
          >
            + Iba pa (custom name)
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar({ active, username, role = "owner", onLogout }: SidebarProps) {
  const router  = useRouter();
  const isCoach = role === "coach";
  const links   = isCoach ? COACH_LINKS : OWNER_LINKS;

  const [coachLabel, setCoachLabelState] = useState<string | null>(null);
  const [showPicker, setShowPicker]      = useState(false);
  const [mounted, setMounted]            = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isCoach) {
      const stored = getCoachLabel();
      if (stored) {
        setCoachLabelState(stored);
      } else {
        setShowPicker(true);
      }
    }
  }, [isCoach]);

  function handleSelect(name: string) {
    setCoachLabel(name);
    setCoachLabelState(name);
    setShowPicker(false);
  }

  async function handleLogout() {
    clearAdminAuthCache();
    if (isCoach) clearCoachLabel();
    if (onLogout) { onLogout(); return; }
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const displayName = isCoach
    ? (mounted ? (coachLabel || username || "Coach") : (username || "Coach"))
    : (username || "Administrator");

  return (
    <>
      {showPicker && <CoachNamePicker onSelect={handleSelect} />}

      <aside
        style={{
          width: "var(--admin-sidebar-w, 248px)",
          minHeight: "100vh",
          background: "#183b28",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          inset: "0 auto 0 0",
          zIndex: 100,
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Logo ── */}
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8, overflow: "hidden",
              background: "white", display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rm-logo.png" alt="RM Digital" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, letterSpacing: "0.1px", fontFamily: "Inter, system-ui, sans-serif" }}>
                R&amp;M DIGITAL TRADING
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2, fontFamily: "Inter, system-ui, sans-serif" }}>
                {isCoach ? "Coach workspace" : "Operations console"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav label ── */}
        <div style={{ padding: "4px 20px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.35)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "Inter, system-ui, sans-serif" }}>
            <ShieldCheck size={12} />
            {isCoach ? "Coach Tools" : "Management"}
          </div>
        </div>

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 3 }}>
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = active === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  minHeight: 42,
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "0 12px",
                  borderRadius: 8,
                  background: isActive ? "#FED255" : "transparent",
                  color: isActive ? "#183b28" : "rgba(255,255,255,0.72)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  transition: "background 140ms, color 140ms",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── User / logout ── */}
        <div style={{ padding: "12px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 10px 12px", fontFamily: "Inter, system-ui, sans-serif" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7, background: "rgba(254,210,85,0.15)",
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <User size={16} color="#FED255" strokeWidth={1.8} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 }}>
                {isCoach ? "Coach" : "Owner"}
              </div>
            </div>
            {/* Coach can change their name */}
            {isCoach && mounted && (
              <button
                onClick={() => setShowPicker(true)}
                title="Baguhin ang pangalan"
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              minHeight: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
              transition: "background 140ms",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
