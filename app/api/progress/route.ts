import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { MINIMUM_TIER_BY_TYPE } from '@/lib/tierGates';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const SCHEDULES = new Set(['morning', 'noon', 'evening', 'bedtime']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

function isOptionalString(value: unknown, maxLength: number) {
  return value === undefined || value === null || isString(value, maxLength);
}

function isNumberInRange(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isDate(value: unknown) {
  return typeof value === 'string' && DATE_RE.test(value);
}

function hasEntries(value: unknown): value is { entries: unknown[] } {
  return isPlainObject(value) && Array.isArray(value.entries);
}

function validateTracker(data: unknown) {
  if (!hasEntries(data) || data.entries.length > 500) return false;
  return data.entries.every((entry) => {
    if (!isPlainObject(entry) || !isDate(entry.date)) return false;
    if (entry.painScore !== undefined && !isNumberInRange(entry.painScore, 0, 10)) return false;
    if (entry.mood !== undefined && !isNumberInRange(entry.mood, 0, 10)) return false;
    if (entry.weight !== undefined && !isNumberInRange(entry.weight, 20, 300)) return false;
    if (!isOptionalString(entry.notes, 1000)) return false;
    if (entry.painLocations !== undefined && (
      !Array.isArray(entry.painLocations) ||
      entry.painLocations.length > 20 ||
      !entry.painLocations.every((loc) => isString(loc, 40))
    )) return false;
    return true;
  });
}

function validateBloodPressure(data: unknown) {
  if (!hasEntries(data) || data.entries.length > 1000) return false;
  return data.entries.every((entry) => {
    if (!isPlainObject(entry) || !isDate(entry.date)) return false;
    if (entry.time !== undefined && !isString(entry.time, 5)) return false;
    if (entry.time !== undefined && !TIME_RE.test(String(entry.time))) return false;
    if (!isNumberInRange(entry.systolic, 60, 260)) return false;
    if (!isNumberInRange(entry.diastolic, 40, 200)) return false;
    if (entry.pulse !== undefined && !isNumberInRange(entry.pulse, 30, 220)) return false;
    if (!isOptionalString(entry.notes, 500)) return false;
    return true;
  });
}

function validateMedication(data: unknown) {
  if (!isPlainObject(data)) return false;
  const medications = data.medications;
  const logs = data.logs;
  if (!Array.isArray(medications) || !Array.isArray(logs)) return false;
  if (medications.length > 100 || logs.length > 1000) return false;

  const validMeds = medications.every((med) => {
    if (!isPlainObject(med)) return false;
    if (!isString(med.id, 80) || !isString(med.name, 80)) return false;
    if (typeof med.active !== 'boolean') return false;
    if (!Array.isArray(med.schedules) || med.schedules.length < 1 || med.schedules.length > 4) return false;
    return med.schedules.every((schedule) => typeof schedule === 'string' && SCHEDULES.has(schedule));
  });
  if (!validMeds) return false;

  return logs.every((log) => {
    if (!isPlainObject(log) || !isDate(log.date)) return false;
    if (!Array.isArray(log.taken) || log.taken.length > 400) return false;
    return log.taken.every((taken) => isString(taken, 120));
  });
}

function validateMedicalCard(data: unknown) {
  if (!isPlainObject(data)) return false;
  if (!isString(data.fullName ?? '', 80)) return false;
  if (!isOptionalString(data.bloodType, 20)) return false;
  if (!isOptionalString(data.dateOfBirth, 20)) return false;
  if (!isOptionalString(data.allergies, 500)) return false;
  if (!isOptionalString(data.conditions, 500)) return false;
  if (!isOptionalString(data.currentMedications, 800)) return false;

  const contacts = data.emergencyContacts;
  if (contacts !== undefined) {
    if (!Array.isArray(contacts) || contacts.length > 5) return false;
    const validContacts = contacts.every((contact) =>
      isPlainObject(contact) &&
      isOptionalString(contact.name, 80) &&
      isOptionalString(contact.relationship, 40) &&
      isOptionalString(contact.phone, 30)
    );
    if (!validContacts) return false;
  }

  const doctor = data.primaryDoctor;
  if (doctor !== undefined) {
    if (!isPlainObject(doctor)) return false;
    if (!isOptionalString(doctor.name, 80)) return false;
    if (!isOptionalString(doctor.phone, 30)) return false;
    if (!isOptionalString(doctor.clinic, 80)) return false;
  }

  return true;
}

function validateTestimonial(data: unknown) {
  if (!isPlainObject(data)) return false;
  const quote = data.quote;
  if (!isString(quote, 500) || quote.trim().length < 20) return false;
  if (data.painBefore !== null && data.painBefore !== undefined && !isNumberInRange(data.painBefore, 1, 10)) return false;
  if (data.painAfter !== null && data.painAfter !== undefined && !isNumberInRange(data.painAfter, 1, 10)) return false;
  return isOptionalString(data.submitted_at, 40);
}

function validateProgressData(type: string, data: unknown) {
  switch (type) {
    case 'tracker':
      return validateTracker(data);
    case 'blood_pressure':
      return validateBloodPressure(data);
    case 'medication':
      return validateMedication(data);
    case 'medical_card':
      return validateMedicalCard(data);
    case 'testimonial_submission':
      return validateTestimonial(data);
    case 'mealplan':
      return isPlainObject(data) && Array.isArray(data.days) && data.days.length <= 100;
    case 'exercise':
      return isPlainObject(data) && Array.isArray(data.days) && Array.isArray(data.exercises);
    case 'recipe_favorites':
      return isPlainObject(data) && Array.isArray(data.favorites) && data.favorites.length <= 200;
    case 'bagong_katawan':
      return isPlainObject(data);
    default:
      return false;
  }
}

async function getAuthorizedSession(req: NextRequest, type: string) {
  const session = await verifyCustomerToken(req);
  if (!session) return null;

  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .select('is_used, expires_at, device_id, tier')
    .eq('code', session.code)
    .maybeSingle();

  if (
    error ||
    data?.is_used !== true ||
    data.device_id !== session.device_id ||
    typeof data.expires_at !== 'string' ||
    new Date(data.expires_at).getTime() <= Date.now()
  ) {
    return null;
  }

  // Tier gate uses the DB tier (source of truth), not the token — so an
  // admin-side tier upgrade takes effect immediately and doesn't silently
  // fail all writes until the session cookie is refreshed.
  const minimumTier = MINIMUM_TIER_BY_TYPE[type];
  if (!minimumTier || data.tier < minimumTier) return null;

  return { ...session, tier: data.tier };
}

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get('type') ?? '';
    const session = await getAuthorizedSession(req, type);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('progress')
      .select('data, updated_at')
      .eq('code', session.code)
      .eq('type', type)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data?.data ?? null,
      updated_at: data?.updated_at ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = typeof body.type === 'string' ? body.type : '';
    const session = await getAuthorizedSession(req, type);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (body.data === undefined) {
      return NextResponse.json({ error: 'data is required.' }, { status: 400 });
    }
    if (!validateProgressData(type, body.data)) {
      return NextResponse.json({ error: 'Invalid progress data.' }, { status: 400 });
    }
    if (JSON.stringify(body.data).length > 100_000) {
      return NextResponse.json({ error: 'Progress data is too large.' }, { status: 413 });
    }

    const { error } = await supabaseAdmin
      .from('progress')
      .upsert(
        {
          code: session.code,
          type,
          data: body.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'code,type' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
}
