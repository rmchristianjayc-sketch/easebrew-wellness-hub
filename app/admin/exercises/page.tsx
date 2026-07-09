"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/_components/Sidebar";
import { useAdminGuard, clearAdminAuthCache } from "@/lib/useAdminGuard";
import { EXERCISE_PROGRAM } from "@/lib/exerciseProgram";
import { exerciseSlug, parseExerciseVideos, youTubeEmbedUrl } from "@/lib/exerciseVideos";
import { Dumbbell, Save, PlayCircle, CircleCheck, Sprout, Trophy } from "lucide-react";

const G = "#39613B";
const DARK = "#1B201A";

const PHASE_ICON: Record<number, typeof Sprout> = { 1: Sprout, 2: Dumbbell, 3: Trophy };

export default function AdminExercisesPage() {
  const router = useRouter();
  const { checking, username, role } = useAdminGuard(["owner"]);
  async function handleLogout() {
    clearAdminAuthCache();
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }
  const [videos, setVideos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      const raw = data?.content?.exercise_videos;
      setVideos(parseExerciseVideos(typeof raw === "string" ? raw : undefined));
    } catch {
      setError("Failed to load exercise videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveVideo(slug: string, url: string) {
    setError("");
    setSaving(s => ({ ...s, [slug]: true }));
    const next = { ...videos };
    if (url.trim()) next[slug] = url.trim();
    else delete next[slug];

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ key: "exercise_videos", value: JSON.stringify(next) }] }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Save failed.");
      } else {
        setVideos(next);
        setSaved(s => ({ ...s, [slug]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [slug]: false })), 2000);
      }
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(s => ({ ...s, [slug]: false }));
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: G, fontFamily: "Inter, system-ui, sans-serif" }}>Loading...</p>
      </div>
    );
  }

  const totalVideos = Object.values(videos).filter(Boolean).length;
  const totalExercises = EXERCISE_PROGRAM.reduce((n, p) => n + p.days.reduce((m, d) => m + d.exercises.length, 0), 0);

  return (
    <div className="admin-shell" style={{ display: "flex" }}>
      <Sidebar active="/admin/exercises" username={username} role={role} onLogout={handleLogout} />
      <main className="admin-main" style={{ flex: 1, minHeight: "100vh" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="a-page-title">Exercise Videos</h1>
            <p className="a-page-subtitle">Set YouTube video URL per exercise. Customers see videos immediately after save.</p>
          </div>

          <div className="a-card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 13, color: "#4E504F", margin: 0, fontWeight: 600 }}>Coverage</p>
              <p style={{ fontSize: 22, color: G, margin: "4px 0 0", fontWeight: 800 }}>{totalVideos} / {totalExercises}</p>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${totalExercises ? (totalVideos / totalExercises) * 100 : 0}%`, background: G, borderRadius: 999, transition: "width 0.4s" }} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#991b1b", fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ color: "#4E504F" }}>Loading exercises...</p>
          ) : (
            EXERCISE_PROGRAM.map(phase => {
              const Icon = PHASE_ICON[phase.phase] || Dumbbell;
              return (
                <div key={phase.phase} className="a-card" style={{ padding: 20, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: phase.bg, display: "grid", placeItems: "center" }}>
                      <Icon size={22} color={phase.color} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>Phase {phase.phase} — {phase.name}</h2>
                      <p style={{ fontSize: 12, color: "#4E504F", margin: "2px 0 0" }}>{phase.weeks}</p>
                    </div>
                  </div>

                  {phase.days.map(day => (
                    <div key={day.day} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: "#4E504F", fontWeight: 700, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.6 }}>Day {day.day} — {day.title}</p>
                      {day.exercises.map((ex, i) => {
                        const slug = exerciseSlug(phase.phase, day.day, ex.name);
                        const url = videos[slug] || "";
                        const embed = url ? youTubeEmbedUrl(url) : null;
                        return (
                          <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: 0, flex: 1 }}>{ex.name}</p>
                              {embed && <PlayCircle size={18} color={G} />}
                              {saved[slug] && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#166534", fontSize: 12, fontWeight: 700 }}><CircleCheck size={14} /> Saved</span>}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                type="url"
                                className="a-input"
                                placeholder="https://www.youtube.com/watch?v=..."
                                defaultValue={url}
                                onBlur={e => {
                                  const v = e.target.value.trim();
                                  if (v !== url) saveVideo(slug, v);
                                }}
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                className="a-btn a-btn-primary"
                                disabled={saving[slug]}
                                onClick={e => {
                                  const inp = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                  if (inp) saveVideo(slug, inp.value.trim());
                                }}
                              >
                                <Save size={14} /> {saving[slug] ? "Saving..." : "Save"}
                              </button>
                            </div>
                            {url && !embed && (
                              <p style={{ fontSize: 12, color: "#991b1b", margin: "6px 0 0" }}>Invalid YouTube URL. Use youtube.com/watch?v=..., youtu.be/..., or /embed/ URLs.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
