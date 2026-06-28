const KEY = "eb_coach_label";

export function getCoachLabel(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY) || null;
}

export function setCoachLabel(name: string) {
  localStorage.setItem(KEY, name.trim());
}

export function clearCoachLabel() {
  localStorage.removeItem(KEY);
}
