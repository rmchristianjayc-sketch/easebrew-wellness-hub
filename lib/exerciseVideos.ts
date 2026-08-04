export function exerciseSlug(phase: number, day: number, name: string): string {
  const nameSlug = name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `p${phase}-d${day}-${nameSlug}`;
}

export function parseExerciseVideos(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === "string" && typeof v === "string") out[k] = v;
      }
      return out;
    }
  } catch {}
  return {};
}

export function youTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (!m) return null;
  // Senior-friendly YouTube embed params:
  //   rel=0             — no related-video overlay at end
  //   modestbranding=1  — reduce YouTube logo
  //   playsinline=1     — stays inline on iOS (does NOT take over screen)
  //   loop=1&playlist=X — loops the clip (playlist=<id> required for loop)
  //   iv_load_policy=3  — hide creator annotations
  //   disablekb=1       — no keyboard shortcuts (irrelevant on mobile senior)
  // Fullscreen button intentionally kept (allowFullScreen on iframe) —
  // seniors may want larger viewing.
  const id = m[1];
  const params = "rel=0&modestbranding=1&playsinline=1&loop=1&playlist=" + id + "&iv_load_policy=3&disablekb=1";
  return `https://www.youtube.com/embed/${id}?${params}`;
}
