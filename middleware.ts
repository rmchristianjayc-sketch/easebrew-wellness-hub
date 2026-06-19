import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);

const PROTECTED_CUSTOMER_PATHS = [
  '/',
  '/exercise',
  '/meal-plan',
  '/recipes',
  '/tracker',
  '/bagong-katawan',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ============================================================
  // ADMIN PROTECTION — JWT verify lang, walang Supabase fetch
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
  // CUSTOMER PAGE PROTECTION — cookie expiry check lang
  // ✅ REMOVED: verifySessionInSupabase() — nagdadagdag ng 200-400ms
  //    sa bawat page load. Hindi kailangan sa middleware.
  //    Kung gusto mo i-verify ang Supabase, gawin sa API routes
  //    (e.g. /api/verify-code) kung saan isang beses lang nire-run.
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

      // Walang code o device_id — invalid session
      if (!session.code || !session.device_id || !session.expires_at) {
        const res = NextResponse.redirect(new URL('/verify', req.url));
        res.cookies.delete('eb_session');
        return res;
      }

      // Expired na — redirect at clear cookie
      if (new Date(session.expires_at) < new Date()) {
        const res = NextResponse.redirect(new URL('/verify', req.url));
        res.cookies.delete('eb_session');
        return res;
      }

      // ✅ Cookie valid at hindi pa expired — payagan
      return NextResponse.next();

    } catch {
      const res = NextResponse.redirect(new URL('/verify', req.url));
      res.cookies.delete('eb_session');
      return res;
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