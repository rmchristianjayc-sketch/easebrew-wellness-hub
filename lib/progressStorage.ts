"use client";

export function progressStorageKey(base: string, sessionCode: string | null | undefined) {
  return sessionCode ? `${base}:${sessionCode}` : base;
}

export function readProgressCache<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeProgressCache(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  // localStorage can throw QuotaExceededError on older iOS Safari when
  // the 5MB budget is full (many tabs, dev-only history, etc.). Swallow
  // the failure — the server POST is the source of truth; localStorage
  // is only an offline convenience. Without this try/catch the throw
  // bubbles out of an event handler and looks like the Save button
  // crashed to the customer.
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
