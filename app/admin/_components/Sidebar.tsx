"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const G    = "#39613B";
const GOLD = "#FED255";

const OWNER_LINKS = [
  { href: "/admin",               icon: "⚡", label: "Dashboard"     },
  { href: "/admin/codes",         icon: "🔑", label: "Codes"         },
  { href: "/admin/analytics",     icon: "📊", label: "Analytics"     },
  { href: "/admin/content",       icon: "✏️", label: "Content"       },
  { href: "/admin/notifications", icon: "🔔", label: "Notifications" },
];
const COACH_LINKS = [
  { href: "/admin/codes", icon: "🔑", label: "Generate Code" },
];

interface SidebarProps {
  active: string;
  username: string;
  role?: string;          // default "owner"
  onLogout?: () => void;  // optional — kung kailangan ng parent na mag-handle
}

export default function Sidebar({ active, username, role = "owner", onLogout }: SidebarProps) {
  const router = useRouter();
  const isCoach = role === "coach";
  const links   = isCoach ? COACH_LINKS : OWNER_LINKS;

  async function handleLogout() {
    if (onLogout) { onLogout(); return; }
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: G,
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 100,
      boxShadow: "2px 0 12px rgba(0,0,0,0.12)",
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: GOLD, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>☕</div>
          <div>
            <div style={{ color: GOLD, fontWeight: "bold", fontSize: 14, lineHeight: 1.2 }}>EaseBrew</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
              {isCoach ? "Coach Portal" : "Admin Panel"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(l => {
          const isActive = active === l.href;
          return (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  background: isActive ? "rgba(254,210,85,0.15)" : "transparent",
                  borderLeft: isActive ? `3px solid ${GOLD}` : "3px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 17 }}>{l.icon}</span>
                <span style={{
                  color: isActive ? GOLD : "rgba(255,255,255,0.8)",
                  fontSize: 13, fontWeight: isActive ? "bold" : "normal",
                }}>
                  {l.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── User / Logout ── */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "white", fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{username}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
              {isCoach ? "Coach" : "Administrator"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: "100%", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer", textAlign: "left" }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}