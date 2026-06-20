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
  localStorage.setItem(key, JSON.stringify(value));
}
