"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard } from "@/lib/useAdminGuard";
import { useRouter } from "next/navigation";

const DARK = "#1B201A";
const MID  = "#4E504F";
const LIGHT = "#F5F0E8";

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
            <h1 style={{ color: DARK, fontSize: 22, fontWeight: "bold", margin: 0 }}>Audit Log</h1>
            <p style={{ color: MID, fontSize: 13, margin: "4px 0 0" }}>
              Lahat ng ginawa ng mga admin at coach
            </p>
          </div>
          <button
            onClick={load}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db",
              background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: DARK,
            }}
          >
            🔄 I-refresh
          </button>
        </div>

        {fetchError && (
          <div style={{ background: "#fff1f1", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 18px", marginBottom: 20, color: "#b91c1c", fontSize: 13 }}>
            ⚠️ Hindi ma-load ang audit log. I-refresh ang page.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MID }}>Nilo-load...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MID, fontSize: 14 }}>
            Wala pang naka-record na aktibidad.
          </div>
        ) : (
          <div style={{
            background: "white", borderRadius: 14,
            border: "1px solid #e5e7eb", overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: LIGHT, borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: MID, fontWeight: 600, whiteSpace: "nowrap" }}>Oras</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: MID, fontWeight: 600 }}>Admin</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: MID, fontWeight: 600 }}>Aksyon</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: MID, fontWeight: 600 }}>Code / Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  const badge = ACTION_LABELS[e.action] ?? { label: e.action, color: MID };
                  const meta  = e.metadata;
                  let detail  = e.target_code ?? "";
                  if (meta?.customer_name) detail += ` — ${meta.customer_name}`;
                  // Extract [CoachName] from notes field
                  const coachMatch = typeof meta?.notes === 'string' ? meta.notes.match(/^\[([^\]]+)\]/) : null;
                  if (coachMatch) detail += ` (${coachMatch[1]})`;
                  if (meta?.keys)          detail  = String((meta.keys as string[]).join(", "));
                  if (meta?.key)           detail  = String(meta.key);
                  return (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : undefined,
                        background: i % 2 === 0 ? "white" : "#fafafa",
                      }}
                    >
                      <td style={{ padding: "10px 14px", color: MID, whiteSpace: "nowrap" }}>
                        {formatDate(e.created_at)}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: DARK }}>
                        {e.admin_username}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 9px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: badge.color + "18",
                          color: badge.color,
                          whiteSpace: "nowrap",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: MID, fontFamily: "monospace", fontSize: 12 }}>
                        {detail || "—"}
                      </td>
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
