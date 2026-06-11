import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const PROTECTED_CUSTOMER_PATHS = [
  '/',
  '/exercise',
  '/meal-plan',
  '/recipes',
  '/tracker',
  '/bagong-katawan',
];

// ✅ Verify session against Supabase using code + device_id
async function verifySessionInSupabase(code: string, deviceId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/customer_sessions?code=eq.${code}&device_id=eq.${deviceId}&select=id,expires_at`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const data = await res.json();
    if (!data || data.length === 0) return false;
    const session = data[0];
    return new Date(session.expires_at) > new Date();
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ============================================================
  // ADMIN PROTECTION
  // ============================================================
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('eb_admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      const role = payload.role as string;
      if (role === 'coach') {
        const allowedPaths = ['/admin', '/admin/codes'];
        const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(p));
        if (!isAllowed) {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // ============================================================
  // CUSTOMER PAGE PROTECTION
  // ============================================================
  const isProtected = PROTECTED_CUSTOMER_PATHS.some(
    p => pathname === p || pathname.startsWith(p + '/')
  );

  if (isProtected) {
    const sessionCookie = req.cookies.get('eb_session')?.value;

    if (!sessionCookie) {
      const url = new URL('/verify', req.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie));

      // Check local expiry first (fast)
      if (!session.expires_at || new Date(session.expires_at) < new Date()) {
        const response = NextResponse.redirect(new URL('/verify', req.url));
        response.cookies.delete('eb_session');
        return response;
      }

      // ✅ Check if session still exists in Supabase (catches deleted/revoked sessions)
      if (!session.code || !session.device_id) {
        const response = NextResponse.redirect(new URL('/verify', req.url));
        response.cookies.delete('eb_session');
        return response;
      }

      const isValid = await verifySessionInSupabase(session.code, session.device_id);
      if (!isValid) {
        const response = NextResponse.redirect(new URL('/verify', req.url));
        response.cookies.delete('eb_session');
        return response;
      }

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL('/verify', req.url));
      response.cookies.delete('eb_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/',
    '/exercise/:path*',
    '/meal-plan/:path*',
    '/recipes/:path*',
    '/tracker/:path*',
    '/bagong-katawan/:path*',
  ],
};