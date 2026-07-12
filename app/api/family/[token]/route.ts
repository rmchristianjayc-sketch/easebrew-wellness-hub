import { NextRequest, NextResponse } from 'next/server';
import { verifyFamilyShareToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

type TrackerEntry = {
  date: string;
  painScore?: number;
  easebrewUmaga?: boolean;
  easebrewGabi?: boolean;
};

type BpEntry = {
  date: string;
  systolic: number;
  diastolic: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function phDateStr(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function phDateStrOffset(daysOffset: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + daysOffset);
  return phDateStr(d);
}

function getEntries(value: unknown): unknown[] {
  if (typeof value !== 'object' || value === null) return [];
  const data = value as { entries?: unknown };
  return Array.isArray(data.entries) ? data.entries : Array.isArray(value) ? value : [];
}

function parseTrackerEntries(value: unknown): TrackerEntry[] {
  return getEntries(value).flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const row = entry as Record<string, unknown>;
    if (typeof row.date !== 'string' || !DATE_RE.test(row.date)) return [];
    return [{
      date: row.date,
      painScore: typeof row.painScore === 'number' && row.painScore >= 0 && row.painScore <= 10
        ? row.painScore
        : undefined,
      easebrewUmaga: row.easebrewUmaga === true,
      easebrewGabi: row.easebrewGabi === true,
    }];
  });
}

function parseBpEntries(value: unknown): BpEntry[] {
  return getEntries(value).flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const row = entry as Record<string, unknown>;
    if (typeof row.date !== 'string' || !DATE_RE.test(row.date)) return [];
    if (typeof row.systolic !== 'number' || row.systolic < 60 || row.systolic > 260) return [];
    if (typeof row.diastolic !== 'number' || row.diastolic < 40 || row.diastolic > 200) return [];
    return [{ date: row.date, systolic: row.systolic, diastolic: row.diastolic }];
  });
}

function buildFamilySummary(progress: Record<string, unknown>) {
  const weekDates = Array.from({ length: 7 }, (_, index) => phDateStrOffset(index - 6));
  const trackerByDate = new Map(parseTrackerEntries(progress.tracker).map((entry) => [entry.date, entry]));
  const daysLogged = weekDates.filter((date) => trackerByDate.has(date)).length;
  const easebrewCount = weekDates.filter((date) => {
    const entry = trackerByDate.get(date);
    return entry?.easebrewUmaga || entry?.easebrewGabi;
  }).length;
  const painValues = weekDates
    .map((date) => trackerByDate.get(date)?.painScore)
    .filter((value): value is number => typeof value === 'number');
  const avgPain = painValues.length
    ? Math.round((painValues.reduce((sum, value) => sum + value, 0) / painValues.length) * 10) / 10
    : null;

  const bpEntries = parseBpEntries(progress.blood_pressure).filter((entry) => weekDates.includes(entry.date));
  const bpAvg = bpEntries.length
    ? {
        sys: Math.round(bpEntries.reduce((sum, entry) => sum + entry.systolic, 0) / bpEntries.length),
        dia: Math.round(bpEntries.reduce((sum, entry) => sum + entry.diastolic, 0) / bpEntries.length),
      }
    : null;

  return {
    weekDates,
    loggedDates: weekDates.filter((date) => trackerByDate.has(date)),
    daysLogged,
    easebrewCount,
    avgPain,
    bpAvg,
    bpReadingsCount: bpEntries.length,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const payload = await verifyFamilyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired share link.' }, { status: 404 });
    }

    // Ensure the underlying access code is still active — if the coach
    // deactivated it, or the pack has expired, refuse even if the share
    // token itself is still within its 7-day window.
    const { data: codeRow } = await supabaseAdmin
      .from('access_codes')
      .select('is_used, expires_at')
      .eq('code', payload.code)
      .maybeSingle();
    if (!codeRow || !codeRow.is_used || !codeRow.expires_at ||
        new Date(codeRow.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Share link is no longer available.' }, { status: 410 });
    }

    // Return only computed summary fields, not raw health logs.
    const { data: progressRows } = await supabaseAdmin
      .from('progress')
      .select('type, data, updated_at')
      .eq('code', payload.code)
      .in('type', ['tracker', 'blood_pressure']);

    const progress: Record<string, unknown> = {};
    for (const row of progressRows || []) {
      progress[row.type] = row.data;
    }

    return NextResponse.json({
      success: true,
      name: payload.name,
      summary: buildFamilySummary(progress),
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
