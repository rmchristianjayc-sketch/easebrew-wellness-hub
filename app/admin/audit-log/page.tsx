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
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="/admin/audit-log" username={username} role={role} onLogout={handleLogout} />

      <main className="admin-main" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="a-page-title">Audit Log</h1>
            <p className="a-page-subtitle">All admin and coach activity</p>
          </div>
          <button onClick={load} className="a-btn a-btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {fetchError && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#9f1239", fontSize: 13, fontFamily: "var(--admin-font)" }}>
            Hindi ma-load ang audit log. I-refresh ang page.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-mid)", fontFamily: "var(--admin-font)", fontSize: 13 }}>
            Wala pang naka-record na aktibidad.
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Oras</th>
                  <th>Admin</th>
                  <th>Aksyon</th>
                  <th>Code / Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const badge = ACTION_LABELS[e.action] ?? { label: e.action, color: "var(--ink-mid)" };
                  const meta  = e.metadata;
                  let detail  = e.target_code ?? "";
                  if (meta?.customer_name) detail += ` — ${meta.customer_name}`;
                  const coachMatch = typeof meta?.notes === "string" ? meta.notes.match(/^\[([^\]]+)\]/) : null;
                  if (coachMatch) detail += ` (${coachMatch[1]})`;
                  if (meta?.keys) detail = String((meta.keys as string[]).join(", "));
                  if (meta?.key)  detail = String(meta.key);
                  return (
                    <tr key={e.id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{formatDate(e.created_at)}</td>
                      <td style={{ fontWeight: 600 }}>{e.admin_username}</td>
                      <td>
                        <span style={{
                          display: "inline-block", padding: "2px 9px", borderRadius: 99,
                          fontSize: 11, fontWeight: 700,
                          background: badge.color + "18", color: badge.color, whiteSpace: "nowrap",
                          fontFamily: "var(--admin-font)",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{detail || "—"}</td>
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
