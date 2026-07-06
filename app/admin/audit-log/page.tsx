"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  generate_code:     { label: "Generated code",   color: "#166534" },
  deactivate_code:   { label: "Deactivated",      color: "#92400e" },
  reactivate_code:   { label: "Reactivated",      color: "#1e40af" },
  delete_code:       { label: "Deleted",           color: "#991b1b" },
  update_code_notes: { label: "Updated notes",    color: "#6b21a8" },
  update_content:    { label: "Updated content",   color: "#155e75" },
  delete_content:    { label: "Deleted content",   color: "#991b1b" },
  admin_login:       { label: "Logged in",         color: "#166534" },
  admin_login_failed:{ label: "Failed login",      color: "#991b1b" },
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
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/audit-log" username={username} role={role} onLogout={handleLogout} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1B201A", margin: 0, fontFamily: "var(--admin-font)" }}>Audit Log</h1>
            <p style={{ fontSize: 13, color: "#6b7a70", margin: "4px 0 0", fontFamily: "var(--admin-font)" }}>All admin and coach activity</p>
          </div>
          <button onClick={load} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 18px", borderRadius: 10, border: "1px solid #e8ece9", background: "#fff", color: "#1B201A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--admin-font)", boxShadow: "0 1px 3px rgba(20,35,25,0.04)" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {fetchError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 20, color: "#dc2626", fontSize: 13, fontFamily: "var(--admin-font)" }}>
            Could not load audit log. Please refresh the page.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a3b0a8", fontFamily: "var(--admin-font)", fontSize: 13 }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a3b0a8", fontFamily: "var(--admin-font)", fontSize: 13 }}>
            No activity recorded yet.
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e8ece9", borderRadius: 16, boxShadow: "0 1px 3px rgba(20,35,25,0.04)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--admin-font)" }}>
              <thead>
                <tr style={{ background: "#fafbfa" }}>
                  {["Time", "Admin", "Action", "Code / Details"].map(h => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7a70", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f2f1", whiteSpace: "nowrap" }}>{h}</th>
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
                      <td style={{ padding: "12px 18px", whiteSpace: "nowrap", fontSize: 12, borderBottom: "1px solid #f5f6f5" }}>{formatDate(e.created_at)}</td>
                      <td style={{ padding: "12px 18px", fontWeight: 700, fontSize: 13, borderBottom: "1px solid #f5f6f5", color: "#1B201A" }}>{e.admin_username}</td>
                      <td style={{ padding: "12px 18px", borderBottom: "1px solid #f5f6f5" }}>
                        <span style={{
                          display: "inline-block", padding: "4px 12px", borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: badge.color + "18", color: badge.color, whiteSpace: "nowrap",
                          fontFamily: "var(--admin-font)",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 12, borderBottom: "1px solid #f5f6f5" }}>{detail || "—"}</td>
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
