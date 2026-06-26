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
  UserRound,
} from "lucide-react";

const OWNER_LINKS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/codes", icon: KeyRound, label: "Access Codes" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/content", icon: FileText, label: "Content" },
  { href: "/admin/notifications", icon: Bell, label: "Messages" },
  { href: "/admin/audit-log", icon: ClipboardList, label: "Audit Log" },
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

export default function Sidebar({
  active,
  username,
  role = "owner",
  onLogout,
}: SidebarProps) {
  const router = useRouter();
  const isCoach = role === "coach";
  const links = isCoach ? COACH_LINKS : OWNER_LINKS;

  async function handleLogout() {
    clearAdminAuthCache();
    if (onLogout) {
      onLogout();
      return;
    }
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <aside
      style={{
        width: "var(--admin-sidebar)",
        minHeight: "100vh",
        background: "#183b28",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        inset: "0 auto 0 0",
        zIndex: 100,
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ padding: "28px 22px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              background: "white",
              display: "grid",
              placeItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rm-logo.png" alt="RM Digital Trading" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 750, fontSize: 12, lineHeight: 1.2, letterSpacing: "0.2px" }}>
              R&amp;M DIGITAL TRADING
            </div>
            <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 12, marginTop: 2 }}>
              {isCoach ? "Coach workspace" : "Operations console"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 14px 10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "9px 10px",
            color: "rgba(255,255,255,0.5)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <ShieldCheck size={15} />
          {isCoach ? "Coach tools" : "Management"}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "0 14px", display: "flex", flexDirection: "column", gap: 5 }}>
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = active === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 13px",
                borderRadius: 7,
                background: isActive ? "#FED255" : "transparent",
                color: isActive ? "#183b28" : "rgba(255,255,255,0.76)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: isActive ? 750 : 550,
                transition: "background 150ms, color 150ms",
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ margin: "16px 14px", padding: "14px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 7,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.1)",
              color: "white",
            }}
          >
            <UserRound size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "white", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
              {username || (isCoach ? "Coach" : "Administrator")}
            </div>
            <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 11, marginTop: 2 }}>
              {isCoach ? "Coach account" : "Owner account"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.76)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
