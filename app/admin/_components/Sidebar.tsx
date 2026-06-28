"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAdminAuthCache } from "@/lib/useAdminGuard";
import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";

const OWNER_LINKS = [
  { href: "/admin",                  icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/admin/codes",            icon: KeyRound,        label: "Access Codes" },
  { href: "/admin/analytics",        icon: BarChart3,       label: "Analytics"    },
  { href: "/admin/content",          icon: FileText,        label: "Content"      },
  { href: "/admin/notifications",    icon: Bell,            label: "Messages"     },
  { href: "/admin/audit-log",        icon: ClipboardList,   label: "Audit Log"    },
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

export default function Sidebar({ active, username, role = "owner", onLogout }: SidebarProps) {
  const router  = useRouter();
  const isCoach = role === "coach";
  const links   = isCoach ? COACH_LINKS : OWNER_LINKS;

  async function handleLogout() {
    clearAdminAuthCache();
    if (onLogout) { onLogout(); return; }
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <aside
      style={{
        width: "var(--admin-sidebar-w)",
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
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, letterSpacing: "0.1px", fontFamily: "var(--admin-font)" }}>
              R&amp;M DIGITAL TRADING
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2, fontFamily: "var(--admin-font)" }}>
              {isCoach ? "Coach workspace" : "Operations console"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav label ── */}
      <div style={{ padding: "4px 20px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.35)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "var(--admin-font)" }}>
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
                fontFamily: "var(--admin-font)",
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
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 10px 12px", fontFamily: "var(--admin-font)" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 7, background: "rgba(254,210,85,0.15)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <User size={16} color="#FED255" strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {username || (isCoach ? "Coach" : "Administrator")}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 }}>
              {isCoach ? "Coach" : "Owner"}
            </div>
          </div>
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
            fontFamily: "var(--admin-font)",
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
  );
}
