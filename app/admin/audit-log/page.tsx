"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  generate_code:     { label: "Gumawa ng code",  color: "#166534" },
  deactivate_code:   { label: "Na-deactivate",   color: "#92400e" },
  reactivate_code:   { label: "Na-reactivate",   color: "#1e40af" },
  delete_code:       { label: "Na-delete",        color: "#991b1b" },
  update_code_notes: { label: "Binago notes",     color: "#6b21a8" },
  update_content:    { label: "Na-update content", color: "#155e75" },
  delete_content:    { label: "Na-delete content", color: "#991b1b" },
  admin_login:       { label: "Nag-login",        color: "#166534" },
  admin_login_failed:{ label: "Bagsak login",     color: "#991b1b" },
};

type AuditEntry = {
  id: string;
  admin_username: string;
  action: string;
  target_id: string | null;
  target_code: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AuditLogPage() {
  const router   = useRouter();
  const { username, role, checking: authLoading } = useAdminGuard();

  const [entries, setEntries]     = useState<AuditEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/admin/audit-log?limit=100");
      const data = await res.json();
      if (res.ok) setEntries(data.entries ?? []);
      else setFetchError(true);
    } catch {
      setFetchError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  function handleLogout() {
    fetch("/api/admin/login", { method: "DELETE" }).finally(() => router.push("/admin/login"));
  }

  if (authLoading) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7f5", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active="/admin/audit-log" username={username} role={role} onLogout={handleLogout} />

      <main style={{ flex: 1, minWidth: 0, marginLeft: 248, padding: "36px 40px" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B201A", margin: 0, fontFamily: "Inter, system-ui, sans-serif" }}>Audit Log</h1>
            <p style={{ fontSize: 13, color: "#4E504F", margin: "4px 0 0", fontFamily: "Inter, system-ui, sans-serif" }}>All admin and coach activity</p>
          </div>
          <button onClick={load} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 14px", borderRadius: 7, border: "1px solid #dde4df", background: "transparent", color: "#4E504F", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {fetchError && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#9f1239", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" }}>
            Hindi ma-load ang audit log. I-refresh ang page.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4E504F", fontFamily: "Inter, system-ui, sans-serif", fontSize: 13 }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4E504F", fontFamily: "Inter, system-ui, sans-serif", fontSize: 13 }}>
            Wala pang naka-record na aktibidad.
          </div>
        ) : (
          <div style={{ background: "#ffffff", border: "1px solid #dde4df", borderRadius: 10, boxShadow: "0 1px 3px rgba(20,35,25,0.05)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Oras", "Admin", "Aksyon", "Code / Details"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#4E504F", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e8eeea", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const badge = ACTION_LABELS[e.action] ?? { label: e.action, color: "#4E504F" };
                  const meta  = e.metadata;
                  let detail  = e.target_code ?? "";
                  if (meta?.customer_name) detail += ` — ${meta.customer_name}`;
                  const coachMatch = typeof meta?.notes === "string" ? meta.notes.match(/^\[([^\]]+)\]/) : null;
                  if (coachMatch) detail += ` (${coachMatch[1]})`;
                  if (meta?.keys) detail = String((meta.keys as string[]).join(", "));
                  if (meta?.key)  detail = String(meta.key);
                  return (
                    <tr key={e.id}>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap", fontSize: 12, borderBottom: "1px solid #f0f2f0" }}>{formatDate(e.created_at)}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 600, fontSize: 13, borderBottom: "1px solid #f0f2f0" }}>{e.admin_username}</td>
                      <td style={{ padding: "10px 16px", borderBottom: "1px solid #f0f2f0" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 9px", borderRadius: 99,
                          fontSize: 11, fontWeight: 700,
                          background: badge.color + "18", color: badge.color, whiteSpace: "nowrap",
                          fontFamily: "Inter, system-ui, sans-serif",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, borderBottom: "1px solid #f0f2f0" }}>{detail || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
