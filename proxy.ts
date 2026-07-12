import { NextRequest, NextResponse } from 'next/server';
import {
  clearCustomerSessionCookie,
  verifyCustomerToken,
  verifyToken,
} from '@/lib/auth';
import { MINIMUM_TIER_BY_PATH, PROTECTED_CUSTOMER_PATHS } from '@/lib/tierGates';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    if (admin.role === 'coach') {
      const isAllowed =
        pathname === '/admin' ||
        pathname === '/admin/codes' ||
        pathname.startsWith('/admin/codes/');
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/admin/codes', req.url));
      }
    }

    return NextResponse.next();
  }

  const isProtected = PROTECTED_CUSTOMER_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const session = isProtected ? await verifyCustomerToken(req) : null;
  if (isProtected && !session) {
    const url = new URL('/verify', req.url);
    url.searchParams.set('from', pathname);
    const response = NextResponse.redirect(url);
    clearCustomerSessionCookie(response);
    return response;
  }

  if (session) {
    const entitlement = Object.entries(MINIMUM_TIER_BY_PATH).find(
      ([path]) => pathname === path || pathname.startsWith(`${path}/`)
    );
    if (entitlement && session.tier < entitlement[1]) {
      return NextResponse.redirect(new URL('/?locked=1', req.url));
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
    '/blood-pressure/:path*',
    '/medication/:path*',
    '/medical-card/:path*',
    '/bmi/:path*',
    '/report/:path*',
  ],
};
